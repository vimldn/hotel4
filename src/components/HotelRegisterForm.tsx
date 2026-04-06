'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TAGS_BY_CATEGORY } from '@/lib/semantic-tags'

interface FormData {
  hotel_name: string
  contact_name: string
  email: string
  location: string
  location_area: string
  direct_booking_url: string
  tags: string[]
  webhook_note: string
}

const INITIAL: FormData = {
  hotel_name: '', contact_name: '', email: '',
  location: '', location_area: '',
  direct_booking_url: '', tags: [], webhook_note: '',
}

export default function HotelRegisterForm() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>(INITIAL)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setError('')
  }

  function toggleTag(tagId: string) {
    set('tags', form.tags.includes(tagId)
      ? form.tags.filter((t) => t !== tagId)
      : [...form.tags, tagId]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.hotel_name || !form.contact_name || !form.email || !form.location) {
      setError('Please fill in all required fields')
      return
    }
    if (!form.email.includes('@')) {
      setError('Enter a valid email address')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/register-hotel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error ?? 'Something went wrong')
      router.push('/hotels/confirm')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Hotel basics */}
      <div className="rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Hotel details</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Hotel name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="The Grand Hotel"
              value={form.hotel_name}
              onChange={(e) => set('hotel_name', e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">Your name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Revenue manager name"
              value={form.contact_name}
              onChange={(e) => set('contact_name', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="form-label">Email address *</label>
          <input
            type="email"
            className="form-input"
            placeholder="revenue@yourhotel.com"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
          />
          <p className="mt-1 text-xs text-gray-400">Briefs are sent here. You reply directly to the traveller.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Hotel address / city *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 12 High St, London EC1"
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">Area / neighbourhood</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Shoreditch, London"
              value={form.location_area}
              onChange={(e) => set('location_area', e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-400">Used to match traveller destination searches</p>
          </div>
        </div>

        <div>
          <label className="form-label">Direct booking URL</label>
          <input
            type="url"
            className="form-input"
            placeholder="https://book.yourhotel.com"
            value={form.direct_booking_url}
            onChange={(e) => set('direct_booking_url', e.target.value)}
          />
          <p className="mt-1 text-xs text-gray-400">Included in each brief so you can link travellers here when you reply</p>
        </div>
      </div>

      {/* Capabilities */}
      <div className="rounded-xl border border-gray-200 p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">Your capabilities</h3>
          <p className="text-xs text-gray-400 mt-1">
            Only tick what you can genuinely guarantee. We match briefs to you based on these.
            Only confirming what's true builds trust with travellers.
          </p>
        </div>

        {form.tags.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
              {form.tags.length} selected
            </span>
            <button type="button" onClick={() => set('tags', [])} className="text-xs text-gray-400 hover:text-gray-600">
              Clear all
            </button>
          </div>
        )}

        <div className="space-y-5">
          {Object.entries(TAGS_BY_CATEGORY).map(([category, tags]) => (
            <div key={category}>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">{category}</p>
              <div className="grid grid-cols-2 gap-2">
                {tags.map((tag) => {
                  const selected = form.tags.includes(tag.id)
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`flex items-center gap-2.5 rounded-lg border p-3 text-left text-sm transition-all ${
                        selected
                          ? 'border-blue-500 bg-blue-50 text-blue-800 font-medium'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`h-4 w-4 flex-shrink-0 rounded flex items-center justify-center text-xs ${
                        selected ? 'bg-blue-600 text-white' : 'border border-gray-300'
                      }`}>
                        {selected && '✓'}
                      </span>
                      {tag.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optional note */}
      <div>
        <label className="form-label">
          Anything to add? <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          rows={3}
          className="form-input resize-none"
          placeholder="e.g. We're a boutique property — we're happy to be flexible on rates for direct bookings. Contact us to discuss."
          value={form.webhook_note}
          onChange={(e) => set('webhook_note', e.target.value)}
          maxLength={500}
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
        {loading ? (
          <>
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            Registering…
          </>
        ) : (
          'Register hotel →'
        )}
      </button>
    </form>
  )
}
