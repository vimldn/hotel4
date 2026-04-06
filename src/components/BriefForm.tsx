'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TAGS_BY_CATEGORY } from '@/lib/semantic-tags'

type Step = 1 | 2 | 3

interface FormData {
  // Step 1
  name: string
  email: string
  location: string
  check_in: string
  check_out: string
  guests: number
  // Step 2
  budget_min: number
  budget_max: number
  currency: string
  tags: string[]
  free_text: string
}

const INITIAL: FormData = {
  name: '', email: '', location: '',
  check_in: '', check_out: '', guests: 1,
  budget_min: 100, budget_max: 300, currency: 'GBP',
  tags: [], free_text: '',
}

const today = new Date().toISOString().split('T')[0]

export default function BriefForm() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
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

  function validateStep1() {
    if (!form.name.trim()) return 'Enter your name'
    if (!form.email.trim() || !form.email.includes('@')) return 'Enter a valid email'
    if (!form.location.trim()) return 'Enter your destination'
    if (!form.check_in) return 'Choose a check-in date'
    if (!form.check_out) return 'Choose a check-out date'
    if (form.check_out <= form.check_in) return 'Check-out must be after check-in'
    return ''
  }

  function validateStep2() {
    if (form.budget_max < 1) return 'Set a maximum budget'
    if (form.budget_max < form.budget_min) return 'Max budget must be ≥ minimum'
    if (form.tags.length === 0) return 'Select at least one requirement'
    return ''
  }

  function handleNext() {
    const err = step === 1 ? validateStep1() : validateStep2()
    if (err) { setError(err); return }
    setStep((s) => (s + 1) as Step)
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/submit-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error ?? 'Something went wrong')
      router.push(`/brief/confirm?hotels=${data.hotels_notified ?? 0}&location=${encodeURIComponent(form.location)}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  const steps = ['Where & when', 'Requirements', 'Review & send']
  const currencySymbol = form.currency === 'GBP' ? '£' : form.currency === 'EUR' ? '€' : '$'

  return (
    <div className="mx-auto max-w-xl">

      {/* Step indicator */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          {steps.map((label, i) => {
            const n = i + 1
            const done = n < step
            const active = n === step
            return (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 transition-colors ${
                  done ? 'bg-blue-600 text-white'
                    : active ? 'bg-blue-50 text-blue-600 border-2 border-blue-600'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {done ? '✓' : n}
                </div>
                <span className={`text-xs hidden sm:block ${active ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                  {label}
                </span>
                {i < steps.length - 1 && (
                  <div className={`h-px flex-1 ${done ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </div>
            )
          })}
        </div>
        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* ── STEP 1: Where & when ── */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Where are you going?</h2>
            <p className="text-sm text-gray-500">We'll send your brief to hotels in that area.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Your name</label>
              <input
                type="text"
                className="form-input"
                placeholder="James Smith"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Your email</label>
              <input
                type="email"
                className="form-input"
                placeholder="james@email.com"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Destination</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Shoreditch, London"
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
            />
            <p className="mt-1.5 text-xs text-gray-400">Be specific — neighbourhood or city area works best</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Check-in</label>
              <input
                type="date"
                className="form-input"
                min={today}
                value={form.check_in}
                onChange={(e) => set('check_in', e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Check-out</label>
              <input
                type="date"
                className="form-input"
                min={form.check_in || today}
                value={form.check_out}
                onChange={(e) => set('check_out', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Guests</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => set('guests', Math.max(1, form.guests - 1))}
                className="h-9 w-9 rounded-lg border border-gray-200 text-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center"
              >−</button>
              <span className="text-lg font-semibold w-8 text-center">{form.guests}</span>
              <button
                type="button"
                onClick={() => set('guests', Math.min(10, form.guests + 1))}
                className="h-9 w-9 rounded-lg border border-gray-200 text-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center"
              >+</button>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2: Budget + Tags ── */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">What do you need?</h2>
            <p className="text-sm text-gray-500">These requirements go directly to hotels — the things Expedia can't filter for.</p>
          </div>

          {/* Budget */}
          <div className="rounded-xl border border-gray-200 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Budget per night</label>
              <select
                value={form.currency}
                onChange={(e) => set('currency', e.target.value)}
                className="text-sm border border-gray-200 rounded-md px-2 py-1 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="GBP">£ GBP</option>
                <option value="EUR">€ EUR</option>
                <option value="USD">$ USD</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400 mb-1">Minimum</p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{currencySymbol}</span>
                  <input
                    type="number"
                    min={0}
                    step={10}
                    value={form.budget_min}
                    onChange={(e) => set('budget_min', Number(e.target.value))}
                    className="form-input pl-7"
                  />
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Maximum</p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{currencySymbol}</span>
                  <input
                    type="number"
                    min={0}
                    step={10}
                    value={form.budget_max}
                    onChange={(e) => set('budget_max', Number(e.target.value))}
                    className="form-input pl-7"
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400">Hotels use this to calibrate their offer. They often bid below your maximum.</p>
          </div>

          {/* Tags */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-700">Your requirements</p>
              {form.tags.length > 0 && (
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                  {form.tags.length} selected
                </span>
              )}
            </div>
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
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
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

          {/* Free text */}
          <div>
            <label className="form-label">
              Anything else? <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              rows={3}
              className="form-input resize-none"
              placeholder="e.g. Attending a conference nearby, need a quiet room for early calls. Happy to be flexible on dates by a day or two."
              value={form.free_text}
              onChange={(e) => set('free_text', e.target.value)}
              maxLength={500}
            />
            <p className="mt-1 text-xs text-gray-400">This goes verbatim to hotels. Don't include your contact details here.</p>
          </div>
        </div>
      )}

      {/* ── STEP 3: Review ── */}
      {step === 3 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Review your brief</h2>
            <p className="text-sm text-gray-500">This is exactly what hotels will receive. Hotels reply directly to your email.</p>
          </div>

          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Intent brief preview</span>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <table className="w-full text-sm">
                <tbody>
                  {[
                    ['Destination', form.location],
                    ['Dates', `${form.check_in} → ${form.check_out}`],
                    ['Guests', String(form.guests)],
                    ['Budget/night', `${currencySymbol}${form.budget_min}–${currencySymbol}${form.budget_max}`],
                  ].map(([label, value]) => (
                    <tr key={label}>
                      <td className="py-1.5 text-gray-500 w-32">{label}</td>
                      <td className="py-1.5 font-medium text-gray-900">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {form.tags.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Requirements</p>
                  <div className="flex flex-wrap gap-1.5">
                    {form.tags.map((tagId) => {
                      const found = Object.values(TAGS_BY_CATEGORY).flat().find(t => t.id === tagId)
                      return (
                        <span key={tagId} className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                          {found?.label ?? tagId}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              {form.free_text && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Note to hotels</p>
                  <p className="text-sm text-gray-600 italic">"{form.free_text}"</p>
                </div>
              )}

              <div className="border-t border-gray-100 pt-3 text-xs text-gray-400">
                Hotels reply directly to <strong className="text-gray-600">{form.email}</strong>. Your name and email are shared so hotels can respond.
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
            Submitting sends your brief to matching hotels immediately. Brief expires in 72 hours.
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Nav buttons */}
      <div className="mt-8 flex items-center justify-between">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => (s - 1) as Step)}
            className="btn-secondary"
          >
            ← Back
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <button type="button" onClick={handleNext} className="btn-primary">
            Next →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                Sending to hotels…
              </>
            ) : (
              <>Send to hotels →</>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
