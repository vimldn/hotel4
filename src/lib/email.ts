import { Resend } from 'resend'
import type { MatchedHotel } from './sheets'
import { TAG_LABEL } from './semantic-tags'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = `${process.env.RESEND_FROM_NAME ?? 'OTA-Killer'} <${process.env.RESEND_FROM_EMAIL ?? 'briefs@yourdomain.com'}>`
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yourdomain.com'

// ─────────────────────────────────────────────
// Email to traveller after submitting brief
// ─────────────────────────────────────────────
export async function sendBriefConfirmationToTraveller(params: {
  name: string
  email: string
  location: string
  check_in: string
  check_out: string
  guests: number
  budget_min: number
  budget_max: number
  currency: string
  tag_labels: string[]
  free_text: string
  hotel_count: number
}) {
  const {
    name, email, location, check_in, check_out,
    guests, budget_min, budget_max, currency,
    tag_labels, free_text, hotel_count,
  } = params

  const subject = `Your brief is live — ${hotel_count} hotel${hotel_count !== 1 ? 's' : ''} in ${location} have been notified`

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,system-ui,sans-serif;color:#1e293b">
  <div style="max-width:560px;margin:40px auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">

    <div style="background:#1d4ed8;padding:28px 32px">
      <div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:6px">
        <div style="background:rgba(255,255,255,0.2);border-radius:6px;padding:4px 10px;font-size:12px;font-weight:600;color:#fff;letter-spacing:0.05em">OTA-KILLER</div>
      </div>
      <h1 style="margin:0;font-size:22px;font-weight:600;color:#fff;line-height:1.3">Your brief is live</h1>
      <p style="margin:6px 0 0;font-size:14px;color:#bfdbfe">Hotels are being notified now</p>
    </div>

    <div style="padding:28px 32px">
      <p style="margin:0 0 20px;font-size:15px;color:#475569">Hi ${name},</p>
      <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6">
        Your trip brief has been sent to <strong style="color:#1d4ed8">${hotel_count} hotel${hotel_count !== 1 ? 's' : ''} in ${location}</strong>.
        They'll reply directly to this email with their private rate. You're under no obligation to accept anything.
      </p>

      <div style="background:#f1f5f9;border-radius:10px;padding:20px;margin-bottom:24px">
        <p style="margin:0 0 12px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#64748b">Your brief</p>
        <table style="width:100%;font-size:14px;border-collapse:collapse">
          <tr><td style="padding:4px 0;color:#64748b;width:40%">Destination</td><td style="padding:4px 0;font-weight:500">${location}</td></tr>
          <tr><td style="padding:4px 0;color:#64748b">Dates</td><td style="padding:4px 0;font-weight:500">${check_in} → ${check_out}</td></tr>
          <tr><td style="padding:4px 0;color:#64748b">Guests</td><td style="padding:4px 0;font-weight:500">${guests}</td></tr>
          <tr><td style="padding:4px 0;color:#64748b">Budget/night</td><td style="padding:4px 0;font-weight:500">${currency}${budget_min} – ${currency}${budget_max}</td></tr>
        </table>

        ${tag_labels.length ? `
        <div style="margin-top:12px;padding-top:12px;border-top:1px solid #e2e8f0">
          <p style="margin:0 0 8px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#64748b">Your requirements</p>
          <div style="display:flex;flex-wrap:wrap;gap:6px">
            ${tag_labels.map(l => `<span style="background:#dbeafe;color:#1e40af;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:500">${l}</span>`).join('')}
          </div>
        </div>` : ''}

        ${free_text ? `
        <div style="margin-top:12px;padding-top:12px;border-top:1px solid #e2e8f0">
          <p style="margin:0 0 4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#64748b">Your note to hotels</p>
          <p style="margin:0;font-size:13px;color:#475569;font-style:italic">"${free_text}"</p>
        </div>` : ''}
      </div>

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px 16px;margin-bottom:24px">
        <p style="margin:0;font-size:13px;color:#15803d;line-height:1.5">
          <strong>What happens next:</strong> Hotels contact you directly at this email address with their private rate. 
          These rates aren't on Expedia — hotels keep their full margin by skipping commission.
          Reply to whichever offer suits you best.
        </p>
      </div>

      <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6">
        If you don't hear back within 24 hours, it means no hotels in your area matched your requirements — 
        try broadening your dates or adjusting your tags.
      </p>
    </div>

    <div style="padding:16px 32px;border-top:1px solid #f1f5f9;background:#f8fafc">
      <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center">
        OTA-Killer · We never store your payment details · <a href="${SITE}" style="color:#3b82f6">otakiller.com</a>
      </p>
    </div>
  </div>
</body>
</html>`

  return resend.emails.send({ from: FROM, to: email, subject, html })
}

// ─────────────────────────────────────────────
// Email to hotel when a matching brief comes in
// ─────────────────────────────────────────────
export async function sendBriefToHotel(params: {
  hotel: MatchedHotel
  traveller_email: string
  traveller_name: string
  location: string
  check_in: string
  check_out: string
  guests: number
  budget_min: number
  budget_max: number
  currency: string
  tag_labels: string[]
  free_text: string
}) {
  const {
    hotel, traveller_email, traveller_name,
    location, check_in, check_out, guests,
    budget_min, budget_max, currency,
    tag_labels, free_text,
  } = params

  const matchedLabels = hotel.matched_tags.map(t => TAG_LABEL[t] ?? t)
  const nights = nightsBetween(check_in, check_out)

  const subject = `New intent brief — ${location} · ${check_in} (${nights}n) · ${currency}${budget_min}–${currency}${budget_max}/night`

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,system-ui,sans-serif;color:#1e293b">
  <div style="max-width:560px;margin:40px auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">

    <div style="background:#0f172a;padding:28px 32px">
      <div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:6px">
        <div style="background:rgba(255,255,255,0.1);border-radius:6px;padding:4px 10px;font-size:12px;font-weight:600;color:#94a3b8;letter-spacing:0.05em">OTA-KILLER · HOTEL BRIEF</div>
      </div>
      <h1 style="margin:0;font-size:22px;font-weight:600;color:#fff;line-height:1.3">New intent brief for ${hotel.hotel_name}</h1>
      <p style="margin:6px 0 0;font-size:14px;color:#64748b">A traveller is looking for a hotel in your area</p>
    </div>

    <div style="padding:28px 32px">
      <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:14px 16px;margin-bottom:24px">
        <p style="margin:0;font-size:13px;color:#92400e;line-height:1.5">
          <strong>Reply directly to this email</strong> with your private rate. The traveller's address is 
          <strong>${traveller_email}</strong>. You are not committed to anything by receiving this brief.
        </p>
      </div>

      <div style="background:#f1f5f9;border-radius:10px;padding:20px;margin-bottom:20px">
        <p style="margin:0 0 12px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#64748b">The brief</p>
        <table style="width:100%;font-size:14px;border-collapse:collapse">
          <tr><td style="padding:5px 0;color:#64748b;width:40%">Destination</td><td style="padding:5px 0;font-weight:500">${location}</td></tr>
          <tr><td style="padding:5px 0;color:#64748b">Check-in</td><td style="padding:5px 0;font-weight:500">${check_in}</td></tr>
          <tr><td style="padding:5px 0;color:#64748b">Check-out</td><td style="padding:5px 0;font-weight:500">${check_out}</td></tr>
          <tr><td style="padding:5px 0;color:#64748b">Nights</td><td style="padding:5px 0;font-weight:500">${nights}</td></tr>
          <tr><td style="padding:5px 0;color:#64748b">Guests</td><td style="padding:5px 0;font-weight:500">${guests}</td></tr>
          <tr><td style="padding:5px 0;color:#64748b">Budget/night</td><td style="padding:5px 0;font-weight:600;color:#1d4ed8;font-size:15px">${currency}${budget_min} – ${currency}${budget_max}</td></tr>
        </table>

        ${tag_labels.length ? `
        <div style="margin-top:14px;padding-top:14px;border-top:1px solid #e2e8f0">
          <p style="margin:0 0 8px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#64748b">All requirements</p>
          <div>
            ${tag_labels.map(l => `<span style="display:inline-block;margin:2px 4px 2px 0;background:#f1f5f9;color:#334155;padding:3px 10px;border-radius:20px;font-size:12px">${l}</span>`).join('')}
          </div>
        </div>` : ''}

        ${matchedLabels.length ? `
        <div style="margin-top:14px;padding-top:14px;border-top:1px solid #e2e8f0">
          <p style="margin:0 0 8px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#64748b">You match these</p>
          <div>
            ${matchedLabels.map(l => `<span style="display:inline-block;margin:2px 4px 2px 0;background:#dcfce7;color:#15803d;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:500">✓ ${l}</span>`).join('')}
          </div>
        </div>` : ''}

        ${free_text ? `
        <div style="margin-top:14px;padding-top:14px;border-top:1px solid #e2e8f0">
          <p style="margin:0 0 4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#64748b">Traveller note</p>
          <p style="margin:0;font-size:13px;color:#475569;font-style:italic">"${free_text}"</p>
        </div>` : ''}
      </div>

      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:18px 20px;margin-bottom:20px">
        <p style="margin:0 0 10px;font-size:13px;font-weight:600;color:#1e40af">How to respond</p>
        <p style="margin:0 0 6px;font-size:13px;color:#1e40af;line-height:1.6">Hit reply and include:</p>
        <ul style="margin:0;padding-left:18px;font-size:13px;color:#1d4ed8;line-height:1.8">
          <li>Your private rate per night (this is between you and the traveller — not on any OTA)</li>
          <li>Room type and any included perks (late checkout, breakfast, credits)</li>
          <li>Which of their requirements you can confirm</li>
          <li>A booking link or instructions for how they pay you directly</li>
        </ul>
      </div>

      <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6">
        This brief expires in 72 hours. The traveller may receive bids from other hotels.
        The sharpest offer that confirms their requirements wins the booking.
      </p>
    </div>

    <div style="padding:16px 32px;border-top:1px solid #f1f5f9;background:#f8fafc">
      <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center">
        OTA-Killer · Commission-free hotel matching · <a href="${SITE}" style="color:#3b82f6">otakiller.com</a><br>
        You receive these emails because you registered ${hotel.hotel_name} on OTA-Killer.
      </p>
    </div>
  </div>
</body>
</html>`

  return resend.emails.send({
    from: FROM,
    to: hotel.email,
    replyTo: traveller_email,
    subject,
    html,
  })
}

