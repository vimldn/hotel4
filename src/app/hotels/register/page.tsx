import type { Metadata } from 'next'
import Link from 'next/link'
import HotelRegisterForm from '@/components/HotelRegisterForm'

export const metadata: Metadata = {
  title: 'Register Your Hotel',
  description: 'Join OTA-Killer. Start receiving intent briefs from travellers in your area — commission free.',
}

export default function HotelRegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold">OK</div>
            <span className="text-sm font-semibold text-gray-900">OTA-Killer</span>
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-500">Register your hotel</span>
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Register your hotel</h1>
          <p className="text-gray-500 leading-relaxed">
            Start receiving intent briefs from travellers who need exactly what you offer.
            No subscription fee in the MVP — just reply to briefs and book direct. Zero commission.
          </p>
        </div>

        {/* Value prop strip */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: '0%', sub: 'Commission on bookings' },
            { label: 'Direct', sub: 'Negotiate by email' },
            { label: 'Free', sub: 'No subscription fee yet' },
          ].map(({ label, sub }) => (
            <div key={label} className="rounded-xl bg-white border border-gray-200 p-4 text-center">
              <div className="text-xl font-bold text-blue-600">{label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{sub}</div>
            </div>
          ))}
        </div>

        <HotelRegisterForm />
      </main>
    </div>
  )
}
