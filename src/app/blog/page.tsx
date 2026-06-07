'use client'
import { Calendar, Clock, PenLine } from 'lucide-react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

/**
 * These are real articles we plan to write.
 * Status 'coming' = À venir, 'draft' = En cours de rédaction.
 * No fake authors, no fake stats, no fake dates.
 */
const posts = [
  {
    slug: 'reconnaitre-email-phishing-2026',
    title: 'Comment reconnaître un email de phishing en 2026',
    excerpt:
      'Les techniques de phishing ont évolué bien au-delà des fautes d\'orthographe et des princes nigérians. En 2026, les attaquants utilisent l\'IA générative pour rédiger des emails parfaits, usurper des identités avec précision et contourner les filtres classiques. Cet article détaille les signaux concrets à surveiller et les réflexes à adopter.',
    category: 'Guide pratique',
    status: 'coming' as const,
    readingTime: 7,
    color: '#41e8c4',
    tags: ['phishing', 'détection', 'bonnes pratiques'],
  },
  {
    slug: 'pme-cibles-phishing',
    title: 'Pourquoi les PME sont les premières cibles du phishing',
    excerpt:
      'Les petites et moyennes entreprises concentrent aujourd\'hui l\'essentiel des tentatives de phishing. Moins protégées que les grands groupes, elles sont aussi perçues comme des portes d\'entrée vers leurs donneurs d\'ordre. Décryptage d\'une réalité que beaucoup sous-estiment encore.',
    category: 'Analyse',
    status: 'coming' as const,
    readingTime: 6,
    color: '#a78bfa',
    tags: ['PME', 'risques', 'cybersécurité'],
  },
  {
    slug: 'bec-business-email-compromise',
    title: 'BEC (Business Email Compromise) : la menace que personne ne voit venir',
    excerpt:
      'La compromission d\'email professionnel — ou BEC — est l\'une des fraudes les plus coûteuses et les moins détectées. Elle ne repose ni sur des malwares ni sur des liens suspects : juste un email bien rédigé, au bon moment, au bon interlocuteur. Pourquoi est-elle si difficile à stopper, et que peut-on faire concrètement ?',
    category: 'Analyse',
    status: 'draft' as const,
    readingTime: 8,
    color: '#fb7185',
    tags: ['BEC', 'fraude', 'ingénierie sociale'],
  },
]

const statusConfig = {
  coming: {
    label: 'À venir',
    className: 'bg-[#a78bfa]/10 border-[#a78bfa]/30 text-[#a78bfa]',
  },
  draft: {
    label: 'En cours de rédaction',
    className: 'bg-[#41e8c4]/10 border-[#41e8c4]/30 text-[#41e8c4]',
  },
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#0d1117]">
      <Header />
      <main>
        {/* Hero */}
        <section className="pt-32 pb-16 px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#41e8c4]/30 bg-[#41e8c4]/10 text-[#41e8c4] text-xs font-medium mb-6">
              Blog &amp; Ressources
            </span>
            <h1
              className="text-4xl md:text-5xl font-bold text-[#eaf2fb] mb-4"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              Cybersécurité &amp;{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #41e8c4, #a78bfa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Anti-Phishing
              </span>
            </h1>
            <p className="text-[#7a96b4] text-lg max-w-xl mx-auto">
              Des articles écrits par l&apos;équipe PhishGuard.IA — sans chiffres inventés, sans
              buzzwords vides.
            </p>
          </motion.div>
        </section>

        {/* Notice */}
        <section className="pb-6 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-xl border border-[#41e8c4]/20 bg-[#41e8c4]/5 px-5 py-4 flex gap-3 items-start">
              <PenLine size={16} className="text-[#41e8c4] mt-0.5 shrink-0" />
              <p className="text-sm text-[#7a96b4] leading-relaxed">
                Notre blog est en cours de construction. Les articles ci-dessous sont nos prochaines
                publications — le contenu complet arrive bientôt.
              </p>
            </div>
          </div>
        </section>

        {/* Posts list */}
        <section className="py-8 px-4 pb-24">
          <div className="max-w-3xl mx-auto space-y-6">
            {posts.map((post, i) => {
              const status = statusConfig[post.status]
              return (
                <motion.article
                  key={post.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-2xl border border-[#1a2740] bg-[#161c26] p-6 md:p-8"
                >
                  {/* Top row: category + status badge */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full border"
                      style={{
                        backgroundColor: `${post.color}15`,
                        borderColor: `${post.color}30`,
                        color: post.color,
                      }}
                    >
                      {post.category}
                    </span>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  {/* Title */}
                  <h2
                    className="text-xl font-bold text-[#eaf2fb] mb-3 leading-snug"
                    style={{ fontFamily: 'Syne, sans-serif' }}
                  >
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-sm text-[#7a96b4] leading-relaxed mb-5">{post.excerpt}</p>

                  {/* Footer: meta + tags */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-4 text-xs text-[#7a96b4]">
                      <span className="flex items-center gap-1.5">
                        <Clock size={12} />~{post.readingTime} min de lecture
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        Publication à venir
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {post.tags.map(tag => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded-md bg-[#1a2740] text-[#7a96b4]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.article>
              )
            })}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
