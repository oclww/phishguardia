'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Calendar, Clock, Tag, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Badge } from '@/components/ui/Badge'

const posts = [
  {
    slug: 'comprendre-le-spear-phishing',
    title: 'Comprendre le Spear-Phishing : la menace ciblée',
    excerpt: 'Le spear-phishing représente aujourd\'hui 65% des attaques réussies. Découvrez comment les cybercriminels ciblent vos employés et comment s\'en protéger efficacement.',
    category: 'Phishing',
    author: 'Sophie Leclerc',
    date: '15 mars 2024',
    readingTime: 8,
    image: 'linear-gradient(135deg, #fb7185/20, #a78bfa/20)',
    tags: ['spear-phishing', 'menaces', 'protection'],
  },
  {
    slug: 'ia-detection-phishing-2024',
    title: 'Comment l\'IA révolutionne la détection du phishing en 2024',
    excerpt: 'Les modèles de deep learning atteignent désormais 99.7% de précision dans la détection d\'emails malveillants. Plongée dans les technologies qui protègent vos équipes.',
    category: 'Technique',
    author: 'Antoine Bernard',
    date: '8 mars 2024',
    readingTime: 12,
    image: 'linear-gradient(135deg, #7dd3fc/20, #34d399/20)',
    tags: ['IA', 'deep learning', 'détection'],
  },
  {
    slug: 'guide-securite-email-pme',
    title: 'Guide complet : sécurité email pour les PME en 2024',
    excerpt: 'Les PME sont 3x plus ciblées que les grandes entreprises mais disposent de moins de ressources. Voici votre guide pratique pour sécuriser vos communications.',
    category: 'Guide',
    author: 'Julien Martin',
    date: '1 mars 2024',
    readingTime: 15,
    image: 'linear-gradient(135deg, #fbbf24/20, #fb7185/20)',
    tags: ['PME', 'guide', 'sécurité email'],
  },
  {
    slug: 'attaques-bec-business-email',
    title: 'BEC : quand les escrocs se font passer pour votre PDG',
    excerpt: 'Les attaques de compromission d\'email professionnel (BEC) ont coûté 2.9 milliards de dollars en 2023. Apprenez à identifier et bloquer ces arnaques sophistiquées.',
    category: 'Actualités',
    author: 'Camille Rousseau',
    date: '22 février 2024',
    readingTime: 6,
    image: 'linear-gradient(135deg, #a78bfa/20, #7dd3fc/20)',
    tags: ['BEC', 'fraude', 'prévention'],
  },
  {
    slug: 'zero-trust-securite-email',
    title: 'Zero Trust appliqué à la sécurité email',
    excerpt: 'Le modèle Zero Trust transforme la manière dont les entreprises approchent la sécurité email. Comment l\'implémenter concrètement dans votre organisation.',
    category: 'Technique',
    author: 'Pierre Moreau',
    date: '15 février 2024',
    readingTime: 10,
    image: 'linear-gradient(135deg, #34d399/20, #7dd3fc/20)',
    tags: ['zero trust', 'architecture', 'sécurité'],
  },
  {
    slug: 'formation-employees-phishing',
    title: 'Former vos employés : le maillon humain de la cybersécurité',
    excerpt: '90% des violations de données commencent par un email. La formation des équipes reste le premier rempart contre les attaques. Découvrez les meilleures pratiques.',
    category: 'Guide',
    author: 'Emma Fontaine',
    date: '8 février 2024',
    readingTime: 9,
    image: 'linear-gradient(135deg, #fbbf24/20, #34d399/20)',
    tags: ['formation', 'sensibilisation', 'employés'],
  },
]

const categories = ['Tous', 'Phishing', 'Sécurité', 'Guide', 'Actualités', 'Technique']

const categoryColors: Record<string, 'info' | 'critical' | 'success' | 'high' | 'medium' | 'default'> = {
  Phishing: 'critical',
  Technique: 'info',
  Guide: 'success',
  Actualités: 'high',
  Sécurité: 'medium',
}

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('Tous')

  const filtered = activeCategory === 'Tous' ? posts : posts.filter(p => p.category === activeCategory)

  return (
    <div className="min-h-screen bg-[#060d18]">
      <Header />
      <main>
        {/* Hero */}
        <section className="pt-32 pb-16 px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#7dd3fc]/30 bg-[#7dd3fc]/10 text-[#7dd3fc] text-xs font-medium mb-6">
              Blog &amp; Ressources
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-[#eaf2fb] mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
              Cybersécurité &amp;{' '}
              <span style={{ background: 'linear-gradient(135deg, #7dd3fc, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Anti-Phishing
              </span>
            </h1>
            <p className="text-[#7a96b4] text-lg max-w-xl mx-auto">
              Guides pratiques, analyses de menaces et actualités pour protéger votre organisation.
            </p>
          </motion.div>
        </section>

        {/* Category filter */}
        <section className="pb-8 px-4">
          <div className="max-w-5xl mx-auto flex items-center gap-2 flex-wrap justify-center">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                  activeCategory === cat
                    ? 'bg-[#7dd3fc]/20 border-[#7dd3fc]/40 text-[#7dd3fc]'
                    : 'border-[#1a2740] text-[#7a96b4] hover:border-[#7dd3fc]/30 hover:text-[#eaf2fb]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Posts grid */}
        <section className="py-8 px-4 pb-24">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post, i) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-[#1a2740] bg-[#0c1526]/80 overflow-hidden hover:border-[#7dd3fc]/30 transition-colors group"
              >
                {/* Image placeholder */}
                <div
                  className="h-44 relative overflow-hidden"
                  style={{ background: post.image.replace('/20', '/10') }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-xl border border-[#1a2740] bg-[#0c1526]/60 flex items-center justify-center">
                      <Tag size={20} className="text-[#7dd3fc]" />
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant={categoryColors[post.category] ?? 'default'}>{post.category}</Badge>
                  </div>
                  <h2 className="text-base font-semibold text-[#eaf2fb] mb-2 leading-snug group-hover:text-[#7dd3fc] transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-sm text-[#7a96b4] line-clamp-3 mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-[#7a96b4]">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {post.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {post.readingTime} min
                      </span>
                    </div>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-[#7dd3fc] hover:text-[#7dd3fc]/80 transition-colors"
                    >
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
