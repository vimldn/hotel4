/**
 * Posts data to the Google Apps Script web app.
 * The script writes to Google Sheets and returns matching hotels.
 */

const SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL!

export interface BriefPayload {
  action: 'submit_brief'
  name: string
  email: string
  location: string
  check_in: string
  check_out: string
  guests: number
  budget_min: number
  budget_max: number
  currency: string
  tags: string[]
  tag_labels: string[]
  free_text: string
  submitted_at: string
}

export interface HotelPayload {
  action: 'register_hotel'
  hotel_name: string
  contact_name: string
  email: string
  location: string
  location_area: string
  webhook_note: string
  tags: string[]
  tag_labels: string[]
  direct_booking_url: string
  registered_at: string
}

export interface MatchedHotel {
  hotel_name: string
  email: string
  location_area: string
  direct_booking_url: string
  matched_tags: string[]
}

export interface ScriptResponse {
  ok: boolean
  matched_hotels?: MatchedHotel[]
  error?: string
}

export async function postToScript(
  payload: BriefPayload | HotelPayload
): Promise<ScriptResponse> {
  if (!SCRIPT_URL) {
    console.warn('[sheets] GOOGLE_SCRIPT_URL not set — skipping')
    return { ok: true, matched_hotels: [] }
  }

  try {
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      console.error('[sheets] Script returned', res.status)
      return { ok: false, error: `Script error: ${res.status}` }
    }

    const data = await res.json()
    return data as ScriptResponse
  } catch (err) {
    console.error('[sheets] Fetch error:', err)
    return { ok: false, error: String(err) }
  }
}
