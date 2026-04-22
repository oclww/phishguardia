'use client'
import Link from 'next/link'
import { Lightbulb, Eye, ShieldCheck, Star, Linkedin, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const values = [
  {
    icon: Lightbulb,
    color: '#fbbf24',
    title: 'Innovation',
    description:
      "Nous repoussons les limites de l'intelligence artificielle appliquée à la cybersécurité. Chaque trimestre, nous investissons 30% de notre R&D dans des techniques de détection inédites.",
  },
  {
    icon: Eye,
    color: '#7dd3fc',
    title: 'Transparence',
    description:
      "Nos modèles sont explicables : chaque décision de détection est accompagnée d'un score de confiance et d'une justification lisible. Nous publions un rapport de sécurité annuel public.",
  },
  {
    icon: ShieldCheck,
    color: '#34d399',
    title: 'Sécurité',
    description:
      "La sécurité est notre cœur de métier, pas une option. Nos infrastructures sont certifiées ISO 27001, hébergées en Europe et auditées chaque année par des pentesters indépendants.",
  },
  {
    icon: Star,
    color: '#a78bfa',
    title: 'Excellence',
    description:
      "Nous visons le score de satisfaction client le plus élevé de notre secteur. Chaque retour utilisateur est traité dans les 24h et alimente directement notre feuille de route produit.",
  },
]

const team = [
  {
    initials: 'JM',
    color: '#7dd3fc',
    name: 'Julien Martin',
    role: 'CEO & Co-fondateur',
    bio: 'Ex-CISO chez BNP Paribas, 15 ans en cybersécurité entreprise.',
    linkedin: 'https://linkedin.com',
  },
  {
    initials: 'SL',
    color: '#a78bfa',
    name: 'Sophie Leclerc',
    role: 'CTO & Co-fondatrice',
    bio: 'PhD en ML appliqué, ancienne chercheuse Google Brain.',
    linkedin: 'https://linkedin.com',
  },
  {
    initials: 'AB',
    color: '#34d399',
    name: 'Antoine Bernard',
    role: 'Head of AI',
    bio: '8 ans de recherche en NLP et détection d\'anomalies comportementales.',
    linkedin: 'https://linkedin.com',
  },
  {
    initials: 'CR',
    color: '#fbbf24',
    name: 'Camille Rousseau',
    role: 'Head of Sales',
    bio: 'Ancienne directrice commerciale chez CrowdStrike France.',
    linkedin: 'https://linkedin.com',
  },
  {
    initials: 'PM',
    color: '#fb7185',
    name: 'Pierre Moreau',
    role: 'Lead Engineer',
    bio: 'Expert infrastructure cloud-native, contributeur actif à l\'écosystème Rust.',
    linkedin: 'https://linkedin.com',
  },
  {
    initials: 'EF',
    color: '#7dd3fc',
    name: 'Emma Fontaine',
    role: 'UX Designer',
    bio: 'Spécialisée en design de sécurité et interfaces à haute densité d\'information.',
    linkedin: 'https://linkedin.com',
  },
]

const timeline = [
  { year: '2020', title: 'Création', description: 'Julien et Sophie fondent PhishGuard.IA à Paris avec une vision : rendre la protection anti-phishing accessible aux PME.' },
  { year: '2021', title: 'Lancement produit v1', description: 'Première version publique de la plateforme. 50 clients early adopters en 3 mois, NPS de 72 dès le lancement.' },
  { year: '2022', title: 'Série A — 5M€', description: 'Levée de fonds menée par Partech Partners. Recrutement de 15 talents et ouverture du bureau lyonnais.' },
  { year: '2023', title: '1 000 clients', description: 'Cap symbolique franchi en septembre. Lancement des intégrations Microsoft 365 et Google Workspace natives.' },
  { year: '2024', title: 'Expansion Europe', description: 'Ouverture des marchés espagnol, allemand et belge. Partenariats signés avec Telindus et Atos.' },
]

const stats = [
  { value: '1 200+', label: 'Clients actifs' },
  { value: '50M+', label: 'Emails analysés' },
  { value: '99.7%', label: 'Précision IA' },
  { value: '6', label: 'Pays couverts' },
]

const jobs = [
  {
    title: 'Senior AI Engineer',
    location: 'Paris — Full Remote OK',
    type: 'CDI',
    description: 'Vous développerez et maintiendrez nos modèles de détection de phishing en production. Stack : Python, PyTorch, Kubernetes, Kafka.',
  },
  {
    title: 'DevSecOps',
    location: 'Paris — Hybride',
    type: 'CDI',
    description: 'En charge de la sécurité de nos pipelines CI/CD et de nos infrastructures cloud AWS/GCP. Certification AWS Security requise.',
  },
  {
    title: 'Account Executive',
    location: 'Paris — Terrain',
    type: 'CDI',
    description: 'Développez notre portefeuille clients grands comptes en France. Expérience SaaS B2B cybersécurité exigée, anglais courant.',
  },
]

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5 },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#060d18]">
      <Header />
      <main>
        {/* Hero */}
        <section className="pt-32 pb-20 px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#34d399]/30 bg-[#34d399]/10 text-[#34d399] text-xs font-medium mb-6">
              À propos de PhishGuard.IA
            </span>
            <h1
              className="text-4xl md:text-5xl font-bold text-[#eaf2fb] mb-6 max-w-3xl mx-auto leading-tight"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              Notre mission : rendre la cybersécurité accessible à toutes les organisations
            </h1>
            <p className="text-[#7a96b4] text-lg max-w-2xl mx-auto leading-relaxed">
              Fondée en 2020 par des experts en cybersécurité et en intelligence artificielle,
              PhishGuard.IA protège des milliers d&apos;entreprises contre les attaques de phishing
              les plus sophistiquées.
            </p>
          </motion.div>
        </section>

        {/* Stats bar */}
        <section className="pb-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              {...fadeUp}
              className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-[#1a2740]"
            >
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className="bg-[#0c1526] px-6 py-8 text-center"
                >
                  <div
                    className="text-3xl font-bold text-[#eaf2fb] mb-1"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-sm text-[#7a96b4]">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 px-4 border-t border-[#1a2740]">
          <div className="max-w-5xl mx-auto">
            <motion.h2
              {...fadeUp}
              className="text-2xl font-bold text-[#eaf2fb] text-center mb-14"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              Nos valeurs
            </motion.h2>
            <div className="grid md:grid-cols-2 gap-6">
              {values.map((val, i) => {
                const Icon = val.icon
                return (
                  <motion.div
                    key={val.title}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="flex gap-5 rounded-2xl border border-[#1a2740] bg-[#0c1526] p-6"
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: `${val.color}15`, border: `1px solid ${val.color}30` }}
                    >
                      <Icon size={20} style={{ color: val.color }} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-[#eaf2fb] mb-2">{val.title}</h3>
                      <p className="text-sm text-[#7a96b4] leading-relaxed">{val.description}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-20 px-4 border-t border-[#1a2740]">
          <div className="max-w-5xl mx-auto">
            <motion.h2
              {...fadeUp}
              className="text-2xl font-bold text-[#eaf2fb] text-center mb-14"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              L&apos;équipe
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-6">
              {team.map((member, i) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ delay: (i % 3) * 0.1, duration: 0.5 }}
                  className="rounded-2xl border border-[#1a2740] bg-[#0c1526] p-6 text-center"
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-lg font-bold text-[#060d18]"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.initials}
                  </div>
                  <h3 className="text-base font-semibold text-[#eaf2fb] mb-0.5">{member.name}</h3>
                  <p className="text-xs font-medium mb-3" style={{ color: member.color }}>{member.role}</p>
                  <p className="text-sm text-[#7a96b4] leading-relaxed mb-4">{member.bio}</p>
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-[#7a96b4] hover:text-[#7dd3fc] transition-colors"
                  >
                    <Linkedin size={13} />
                    LinkedIn
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-20 px-4 border-t border-[#1a2740]">
          <div className="max-w-3xl mx-auto">
            <motion.h2
              {...fadeUp}
              className="text-2xl font-bold text-[#eaf2fb] text-center mb-14"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              Notre histoire
            </motion.h2>
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[7.5rem] top-0 bottom-0 w-px bg-[#1a2740] hidden md:block" />
              <div className="space-y-8">
                {timeline.map((item, i) => (
                  <motion.div
                    key={item.year}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ delay: i * 0.08, duration: 0.5 }}
                    className="md:flex gap-8 items-start"
                  >
                    <div className="hidden md:flex flex-col items-end w-28 shrink-0 pt-1">
                      <span
                        className="text-sm font-bold"
                        style={{ fontFamily: 'JetBrains Mono, monospace', color: '#7dd3fc' }}
                      >
                        {item.year}
                      </span>
                    </div>
                    {/* Dot */}
                    <div className="hidden md:flex items-center justify-center w-4 shrink-0 pt-1.5">
                      <div className="w-3 h-3 rounded-full border-2 border-[#7dd3fc] bg-[#060d18]" />
                    </div>
                    <div className="rounded-xl border border-[#1a2740] bg-[#0c1526] p-5 flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className="text-xs font-bold text-[#7dd3fc] md:hidden"
                          style={{ fontFamily: 'JetBrains Mono, monospace' }}
                        >
                          {item.year}
                        </span>
                        <h3 className="text-sm font-semibold text-[#eaf2fb]">{item.title}</h3>
                      </div>
                      <p className="text-sm text-[#7a96b4] leading-relaxed">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Job openings */}
        <section className="py-20 px-4 border-t border-[#1a2740]">
          <div className="max-w-3xl mx-auto">
            <motion.div {...fadeUp} className="text-center mb-14">
              <h2 className="text-2xl font-bold text-[#eaf2fb] mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
                Rejoignez l&apos;équipe
              </h2>
              <p className="text-[#7a96b4]">
                Nous recrutons des talents passionnés pour construire l&apos;avenir de la cybersécurité.
              </p>
            </motion.div>
            <div className="space-y-4">
              {jobs.map((job, i) => (
                <motion.div
                  key={job.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="rounded-2xl border border-[#1a2740] bg-[#0c1526] p-6 hover:border-[#7dd3fc]/30 transition-all group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="text-base font-semibold text-[#eaf2fb]">{job.title}</h3>
                        <span className="bg-[#7dd3fc]/10 text-[#7dd3fc] text-xs font-medium px-2.5 py-0.5 rounded-full border border-[#7dd3fc]/20">
                          {job.type}
                        </span>
                      </div>
                      <p className="text-xs text-[#7a96b4] mb-3">{job.location}</p>
                      <p className="text-sm text-[#7a96b4] leading-relaxed">{job.description}</p>
                    </div>
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#1a2740] text-sm text-[#eaf2fb] font-medium hover:border-[#7dd3fc]/40 hover:bg-[#7dd3fc]/5 transition-all group-hover:border-[#7dd3fc]/30 shrink-0"
                    >
                      Postuler
                      <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.p {...fadeUp} className="text-center text-sm text-[#7a96b4] mt-8">
              Vous ne trouvez pas votre bonheur ?{' '}
              <Link href="/contact" className="text-[#7dd3fc] hover:underline">
                Envoyez-nous une candidature spontanée
              </Link>
            </motion.p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
