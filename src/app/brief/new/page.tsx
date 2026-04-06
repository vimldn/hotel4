import type { Metadata } from 'next'
import Link from 'next/link'
import BriefForm from '@/components/BriefForm'

export const metadata: Metadata = {
  title: 'Create a Trip Brief',
  description: 'Tell hotels exactly what you need. They email you their private rate.',
}

export default function NewBriefPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-xl px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold">OK</div>
            <span className="text-sm font-semibold text-gray-900">OTA-Killer</span>
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-500">New brief</span>
        </div>
      </div>
      <main className="mx-auto max-w-xl px-4 sm:px-6 py-10">
        <BriefForm />
      </main>
    </div>
  )
}
