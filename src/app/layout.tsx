import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'PhishGuard.IA — Protection Anti-Phishing par IA',
  description: 'Protégez votre organisation contre le phishing avec notre IA de détection en temps réel. 99.7% de précision, 2.3ms de réponse.',
  keywords: 'phishing, cybersécurité, IA, protection email, anti-phishing',
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
