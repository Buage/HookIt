import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HookIt',
  description: 'Discord Webhook multitool',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
