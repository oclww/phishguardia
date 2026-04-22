'use client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Clock, ArrowLeft, Twitter, Linkedin } from 'lucide-react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Badge } from '@/components/ui/Badge'

const posts = [
  {
    slug: 'comprendre-le-spear-phishing',
    title: 'Comprendre le Spear-Phishing : la menace ciblée',
    category: 'Phishing',
    author: { name: 'Sophie Leclerc', role: 'CTO & Co-fondatrice', bio: 'Expert en cybersécurité avec 12 ans d\'expérience.' },
    date: '15 mars 2024', readingTime: 8,
    content: [
      { type: 'p', text: 'Le spear-phishing représente aujourd\'hui l\'une des menaces les plus sophistiquées. Contrairement au phishing classique, il utilise des informations personnalisées pour tromper des cibles spécifiques avec un taux de succès alarmant.' },
      { type: 'h2', text: 'Qu\'est-ce que le Spear-Phishing ?' },
      { type: 'p', text: 'Le spear-phishing est une forme d\'hameçonnage ciblé où l\'attaquant effectue des recherches approfondies avant de lancer l\'attaque. L\'email reçu semble légitime car il contient des informations précises : nom complet, poste, projets en cours.' },
      { type: 'h2', text: 'Comment identifier une attaque ?' },
      { type: 'p', text: 'Urgence artificielle, demandes inhabituelles, adresse email similaire au domaine légitime, pièces jointes demandant d\'activer les macros — ce sont des signaux d\'alarme qui doivent immédiatement alerter vos équipes.' },
      { type: 'h2', text: 'Protection efficace' },
      { type: 'p', text: 'La protection repose sur trois piliers : technologie (IA, DKIM/SPF/DMARC), formation continue des équipes, et processus (double validation pour transactions financières). PhishGuard.IA détecte 99.7% des attaques de spear-phishing.' },
    ],
  },
  {
    slug: 'ia-detection-phishing-2024',
    title: 'Comment l\'IA révolutionne la détection du phishing en 2024',
    category: 'Technique',
    author: { name: 'Antoine Bernard', role: 'Head of AI', bio: 'Docteur en ML, spécialisé NLP et détection d\'anomalies.' },
    date: '8 mars 2024', readingTime: 12,
    content: [
      { type: 'p', text: 'L\'intelligence artificielle a transformé la cybersécurité email de façon radicale. Les systèmes basés sur des règles statiques sont aujourd\'hui largement dépassés face à des attaques de plus en plus sophistiquées.' },
      { type: 'h2', text: 'L\'évolution de la détection' },
      { type: 'p', text: 'Les premières solutions anti-phishing reposaient sur des listes noires et filtres par mots-clés. Simples à contourner, elles affichaient des taux de faux positifs élevés et rataient les nouvelles menaces zero-day.' },
      { type: 'h2', text: 'Le Deep Learning en action' },
      { type: 'p', text: 'Nos modèles analysent simultanément plus de 500 signaux par email : structure linguistique, réputation du domaine, analyse des URLs, comportement historique et graph des relations expéditeur-destinataire.' },
    ],
  },
]

type CategoryColor = 'info' | 'critical' | 'success' | 'high' | 'medium' | 'default'
const catColors: Record<string, CategoryColor> = {
  Phishing: 'critical', Technique: 'info', Guide: 'success', Actualités: 'high',
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const post = posts.find(p => p.slug === slug) ?? posts[0]
  const headings = post.content.filter(b => b.type === 'h2').map(b => b.text)

  return (
    <div className="min-h-screen bg-[#060d18]">
      <Header />
      <main className="pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-[#7a96b4] hover:text-[#eaf2fb] transition-colors mb-8">
            <ArrowLeft size={16} /> Retour au blog
          </Link>
          <div className="grid lg:grid-cols-4 gap-10">
            <motion.article className="lg:col-span-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Badge variant={catColors[post.category] ?? 'default'} className="mb-4">{post.category}</Badge>
              <h1 className="text-3xl md:text-4xl font-bold text-[#eaf2fb] mb-4 leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
                {post.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-[#7a96b4] mb-10">
                <span className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#7dd3fc]/30 to-[#a78bfa]/30 flex items-center justify-center text-xs font-bold text-[#7dd3fc]">
                    {post.author.name[0]}
                  </div>
                  {post.author.name}
                </span>
                <span className="flex items-center gap-1"><Calendar size={13} />{post.date}</span>
                <span className="flex items-center gap-1"><Clock size={13} />{post.readingTime} min</span>
              </div>
              <div className="space-y-4">
                {post.content.map((block, i) => (
                  block.type === 'h2'
                    ? <h2 key={i} className="text-xl font-bold text-[#eaf2fb] mt-8 mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>{block.text}</h2>
                    : <p key={i} className="text-[#7a96b4] leading-relaxed">{block.text}</p>
                ))}
              </div>
              <div className="mt-12 p-6 rounded-2xl border border-[#1a2740] bg-[#0c1526]">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7dd3fc]/20 to-[#a78bfa]/20 border border-[#7dd3fc]/20 flex items-center justify-center font-bold text-[#7dd3fc] shrink-0">
                    {post.author.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-[#eaf2fb]">{post.author.name}</p>
                    <p className="text-sm text-[#7dd3fc] mb-1">{post.author.role}</p>
                    <p className="text-sm text-[#7a96b4]">{post.author.bio}</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <span className="text-sm text-[#7a96b4]">Partager :</span>
                <button className="p-2 rounded-lg border border-[#1a2740] text-[#7a96b4] hover:text-[#7dd3fc] hover:border-[#7dd3fc]/30 transition-all"><Twitter size={16} /></button>
                <button className="p-2 rounded-lg border border-[#1a2740] text-[#7a96b4] hover:text-[#7dd3fc] hover:border-[#7dd3fc]/30 transition-all"><Linkedin size={16} /></button>
              </div>
            </motion.article>
            <aside className="space-y-6">
              {headings.length > 0 && (
                <div className="rounded-2xl border border-[#1a2740] bg-[#0c1526] p-5 sticky top-24">
                  <h3 className="text-xs font-semibold text-[#eaf2fb] uppercase tracking-wider mb-4">Table des matières</h3>
                  <ul className="space-y-2">
                    {headings.map(h => <li key={h}><span className="text-sm text-[#7a96b4] hover:text-[#7dd3fc] cursor-pointer transition-colors block leading-snug">{h}</span></li>)}
                  </ul>
                </div>
              )}
              <div className="rounded-2xl border border-[#7dd3fc]/20 bg-[#7dd3fc]/5 p-5">
                <h3 className="text-sm font-semibold text-[#eaf2fb] mb-2">Newsletter Sécurité</h3>
                <p className="text-xs text-[#7a96b4] mb-4">Les dernières menaces chaque semaine.</p>
                <input type="email" placeholder="votre@email.com" className="w-full bg-[#060d18] border border-[#1a2740] rounded-xl px-3 py-2 text-sm text-[#eaf2fb] placeholder:text-[#7a96b4] outline-none focus:border-[#7dd3fc]/50 mb-3" />
                <button className="w-full py-2 bg-gradient-to-r from-[#7dd3fc] to-[#a78bfa] text-[#060d18] text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity">S&apos;abonner</button>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
