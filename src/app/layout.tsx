import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'E-Voting OSIS | Pemilihan Ketua OSIS',
  description:
    'Platform e-voting digital untuk pemilihan Ketua OSIS yang aman, anonim, dan transparan dengan hasil suara real-time.',
  keywords: ['e-voting', 'OSIS', 'pemilihan', 'ketua OSIS', 'digital voting'],
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="id" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  )
}
