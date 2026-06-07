'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="text-center max-w-xl mx-auto">
          {/* Animated 404 number */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <span
              className="text-[9rem] sm:text-[12rem] font-black leading-none select-none"
              style={{
                background: 'linear-gradient(135deg, #41e8c4 0%, #a78bfa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontFamily: 'Syne, sans-serif',
              }}
            >
              404
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            className="text-3xl sm:text-4xl font-bold text-[#eaf2fb] mt-2 mb-4"
            style={{ fontFamily: 'Syne, sans-serif' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
          >
            Page introuvable
          </motion.h1>

          {/* Description */}
          <motion.p
            className="text-[#7a96b4] text-base sm:text-lg leading-relaxed mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: 'easeOut' }}
          >
            Oups ! La page que vous recherchez a peut-être été déplacée, supprimée ou n&apos;a jamais existé.
            Pas de panique — retournez à l&apos;accueil ou accédez directement à votre dashboard.
          </motion.p>

          {/* Decorative divider */}
          <motion.div
            className="w-24 h-px mx-auto mb-10"
            style={{ background: 'linear-gradient(90deg, transparent, #41e8c4, transparent)' }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.35 }}
          />

          {/* Action buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
          >
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-[#0d1117] transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #41e8c4, #38d1b0)',
                boxShadow: '0 0 20px rgba(65, 232, 196, 0.3)',
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Retour à l&apos;accueil
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm border transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                borderColor: '#a78bfa',
                color: '#a78bfa',
                background: 'rgba(167, 139, 250, 0.08)',
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="7" height="9" x="3" y="3" rx="1" />
                <rect width="7" height="5" x="14" y="3" rx="1" />
                <rect width="7" height="9" x="14" y="12" rx="1" />
                <rect width="7" height="5" x="3" y="16" rx="1" />
              </svg>
              Accéder au dashboard
            </Link>
          </motion.div>

          {/* Subtle background glow */}
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            aria-hidden="true"
            style={{
              background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(65,232,196,0.06) 0%, transparent 70%)',
            }}
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}
