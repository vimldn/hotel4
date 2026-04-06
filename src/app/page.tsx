import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'OTA-Killer — Hotels Bid for You',
}

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Write a brief, not a search',
    body: 'Tell hotels what you actually need — squat rack, quiet floor, 4K monitor, late checkout. The things OTA filters have never been able to handle.',
  },
  {
    step: '02',
    title: 'Hotels email you directly',
    body: "We forward your brief to matching hotels in your area. They reply to your inbox with their private rate — not the inflated price they put on Expedia.",
  },
  {
    step: '03',
    title: 'Pick the best offer. Book direct.',
    body: "Reply to whichever hotel suits you. Book directly with them. No commission changes hands. You often pay less than the OTA rate — and get more.",
  },
]

const TAGS = [
  'Squat rack in gym', '4K monitor in room', 'Quiet floor',
  'Fast WiFi 500+ Mbps', 'Late checkout', 'Blackout curtains',
  'Standing desk', 'Gluten-free breakfast', 'Pet friendly',
  'Bathtub', 'High floor view', 'EV charging',
]

const FAQS = [
  {
    q: 'Is this free for travellers?',
    a: 'Completely free. We make money from hotels, not travellers. Hotels pay us a subscription to receive briefs — you pay nothing.',
  },
  {
    q: 'Why would hotels offer a lower rate here than on Expedia?',
    a: "OTAs charge hotels 15–25% commission on every booking. By bidding privately through us, a hotel keeps that margin. They can afford to give you a better rate and still come out ahead. Everyone wins except the OTA.",
  },
  {
    q: 'What if no hotels respond?',
    a: "You'll get a confirmation email either way. If no hotels match your requirements in your area, your brief simply doesn't go out. You won't be spammed.",
  },
  {
    q: 'Is this legal? What about rate parity clauses?',
    a: "Yes. Rate parity clauses prevent hotels from publicly advertising lower prices. A private email to a named traveller is legally equivalent to a loyalty rate or a response to a direct enquiry — not a public advertisement. EU courts have increasingly ruled MFN clauses unenforceable anyway.",
  },
  {
    q: 'I run a hotel. How do I join?',
    a: "Register your hotel using the link in the navigation. Tell us your location and which amenities you can genuinely deliver. When a matching brief comes in, we forward it to you — you reply directly to the traveller with your offer.",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">

      {/* Nav */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
              OK
            </div>
            <span className="font-semibold text-gray-900">OTA-Killer</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/hotels/register" className="text-sm text-gray-500 hover:text-gray-900 transition-colors hidden sm:block">
              Register your hotel
            </Link>
            <Link href="/brief/new" className="btn-primary">
              Create a brief
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-xs font-medium text-blue-700 mb-8">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          No commission. No rate parity. Hotels bid for you.
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight tracking-tight mb-6">
          Stop searching for hotels.<br />
          <span className="text-blue-600">Make them compete for you.</span>
        </h1>

        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Submit a trip brief. Hotels in your area see exactly what you need
          — squat rack, quiet floor, 4K monitor — and email you their private
          rate. Not the inflated one they show Expedia.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/brief/new" className="btn-primary text-base px-7 py-3">
            Create your brief — free
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <Link href="/hotels/register" className="btn-secondary text-base px-7 py-3">
            I run a hotel →
          </Link>
        </div>
      </section>

      {/* Tags cloud */}
      <section className="border-y border-gray-100 bg-gray-50 py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-gray-400 mb-6">
            The requirements OTA filters can't handle
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {TAGS.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-blue-100 bg-white px-4 py-1.5 text-sm text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-20">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {HOW_IT_WORKS.map(({ step, title, body }) => (
            <div key={step} className="text-center">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold text-sm mb-4">
                {step}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-100 bg-gray-50 py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-gray-900">0%</div>
              <div className="text-sm text-gray-500 mt-1">Commission charged</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">72h</div>
              <div className="text-sm text-gray-500 mt-1">Brief lifespan</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">Legal</div>
              <div className="text-sm text-gray-500 mt-1">Rate parity compliant</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-2xl px-4 sm:px-6 py-20">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">Questions</h2>
        <div className="space-y-6">
          {FAQS.map(({ q, a }) => (
            <div key={q} className="border-b border-gray-100 pb-6">
              <h3 className="font-semibold text-gray-900 mb-2">{q}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-100 bg-blue-600 py-16">
        <div className="mx-auto max-w-xl px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to stop overpaying?</h2>
          <p className="text-blue-100 mb-8">
            Write your brief in 2 minutes. Hotels respond within hours.
          </p>
          <Link
            href="/brief/new"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
          >
            Create a free brief
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <span>© 2025 OTA-Killer. Built to disrupt the Expedia duopoly.</span>
          <div className="flex items-center gap-5">
            <Link href="/brief/new" className="hover:text-gray-600">Submit a brief</Link>
            <Link href="/hotels/register" className="hover:text-gray-600">Register hotel</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
