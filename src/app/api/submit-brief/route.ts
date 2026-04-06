import { NextRequest, NextResponse } from 'next/server'
import { postToScript } from '@/lib/sheets'
import {
  sendBriefConfirmationToTraveller,
  sendBriefToHotel,
} from '@/lib/email'
import { TAG_LABEL } from '@/lib/semantic-tags'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      name, email, location, check_in, check_out,
      guests, budget_min, budget_max, currency = 'GBP',
      tags = [], free_text = '',
    } = body

    // Basic validation
    if (!name || !email || !location || !check_in || !check_out) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields' },
        { status: 422 }
      )
    }

    const tag_labels = (tags as string[]).map((t) => TAG_LABEL[t] ?? t)
    const submitted_at = new Date().toISOString()

    // 1. Write to Google Sheet + get matching hotels back
    const scriptRes = await postToScript({
      action: 'submit_brief',
      name, email, location, check_in, check_out,
      guests: Number(guests),
      budget_min: Number(budget_min),
      budget_max: Number(budget_max),
      currency, tags, tag_labels, free_text, submitted_at,
    })

    const matchedHotels = scriptRes.matched_hotels ?? []

    // 2. Email confirmation to traveller
    await sendBriefConfirmationToTraveller({
      name, email, location, check_in, check_out,
      guests: Number(guests),
      budget_min: Number(budget_min),
      budget_max: Number(budget_max),
      currency, tag_labels, free_text,
      hotel_count: matchedHotels.length,
    })

    // 3. Email each matched hotel (in parallel)
    if (matchedHotels.length > 0) {
      await Promise.allSettled(
        matchedHotels.map((hotel) =>
          sendBriefToHotel({
            hotel,
            traveller_email: email,
            traveller_name: name,
            location, check_in, check_out,
            guests: Number(guests),
            budget_min: Number(budget_min),
            budget_max: Number(budget_max),
            currency, tag_labels, free_text,
          })
        )
      )
    }

    return NextResponse.json({
      ok: true,
      hotels_notified: matchedHotels.length,
    })
  } catch (err) {
    console.error('[submit-brief]', err)
    return NextResponse.json(
      { ok: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
