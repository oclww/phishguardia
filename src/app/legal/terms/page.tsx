'use client'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const sections = [
  { id: 'objet', title: 'Objet et champ d\'application' },
  { id: 'acceptation', title: 'Acceptation des CGU' },
  { id: 'service', title: 'Description du service' },
  { id: 'compte', title: 'Création de compte' },
  { id: 'tarifs', title: 'Tarifs et paiement' },
  { id: 'duree', title: 'Durée et résiliation' },
  { id: 'obligations', title: 'Obligations utilisateur' },
  { id: 'pi', title: 'Propriété intellectuelle' },
  { id: 'donnees', title: 'Protection des données' },
  { id: 'responsabilite', title: 'Limitation de responsabilité' },
  { id: 'force', title: 'Force majeure' },
  { id: 'droit', title: 'Droit applicable' },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#060d18]">
      <Header />
      <main className="pt-28 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <span className="text-xs text-[#7a96b4]">Dernière mise à jour : 8 juin 2026</span>
            <h1 className="text-3xl font-bold text-[#eaf2fb] mt-2" style={{ fontFamily: 'Syne, sans-serif' }}>
              Conditions Générales d&apos;Utilisation
            </h1>
          </div>
          <div className="grid lg:grid-cols-4 gap-10">
            <aside className="hidden lg:block">
              <div className="sticky top-24 rounded-2xl border border-[#1a2740] bg-[#0c1526] p-5">
                <h3 className="text-xs font-semibold text-[#eaf2fb] uppercase tracking-wider mb-4">Sommaire</h3>
                <ul className="space-y-2">
                  {sections.map((s, i) => (
                    <li key={s.id}>
                      <a href={`#${s.id}`} className="text-sm text-[#7a96b4] hover:text-[#7dd3fc] transition-colors flex items-center gap-2">
                        <span className="text-xs text-[#1a2740]">{String(i + 1).padStart(2, '0')}</span>
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
            <div className="lg:col-span-3 space-y-10">
              <section id="objet">
                <h2 className="text-xl font-bold text-[#eaf2fb] mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>1. Objet et champ d&apos;application</h2>
                <p className="text-sm text-[#7a96b4] leading-relaxed">Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;accès et l&apos;utilisation de la plateforme PhishGuard.IA, service SaaS de détection anti-phishing par intelligence artificielle. Elles s&apos;appliquent à toute personne physique ou morale qui accède au service.</p>
              </section>
              <section id="acceptation">
                <h2 className="text-xl font-bold text-[#eaf2fb] mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>2. Acceptation des CGU</h2>
                <p className="text-sm text-[#7a96b4] leading-relaxed">L&apos;utilisation du service vaut acceptation pleine et entière des présentes CGU. Si vous n&apos;acceptez pas ces conditions, vous ne devez pas utiliser le service. PhishGuard.IA se réserve le droit de modifier les CGU à tout moment, avec notification préalable de 30 jours par email.</p>
              </section>
              <section id="service">
                <h2 className="text-xl font-bold text-[#eaf2fb] mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>3. Description du service</h2>
                <p className="text-sm text-[#7a96b4] leading-relaxed">PhishGuard.IA propose un service d&apos;analyse d&apos;emails par intelligence artificielle permettant de détecter les tentatives de phishing, malwares, et autres menaces. Le service est fourni en mode SaaS (Software as a Service) via une interface web et une API REST.</p>
              </section>
              <section id="compte">
                <h2 className="text-xl font-bold text-[#eaf2fb] mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>4. Création de compte</h2>
                <p className="text-sm text-[#7a96b4] leading-relaxed">L&apos;inscription requiert des informations exactes et à jour. Chaque compte est strictement personnel et ne peut être partagé. L&apos;utilisateur est responsable de la confidentialité de ses identifiants et de toute activité effectuée depuis son compte. Tout usage frauduleux doit être signalé immédiatement.</p>
              </section>
              <section id="tarifs">
                <h2 className="text-xl font-bold text-[#eaf2fb] mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>5. Tarifs et conditions de paiement</h2>
                <p className="text-sm text-[#7a96b4] leading-relaxed">Les tarifs sont indiqués HT sur la page Tarifs. La facturation est mensuelle ou annuelle selon le plan choisi. Le paiement s&apos;effectue par carte bancaire via Stripe. En cas de non-paiement, l&apos;accès au service peut être suspendu après 7 jours de retard. Les prix peuvent être modifiés avec un préavis de 30 jours.</p>
              </section>
              <section id="duree">
                <h2 className="text-xl font-bold text-[#eaf2fb] mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>6. Durée et résiliation</h2>
                <p className="text-sm text-[#7a96b4] leading-relaxed">Le contrat est conclu pour une durée indéterminée. L&apos;utilisateur peut résilier à tout moment depuis son espace client, avec effet à la fin de la période de facturation en cours. PhishGuard.IA peut résilier le contrat en cas de violation des CGU, avec notification préalable sauf en cas de faute grave.</p>
              </section>
              <section id="obligations">
                <h2 className="text-xl font-bold text-[#eaf2fb] mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>7. Obligations de l&apos;utilisateur</h2>
                <p className="text-sm text-[#7a96b4] leading-relaxed">L&apos;utilisateur s&apos;engage à utiliser le service conformément à sa destination, à ne pas tenter de compromettre la sécurité de la plateforme, à respecter les droits des tiers, et à ne pas utiliser le service à des fins illicites. L&apos;utilisation de l&apos;API est soumise aux limites de taux définies par plan.</p>
              </section>
              <section id="pi">
                <h2 className="text-xl font-bold text-[#eaf2fb] mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>8. Propriété intellectuelle</h2>
                <p className="text-sm text-[#7a96b4] leading-relaxed">L&apos;ensemble des éléments constituant la plateforme (logiciels, algorithmes, interfaces, marques) sont la propriété exclusive de PhishGuard.IA SAS et sont protégés par le droit de la propriété intellectuelle. Toute reproduction ou utilisation non autorisée est strictement interdite.</p>
              </section>
              <section id="donnees">
                <h2 className="text-xl font-bold text-[#eaf2fb] mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>9. Protection des données personnelles</h2>
                <p className="text-sm text-[#7a96b4] leading-relaxed">Le traitement des données personnelles est encadré par notre Politique de Confidentialité, disponible sur notre site. PhishGuard.IA agit en qualité de sous-traitant pour les données des emails analysés et de responsable de traitement pour les données de compte.</p>
              </section>
              <section id="responsabilite">
                <h2 className="text-xl font-bold text-[#eaf2fb] mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>10. Limitation de responsabilité</h2>
                <p className="text-sm text-[#7a96b4] leading-relaxed">PhishGuard.IA ne peut garantir une détection à 100% de toutes les menaces. La responsabilité de PhishGuard.IA est limitée aux dommages directs et au montant des sommes versées au cours des 12 derniers mois. Nous déclinons toute responsabilité pour les dommages indirects ou les pertes de données.</p>
              </section>
              <section id="force">
                <h2 className="text-xl font-bold text-[#eaf2fb] mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>11. Force majeure</h2>
                <p className="text-sm text-[#7a96b4] leading-relaxed">PhishGuard.IA ne saurait être tenue responsable en cas d&apos;inexécution due à un événement de force majeure au sens de l&apos;article 1218 du Code civil français (catastrophe naturelle, cyberattaque d&apos;ampleur exceptionnelle, pandémie, etc.).</p>
              </section>
              <section id="droit">
                <h2 className="text-xl font-bold text-[#eaf2fb] mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>12. Droit applicable et juridiction</h2>
                <p className="text-sm text-[#7a96b4] leading-relaxed">Les présentes CGU sont soumises au droit français. En cas de litige, les parties s&apos;engagent à rechercher une solution amiable. À défaut, le Tribunal de Commerce de Paris sera seul compétent, sauf règles impératives applicables aux consommateurs.</p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
