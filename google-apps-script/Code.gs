/**
 * OTA-Killer — Google Apps Script
 * ─────────────────────────────────────────────────────────────
 * Deployment instructions are at the bottom of this file.
 *
 * This script handles two actions:
 *
 *   action: "register_hotel"
 *     → Writes hotel to the Hotels sheet
 *     → Returns { ok: true }
 *
 *   action: "submit_brief"
 *     → Writes brief to the Briefs sheet
 *     → Reads Hotels sheet and finds matching hotels
 *       (matching = same location area + at least one tag overlap)
 *     → Returns { ok: true, matched_hotels: [...] }
 *       where matched_hotels is the array your Next.js API uses
 *       to send brief emails to hotels
 */

// ─────────────────────────────────────────────
// Sheet names — change these if you rename them
// ─────────────────────────────────────────────
var HOTELS_SHEET  = 'Hotels';
var BRIEFS_SHEET  = 'Briefs';
var SPREADSHEET_ID = ''; // Leave blank — script uses the bound spreadsheet.
                          // If deploying standalone, paste your Sheet ID here.

// ─────────────────────────────────────────────
// Entry point — handles all POST requests
// ─────────────────────────────────────────────
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var action  = payload.action;

    if (action === 'register_hotel') {
      return handleRegisterHotel(payload);
    }

    if (action === 'submit_brief') {
      return handleSubmitBrief(payload);
    }

    return jsonResponse({ ok: false, error: 'Unknown action: ' + action });

  } catch (err) {
    return jsonResponse({ ok: false, error: err.toString() });
  }
}

// Also handle GET so you can test the URL in a browser
function doGet() {
  return ContentService.createTextOutput('OTA-Killer script is running.');
}

// ─────────────────────────────────────────────
// Register a hotel
// ─────────────────────────────────────────────
function handleRegisterHotel(payload) {
  var sheet = getOrCreateSheet(HOTELS_SHEET, [
    'Registered At',
    'Hotel Name',
    'Contact Name',
    'Email',
    'Location',
    'Location Area',
    'Direct Booking URL',
    'Tags (IDs)',
    'Tag Labels',
    'Note',
    'Active'
  ]);

  sheet.appendRow([
    payload.registered_at      || new Date().toISOString(),
    payload.hotel_name         || '',
    payload.contact_name       || '',
    payload.email              || '',
    payload.location           || '',
    payload.location_area      || payload.location || '',
    payload.direct_booking_url || '',
    (payload.tags        || []).join(', '),
    (payload.tag_labels  || []).join(', '),
    payload.webhook_note       || '',
    'YES'
  ]);

  return jsonResponse({ ok: true });
}

// ─────────────────────────────────────────────
// Submit a brief and return matched hotels
// ─────────────────────────────────────────────
function handleSubmitBrief(payload) {
  // 1. Write brief to Briefs sheet
  var briefs = getOrCreateSheet(BRIEFS_SHEET, [
    'Submitted At',
    'Name',
    'Email',
    'Location',
    'Check-in',
    'Check-out',
    'Guests',
    'Budget Min',
    'Budget Max',
    'Currency',
    'Tags (IDs)',
    'Tag Labels',
    'Free Text',
    'Hotels Notified'
  ]);

  // We'll fill in Hotels Notified at the end
  var briefRow = briefs.getLastRow() + 1;

  briefs.appendRow([
    payload.submitted_at || new Date().toISOString(),
    payload.name         || '',
    payload.email        || '',
    payload.location     || '',
    payload.check_in     || '',
    payload.check_out    || '',
    payload.guests       || 1,
    payload.budget_min   || 0,
    payload.budget_max   || 0,
    payload.currency     || 'GBP',
    (payload.tags       || []).join(', '),
    (payload.tag_labels || []).join(', '),
    payload.free_text    || '',
    '' // Hotels Notified — filled in below
  ]);

  // 2. Find matching hotels
  var matched = findMatchingHotels(
    payload.location || '',
    payload.tags     || []
  );

  // 3. Update Hotels Notified count on the brief row
  briefs.getRange(briefRow, 14).setValue(matched.length);

  return jsonResponse({
    ok: true,
    matched_hotels: matched
  });
}