// ─────────────────────────────────────────────
// Confirmation email to hotel after registering
// ─────────────────────────────────────────────
export async function sendHotelWelcomeEmail(params: {
  hotel_name: string
  contact_name: string
  email: string
  location_area: string
  tag_labels: string[]
}) {
  const { hotel_name, contact_name, email, location_area, tag_labels } = params

  const subject = `${hotel_name} is registered on OTA-Killer — you'll start receiving briefs shortly`

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,system-ui,sans-serif;color:#1e293b">
  <div style="max-width:560px;margin:40px auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">

    <div style="background:#1d4ed8;padding:28px 32px">
      <div style="background:rgba(255,255,255,0.2);display:inline-block;border-radius:6px;padding:4px 10px;font-size:12px;font-weight:600;color:#fff;letter-spacing:0.05em;margin-bottom:6px">OTA-KILLER</div>
      <h1 style="margin:0;font-size:22px;font-weight:600;color:#fff">Welcome, ${hotel_name}</h1>
      <p style="margin:6px 0 0;font-size:14px;color:#bfdbfe">You'll start receiving matching intent briefs by email</p>
    </div>

    <div style="padding:28px 32px">
      <p style="margin:0 0 16px;font-size:15px;color:#475569">Hi ${contact_name},</p>
      <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6">
        ${hotel_name} is now registered. When a traveller submits a brief that matches your location 
        (${location_area}) and capabilities, you'll receive it directly to this inbox.
      </p>

      <div style="background:#f1f5f9;border-radius:10px;padding:18px;margin-bottom:20px">
        <p style="margin:0 0 10px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#64748b">Your registered capabilities</p>
        <div>
          ${tag_labels.map(l => `<span style="display:inline-block;margin:3px 4px 3px 0;background:#dbeafe;color:#1e40af;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:500">${l}</span>`).join('')}
        </div>
        ${!tag_labels.length ? '<p style="margin:0;font-size:13px;color:#94a3b8">No capabilities registered — you\'ll receive all briefs in your area.</p>' : ''}
      </div>

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px 16px;margin-bottom:20px">
        <p style="margin:0;font-size:13px;color:#15803d;line-height:1.5">
          <strong>The maths:</strong> At £250 ADR, one OTA booking costs ~£50 in commission. 
          There's no subscription fee in our MVP — just reply to briefs and keep your full margin.
        </p>
      </div>

      <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6">
        Questions? Reply to this email.<br>
        Want to update your capabilities or location? Email us at <a href="mailto:hotels@otakiller.com" style="color:#3b82f6">hotels@otakiller.com</a>.
      </p>
    </div>

    <div style="padding:16px 32px;border-top:1px solid #f1f5f9;background:#f8fafc">
      <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center">
        OTA-Killer · Commission-free hotel matching · <a href="${SITE}" style="color:#3b82f6">otakiller.com</a>
      </p>
    </div>
  </div>
</body>
</html>`

  return resend.emails.send({ from: FROM, to: email, subject, html })
}

// ─────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────
function nightsBetween(checkIn: string, checkOut: string): number {
  const a = new Date(checkIn)
  const b = new Date(checkOut)
  return Math.max(1, Math.round((b.getTime() - a.getTime()) / 86400000))
}
