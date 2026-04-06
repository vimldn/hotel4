import { NextRequest, NextResponse } from 'next/server'
import { postToScript } from '@/lib/sheets'
import { sendHotelWelcomeEmail } from '@/lib/email'
import { TAG_LABEL } from '@/lib/semantic-tags'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      hotel_name, contact_name, email,
      location, location_area,
      tags = [], direct_booking_url = '', webhook_note = '',
    } = body

    if (!hotel_name || !contact_name || !email || !location) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields' },
        { status: 422 }
      )
    }

    const tag_labels = (tags as string[]).map((t) => TAG_LABEL[t] ?? t)
    const registered_at = new Date().toISOString()

    // 1. Write to Google Sheet
    await postToScript({
      action: 'register_hotel',
      hotel_name, contact_name, email,
      location, location_area: location_area ?? location,
      tags, tag_labels, direct_booking_url,
      webhook_note, registered_at,
    })

    // 2. Welcome email to hotel
    await sendHotelWelcomeEmail({
      hotel_name, contact_name, email,
      location_area: location_area ?? location,
      tag_labels,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[register-hotel]', err)
    return NextResponse.json(
      { ok: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
