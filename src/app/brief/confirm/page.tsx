import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Brief sent — check your inbox' }

interface Props {
  searchParams: Promise<{ hotels?: string; location?: string }>
}

export default async function BriefConfirmPage({ searchParams }: Props) {
  const params = await searchParams
  const hotelCount = parseInt(params.hotels ?? '0', 10)
  const location = params.location ?? 'your area'

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">

          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
            <svg className="h-8 w-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Brief sent</h1>

          {hotelCount > 0 ? (
            <p className="text-gray-500 mb-6 leading-relaxed">
              Your brief has been sent to{' '}
              <strong className="text-gray-900">{hotelCount} hotel{hotelCount !== 1 ? 's' : ''} in {decodeURIComponent(location)}</strong>.
              They'll email you directly with their private rate — usually within a few hours.
            </p>
          ) : (
            <p className="text-gray-500 mb-6 leading-relaxed">
              Your brief has been received. We're matching it to hotels in {decodeURIComponent(location)}.
              You'll receive a confirmation email shortly.
            </p>
          )}

          <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 mb-6 text-left">
            <p className="text-sm font-semibold text-blue-800 mb-2">What happens next</p>
            <ul className="space-y-1.5 text-sm text-blue-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">→</span>
                Check your inbox — hotels reply directly to you
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">→</span>
                Compare offers and reply to whichever suits you
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">→</span>
                Book directly with the hotel — no middleman
              </li>
            </ul>
          </div>

          <div className="text-xs text-gray-400 mb-6">
            Brief expires in 72 hours. You're under no obligation to accept any offer.
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/brief/new" className="btn-primary w-full justify-center">
              Submit another brief
            </Link>
            <Link href="/" className="btn-secondary w-full justify-center">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
