'use client'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const sections = [
  { id: 'intro', title: 'Introduction' },
  { id: 'responsable', title: 'Responsable du traitement' },
  { id: 'donnees', title: 'Données collectées' },
  { id: 'finalites', title: 'Finalités du traitement' },
  { id: 'base', title: 'Base légale' },
  { id: 'duree', title: 'Durée de conservation' },
  { id: 'destinataires', title: 'Destinataires' },
  { id: 'droits', title: 'Vos droits (RGPD)' },
  { id: 'cookies', title: 'Cookies' },
  { id: 'securite', title: 'Sécurité' },
  { id: 'contact', title: 'Contact DPO' },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#060d18]">
      <Header />
      <main className="pt-28 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <span className="text-xs text-[#7a96b4]">Dernière mise à jour : 8 juin 2026</span>
            <h1 className="text-3xl font-bold text-[#eaf2fb] mt-2" style={{ fontFamily: 'Syne, sans-serif' }}>
              Politique de Confidentialité
            </h1>
          </div>
          <div className="grid lg:grid-cols-4 gap-10">
            {/* TOC */}
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
            {/* Content */}
            <div className="lg:col-span-3 space-y-10">
              <section id="intro">
                <h2 className="text-xl font-bold text-[#eaf2fb] mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>1. Introduction</h2>
                <div className="space-y-3 text-sm text-[#7a96b4] leading-relaxed">
                  <p>PhishGuard.IA (ci-après "nous", "notre société") s'engage à protéger la vie privée de ses utilisateurs. La présente politique de confidentialité décrit comment nous collectons, utilisons et protégeons vos données personnelles conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés.</p>
                  <p>En utilisant notre service, vous acceptez les pratiques décrites dans la présente politique. Nous vous encourageons à la lire attentivement et à nous contacter si vous avez des questions.</p>
                </div>
              </section>
              <section id="responsable">
                <h2 className="text-xl font-bold text-[#eaf2fb] mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>2. Responsable du traitement</h2>
                <div className="space-y-3 text-sm text-[#7a96b4] leading-relaxed">
                  <p>PhishGuard.IA est un projet développé par Matis L., Sami H. et Lucas M. (équipe fondatrice). La structure juridique est en cours de création.</p>
                  <p>Pour toute question relative au traitement de vos données, vous pouvez nous contacter à l'adresse email : <span className="text-[#7dd3fc]">oclaw78@gmail.com</span></p>
                </div>
              </section>
              <section id="donnees">
                <h2 className="text-xl font-bold text-[#eaf2fb] mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>3. Données collectées</h2>
                <div className="space-y-3 text-sm text-[#7a96b4] leading-relaxed">
                  <p><strong className="text-[#eaf2fb]">Données d'identification :</strong> Nom, prénom, adresse email professionnelle, nom de l'entreprise, numéro de téléphone.</p>
                  <p><strong className="text-[#eaf2fb]">Données d'utilisation :</strong> Emails soumis à l'analyse (métadonnées uniquement : expéditeur, destinataire, objet, horodatage), résultats d'analyses, logs d'activité.</p>
                  <p><strong className="text-[#eaf2fb]">Données techniques :</strong> Adresse IP, type de navigateur, système d'exploitation, pages visitées, durée des sessions.</p>
                  <p><strong className="text-[#eaf2fb]">Données de facturation :</strong> Informations de paiement traitées de manière sécurisée par notre prestataire Stripe (nous ne stockons pas vos données bancaires).</p>
                </div>
              </section>
              <section id="finalites">
                <h2 className="text-xl font-bold text-[#eaf2fb] mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>4. Finalités du traitement</h2>
                <div className="space-y-3 text-sm text-[#7a96b4] leading-relaxed">
                  <p>Nous traitons vos données pour : (1) fournir le service d'analyse anti-phishing, (2) gérer votre compte et votre abonnement, (3) améliorer nos modèles d'IA (données anonymisées), (4) vous envoyer des communications de service et, avec votre consentement, des communications marketing, (5) respecter nos obligations légales.</p>
                </div>
              </section>
              <section id="base">
                <h2 className="text-xl font-bold text-[#eaf2fb] mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>5. Base légale</h2>
                <div className="space-y-3 text-sm text-[#7a96b4] leading-relaxed">
                  <p>Les traitements reposent sur : l'exécution du contrat de service (art. 6.1.b RGPD), notre intérêt légitime à améliorer notre service et prévenir la fraude (art. 6.1.f), vos consentements pour les communications marketing (art. 6.1.a), et le respect de nos obligations légales (art. 6.1.c).</p>
                </div>
              </section>
              <section id="duree">
                <h2 className="text-xl font-bold text-[#eaf2fb] mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>6. Durée de conservation</h2>
                <div className="space-y-3 text-sm text-[#7a96b4] leading-relaxed">
                  <p>Données de compte : durée de l'abonnement + 3 ans. Logs d'analyse : 12 mois glissants. Données de facturation : 10 ans (obligation légale). Cookies analytiques : 13 mois maximum.</p>
                </div>
              </section>
              <section id="destinataires">
                <h2 className="text-xl font-bold text-[#eaf2fb] mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>7. Destinataires des données</h2>
                <div className="space-y-3 text-sm text-[#7a96b4] leading-relaxed">
                  <p>Vos données peuvent être partagées avec nos sous-traitants : Supabase (hébergeur base de données), Vercel (hébergeur web), Stripe (paiement), Google Gemini (analyse IA). Tous sont soumis à des contrats de traitement conformes au RGPD. Aucune donnée n'est vendue à des tiers.</p>
                </div>
              </section>
              <section id="droits">
                <h2 className="text-xl font-bold text-[#eaf2fb] mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>8. Vos droits (RGPD)</h2>
                <div className="space-y-3 text-sm text-[#7a96b4] leading-relaxed">
                  <p>Vous disposez des droits suivants : <strong className="text-[#eaf2fb]">accès</strong> (obtenir une copie de vos données), <strong className="text-[#eaf2fb]">rectification</strong> (corriger des données inexactes), <strong className="text-[#eaf2fb]">effacement</strong> ("droit à l'oubli"), <strong className="text-[#eaf2fb]">portabilité</strong> (recevoir vos données en format structuré), <strong className="text-[#eaf2fb]">opposition</strong> (s'opposer à certains traitements), <strong className="text-[#eaf2fb]">limitation</strong> du traitement.</p>
                  <p>Pour exercer vos droits, contactez-nous à <span className="text-[#7dd3fc]">oclaw78@gmail.com</span>. Vous pouvez également introduire une réclamation auprès de la CNIL (www.cnil.fr).</p>
                </div>
              </section>
              <section id="cookies">
                <h2 className="text-xl font-bold text-[#eaf2fb] mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>9. Cookies</h2>
                <div className="space-y-3 text-sm text-[#7a96b4] leading-relaxed">
                  <p>Nous utilisons des cookies strictement nécessaires au fonctionnement du service (session, CSRF), des cookies analytiques (Plausible Analytics, sans données personnelles) et des cookies de préférence (thème, langue). Vous pouvez gérer vos préférences de cookies via notre bandeau de consentement.</p>
                </div>
              </section>
              <section id="securite">
                <h2 className="text-xl font-bold text-[#eaf2fb] mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>10. Sécurité</h2>
                <div className="space-y-3 text-sm text-[#7a96b4] leading-relaxed">
                  <p>Nous appliquons des mesures techniques et organisationnelles appropriées : chiffrement TLS en transit, chiffrement au repos, accès restreint par rôle, monitoring continu et sauvegardes chiffrées.</p>
                </div>
              </section>
              <section id="contact">
                <h2 className="text-xl font-bold text-[#eaf2fb] mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>11. Contact et DPO</h2>
                <div className="space-y-3 text-sm text-[#7a96b4] leading-relaxed">
                  <p>Référent protection des données : <strong className="text-[#eaf2fb]">Équipe PhishGuard.IA</strong></p>
                  <p>Email : <span className="text-[#7dd3fc]">oclaw78@gmail.com</span></p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
