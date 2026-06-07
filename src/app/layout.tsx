import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: { default: 'PhishGuard.IA — Détection anti-phishing par IA', template: '%s | PhishGuard.IA' },
  description: "PhishGuard.IA analyse vos emails en temps réel avec l'IA pour détecter phishing, BEC et spear-phishing. API REST simple, résultats en moins de 2 secondes.",
  keywords: ['phishing', 'anti-phishing', 'cybersécurité', 'détection email', 'IA', 'API', 'BEC', 'sécurité email'],
  authors: [{ name: 'PhishGuard.IA' }],
  openGraph: {
    title: 'PhishGuard.IA — Détection anti-phishing par IA',
    description: "Protégez vos emails contre le phishing avec l'IA. Score de risque en temps réel, API REST, dashboard.",
    url: 'https://phishguardia.vercel.app',
    siteName: 'PhishGuard.IA',
    locale: 'fr_FR',
    type: 'website',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-[#060d18] text-[#eaf2fb] antialiased font-[family-name:var(--font-space-grotesk)]">
        <div className="noise-overlay" aria-hidden="true" />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
