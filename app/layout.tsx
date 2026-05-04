import type { Metadata } from 'next'
import { Instrument_Serif, Geist } from 'next/font/google'
import './globals.css'

const instrumentSerif = Instrument_Serif({
  weight: ['400'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-serif',
})

const geist = Geist({
  weight: ['300', '400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'BongiaTech — Plataforma de Afiliados',
  description: 'Gerencie seu programa de afiliados com rastreamento automático e pagamento via PIX.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${instrumentSerif.variable} ${geist.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}
