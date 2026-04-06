import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'OTA-Killer — Hotels Bid for You',
    template: '%s | OTA-Killer',
  },
  description:
    'Skip Expedia. Send your trip brief directly to hotels in your area. They reply with private rates — no commission, no rate parity restrictions.',
  openGraph: {
    title: 'OTA-Killer — Hotels Bid for You',
    description: 'Submit a trip brief. Hotels email you their private rate. No Expedia. No commission.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 min-h-screen">
        {children}
      </body>
    </html>
  )
}
