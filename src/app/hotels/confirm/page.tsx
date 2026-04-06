import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Hotel registered — welcome to OTA-Killer' }

export default function HotelConfirmPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">

          <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-5">
            <svg className="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">You're registered</h1>
          <p className="text-gray-500 mb-6 leading-relaxed">
            Check your inbox — we've sent a confirmation with everything you need to know.
            When a traveller brief matches your location and capabilities, it lands in your inbox automatically.
          </p>

          <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 mb-6 text-left space-y-3">
            <p className="text-sm font-semibold text-gray-700">What to expect</p>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-start gap-2.5">
                <span className="text-blue-400 font-bold mt-0.5 flex-shrink-0">1</span>
                <span>A brief arrives by email with the traveller's dates, budget, and requirements</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-blue-400 font-bold mt-0.5 flex-shrink-0">2</span>
                <span>Hit reply with your private rate, which rooms you can offer, and any perks</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-blue-400 font-bold mt-0.5 flex-shrink-0">3</span>
                <span>The traveller books directly with you — no commission, no middleman</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-green-50 border border-green-100 px-4 py-3 mb-6 text-sm text-green-800 text-left">
            <strong>The maths:</strong> At £250 ADR, one OTA booking costs ~£50 in commission.
            Reply to 6 briefs and convert one — you've already saved more than a month's future subscription fee.
          </div>

          <p className="text-xs text-gray-400 mb-6">
            Want to update your capabilities or location?
            Email <a href="mailto:hotels@otakiller.com" className="text-blue-600 hover:underline">hotels@otakiller.com</a>
          </p>

          <Link href="/" className="btn-secondary w-full justify-center">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
