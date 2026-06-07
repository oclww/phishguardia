'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Shield, Menu, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/features', label: 'Solution' },
  { href: '/pricing',  label: 'Tarifs' },
  { href: '/about',    label: 'À propos' },
  { href: '/contact',  label: 'Contact' },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <header className={cn('fixed top-0 left-0 right-0 z-50 transition-all duration-300')}
      style={scrolled
        ? { background: 'rgba(13,17,23,.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #1e2a3a' }
        : { background: 'transparent' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-14">

        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #41e8c4, #5e9ef7)' }}>
            <Shield size={13} style={{ color: '#0d1117' }} strokeWidth={2.5}/>
          </div>
          <span className="font-bold text-sm" style={{ color: '#eaf2ff', fontFamily: 'Syne, sans-serif' }}>
            PhishGuard<span style={{ color: '#41e8c4' }}>.IA</span>
          </span>
        </Link>

        {/* Pill nav — matching screenshot 2 */}
        <nav className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(22,28,38,.8)', border: '1px solid #1e2a3a', backdropFilter: 'blur(8px)' }}>
          {navLinks.map(l => (
            <Link key={l.href} href={l.href}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-medium transition-all",
                pathname === l.href ? "text-[#0d1117] bg-[#41e8c4]" : "text-[#7a96b0] hover:text-[#eaf2ff]"
              )}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/login"
            className="text-xs font-medium px-4 py-2 rounded-full transition-all text-[#7a96b0] hover:text-[#eaf2ff]">
            Connexion
          </Link>
          <Link href="/register">
            <button className="px-5 py-2 text-xs font-bold rounded-full bg-[#eaf2fb] text-[#060d18] shadow-[0_4px_14px_rgba(255,255,255,0.1)] hover:bg-white hover:shadow-[0_6px_20px_rgba(255,255,255,0.15)] hover:-translate-y-0.5 active:scale-95 active:translate-y-0 transition-all duration-300">
              Essai gratuit
            </button>
          </Link>
        </div>

        <button className="md:hidden p-1.5" style={{ color:'#7a96b0' }} onClick={() => setOpen(v=>!v)}>
          {open ? <X size={18}/> : <Menu size={18}/>}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
            className="md:hidden overflow-hidden"
            style={{ background:'rgba(13,17,23,.96)', borderBottom:'1px solid #1e2a3a' }}>
            <div className="px-5 py-4 space-y-1">
              {navLinks.map(l=>(
                <Link key={l.href} href={l.href} onClick={()=>setOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-sm font-medium"
                  style={{ color: pathname===l.href?'#41e8c4':'#7a96b0' }}>
                  {l.label}
                </Link>
              ))}
              <div className="flex gap-2 pt-3" style={{ borderTop:'1px solid #1e2a3a' }}>
                <Link href="/login"    className="flex-1 text-center py-2.5 rounded-xl text-sm" style={{ border:'1px solid #1e2a3a', color:'#eaf2ff' }}>Connexion</Link>
                <Link href="/register" className="flex-1 text-center py-2.5 rounded-xl text-sm font-bold bg-[#eaf2fb] text-[#060d18] shadow-[0_4px_14px_rgba(255,255,255,0.1)] hover:bg-white hover:-translate-y-0.5 active:scale-95 transition-all duration-300">Essai gratuit</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