// ─────────────────────────────────────────────
// Hotel matching logic
//
// A hotel matches a brief when:
//   (a) Location area overlaps (case-insensitive substring match)
//   (b) At least one tag overlaps — OR hotel has no tags registered
//       (un-tagged hotels receive everything in their area)
// ─────────────────────────────────────────────
function findMatchingHotels(briefLocation, briefTags) {
  var hotelsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOTELS_SHEET);

  // No hotels sheet yet — return empty
  if (!hotelsSheet) return [];

  var data        = hotelsSheet.getDataRange().getValues();
  var headers     = data[0];
  var rows        = data.slice(1);

  // Column indices (0-based, matches appendRow above)
  var COL_HOTEL_NAME          = 1;
  var COL_EMAIL               = 3;
  var COL_LOCATION            = 4;
  var COL_LOCATION_AREA       = 5;
  var COL_DIRECT_BOOKING_URL  = 6;
  var COL_TAGS                = 7;  // comma-separated tag IDs
  var COL_ACTIVE              = 10;

  var matched = [];

  rows.forEach(function(row) {
    // Skip inactive hotels
    if (String(row[COL_ACTIVE]).toUpperCase() !== 'YES') return;

    var hotelEmail = String(row[COL_EMAIL] || '').trim();
    if (!hotelEmail || !hotelEmail.includes('@')) return;

    // Location match — brief location contains hotel area, or vice versa
    var hotelArea     = String(row[COL_LOCATION_AREA] || row[COL_LOCATION] || '').toLowerCase().trim();
    var briefLoc      = briefLocation.toLowerCase().trim();
    var locationMatch = hotelArea.length > 0
      ? briefLoc.includes(hotelArea) || hotelArea.includes(briefLoc)
      : false;

    if (!locationMatch) return;

    // Tag match
    var rawTags     = String(row[COL_TAGS] || '').trim();
    var hotelTags   = rawTags.length > 0
      ? rawTags.split(',').map(function(t) { return t.trim(); })
      : [];

    // If hotel has no tags → receives all briefs in area
    var matchedTags = [];
    if (hotelTags.length === 0) {
      matchedTags = briefTags;
    } else {
      matchedTags = briefTags.filter(function(t) {
        return hotelTags.indexOf(t) !== -1;
      });
      // Must share at least one tag
      if (matchedTags.length === 0) return;
    }

    matched.push({
      hotel_name:         String(row[COL_HOTEL_NAME]         || '').trim(),
      email:              hotelEmail,
      location_area:      String(row[COL_LOCATION_AREA]      || '').trim(),
      direct_booking_url: String(row[COL_DIRECT_BOOKING_URL] || '').trim(),
      matched_tags:       matchedTags
    });
  });

  return matched;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet(name, headers) {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);

  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    // Bold the header row
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  return sheet;
}

/**
 * ═══════════════════════════════════════════════════════════════
 * DEPLOYMENT INSTRUCTIONS
 * ═══════════════════════════════════════════════════════════════
 *
 * OPTION A — Bound to a Google Sheet (recommended, easiest):
 *
 *   1. Open Google Sheets → create a new spreadsheet
 *   2. Extensions → Apps Script
 *   3. Delete the default code and paste this entire file
 *   4. Click Deploy → New deployment
 *   5. Type: Web app
 *   6. Execute as: Me
 *   7. Who has access: Anyone
 *   8. Click Deploy → copy the Web app URL
 *   9. Paste that URL into GOOGLE_SCRIPT_URL in your .env.local
 *
 * OPTION B — Standalone script:
 *
 *   1. Go to script.google.com → New project
 *   2. Paste this file
 *   3. Paste your Google Sheet ID into SPREADSHEET_ID above
 *      (Sheet ID is the long string in the Sheet URL)
 *   4. Change SpreadsheetApp.getActiveSpreadsheet() to
 *      SpreadsheetApp.openById(SPREADSHEET_ID) in both functions
 *   5. Deploy as above
 *
 * TESTING:
 *   After deploying, visit the Web app URL in your browser.
 *   You should see: "OTA-Killer script is running."
 *   If you see a permissions error, re-deploy and grant access.
 *
 * RE-DEPLOYING AFTER CODE CHANGES:
 *   Deploy → Manage deployments → Edit (pencil) → New version → Deploy
 *   The URL stays the same — you don't need to update your .env.
 *
 * ═══════════════════════════════════════════════════════════════
 */
