import Link from 'next/link'
import { Shield, Github, Mail } from 'lucide-react'

const footerLinks = {
  Produit: [
    { href: '/features', label: 'Solution' },
    { href: '/pricing',  label: 'Tarifs' },
    { href: '/blog',     label: 'Blog' },
  ],
  Développeurs: [
    { href: '/dashboard/api', label: 'Documentation API' },
    { href: '/api/v1/health', label: 'Status API' },
    { href: '/register',      label: 'Essai gratuit' },
  ],
  Entreprise: [
    { href: '/about',   label: 'À propos' },
    { href: '/contact', label: 'Contact' },
  ],
  Légal: [
    { href: '/legal/privacy', label: 'Confidentialité' },
    { href: '/legal/terms',   label: 'CGU' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-[#1a2740] bg-[#060d18]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7dd3fc] to-[#a78bfa] flex items-center justify-center">
                <Shield size={16} className="text-[#060d18]" />
              </div>
              <span className="font-bold text-[#eaf2fb] tracking-tight text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>
                PhishGuard<span className="text-[#7dd3fc]">.IA</span>
              </span>
            </Link>
            <p className="text-sm text-[#7a96b4] leading-relaxed">
              Détection anti-phishing par IA pour les équipes et les entreprises.
              <br /><br />
              Construit par Matis L., Sami H. et Lucas M.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: <Github size={18} />,  href: 'https://github.com/oclww/phishguardia', label: 'GitHub' },
                { icon: <Mail size={18} />,    href: 'mailto:oclaw78@gmail.com',               label: 'Email' },
              ].map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  target={s.href.startsWith('http') ? '_blank' : undefined}
                  rel={s.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="w-9 h-9 rounded-lg border border-[#1a2740] flex items-center justify-center text-[#7a96b4] hover:text-[#7dd3fc] hover:border-[#7dd3fc]/30 transition-all"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section} className="space-y-3">
              <h4 className="text-xs font-semibold text-[#eaf2fb] uppercase tracking-wider">{section}</h4>
              <ul className="space-y-2">
                {links.map(link => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#7a96b4] hover:text-[#eaf2fb] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-[#1a2740] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#7a96b4]">
            © {new Date().getFullYear()} PhishGuard.IA — Tous droits réservés. Hébergé en UE 🇪🇺
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#34d399] animate-pulse" />
            <span className="text-xs text-[#7a96b4]">Tous les systèmes opérationnels</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
