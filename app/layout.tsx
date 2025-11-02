import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Zoho CRM Widget',
  description: 'Zoho CRM Widget for displaying Contacts and Leads',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

