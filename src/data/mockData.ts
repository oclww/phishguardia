import type { Threat, Email, Report, TeamMember, ApiKey, Invoice } from '@/types'

export const mockThreats: Threat[] = []

export const mockEmails: Email[] = []

export const mockReports: Report[] = []

export const mockTeamMembers: TeamMember[] = []

export const mockApiKeys: ApiKey[] = []

export const mockInvoices: Invoice[] = []

export const chartData = [
  { date: 'Aujourd\'hui', emails: 0, threats: 0 },
]

export const threatTypesData = [
  { name: 'Aucune donnée', value: 1, color: '#e5e7eb' },
]

export const threatsByDayData = [
  { day: 'Lun', phishing: 0, malware: 0, bec: 0, spam: 0, spear: 0 },
  { day: 'Mar', phishing: 0, malware: 0, bec: 0, spam: 0, spear: 0 },
  { day: 'Mer', phishing: 0, malware: 0, bec: 0, spam: 0, spear: 0 },
  { day: 'Jeu', phishing: 0, malware: 0, bec: 0, spam: 0, spear: 0 },
  { day: 'Ven', phishing: 0, malware: 0, bec: 0, spam: 0, spear: 0 },
  { day: 'Sam', phishing: 0, malware: 0, bec: 0, spam: 0, spear: 0 },
  { day: 'Dim', phishing: 0, malware: 0, bec: 0, spam: 0, spear: 0 },
]

// ─── Public Pricing Plans ────────────────────────────────────────────────────

export interface PricingPlan {
  id: string
  name: string
  monthlyPrice: number | null
  annualPrice: number | null
  description: string
  features: string[]
  notIncluded: string[]
  cta: string
  highlighted: boolean
  badge?: string
}

export const pricingPlans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 29,
    annualPrice: 23,
    description: 'Idéal pour les petites équipes qui souhaitent démarrer.',
    features: [
      "Jusqu'à 5 utilisateurs",
      '10 000 emails analysés/mois',
      'Détection IA basique',
      'Tableau de bord simplifié',
      'Alertes email',
      'Support communautaire',
      'API REST (1 000 req/jour)',
    ],
    notIncluded: [
      'Analyse comportementale avancée',
      'Intégrations Slack/Teams',
      'SIEM integration',
      'SSO/SAML',
      'SLA garanti',
    ],
    cta: 'Démarrer gratuitement',
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 79,
    annualPrice: 63,
    description: 'Pour les équipes en croissance avec des besoins avancés.',
    features: [
      "Jusqu'à 50 utilisateurs",
      '500 000 emails analysés/mois',
      'Détection IA avancée',
      'Analyse comportementale',
      'Dashboard temps réel',
      'Intégrations Slack & Teams',
      'API REST illimitée',
      'Rapports PDF automatiques',
      'Support prioritaire',
      'SLA 99.9% uptime',
    ],
    notIncluded: [
      'SIEM integration',
      'SSO/SAML',
      'Déploiement on-premise',
    ],
    cta: 'Essai gratuit 14 jours',
    highlighted: true,
    badge: 'Le plus populaire',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: null,
    annualPrice: null,
    description: 'Solution complète pour les grandes organisations.',
    features: [
      'Utilisateurs illimités',
      'Emails illimités',
      'Détection IA sur mesure',
      'Analyse comportementale avancée',
      'SIEM integration (Splunk, QRadar)',
      'SSO/SAML',
      'Déploiement on-premise ou cloud privé',
      'Sandbox email avancé',
      'SLA 99.99% garanti',
      'Support dédié 24/7',
      'Formation équipes incluse',
      'Audit de sécurité annuel',
    ],
    notIncluded: [],
    cta: "Contacter l'équipe commerciale",
    highlighted: false,
  },
]

// ─── Blog Posts ──────────────────────────────────────────────────────────────

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  category: 'Phishing' | 'Sécurité' | 'Guide' | 'Actualités' | 'Technique'
  author: { name: string; role: string; avatar: string }
  date: string
  readingTime: number
  coverColor: string
  content: string
  tags: string[]
}

export const mockBlogPosts: BlogPost[] = [
  {
    id: 'post_01',
    slug: 'nouvelles-techniques-phishing-2025',
    title: 'Les nouvelles techniques de phishing en 2025 : ce que vous devez savoir',
    excerpt: "Les cybercriminels redoublent d'ingéniosité. Découvrez les vecteurs d'attaque émergents et comment l'IA permet d'y faire face efficacement.",
    category: 'Phishing',
    author: { name: 'Antoine Bernard', role: 'Head of AI', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Antoine' },
    date: '2025-03-18',
    readingTime: 8,
    coverColor: 'from-[#7dd3fc]/30 to-[#a78bfa]/30',
    tags: ['phishing', 'ia', 'cybersécurité', '2025'],
    content: `## L'évolution du phishing par IA générative

Les attaquants utilisent désormais des modèles de langage pour générer des emails de phishing parfaitement rédigés, sans fautes d'orthographe, adaptés au contexte de l'entreprise ciblée. Ces emails dits "spear phishing augmenté" imitent le style d'écriture de collègues réels.

## Le vishing et smishing boostés par les deepfakes

Au-delà de l'email, les attaques vocales (vishing) utilisent maintenant des voix synthétiques indistinguables des originaux. Un directeur financier peut recevoir un appel de son "PDG" lui demandant un virement urgent.

## L'attaque par QR code (quishing)

Les codes QR intégrés dans des emails ou affiches physiques dirigent les victimes vers des pages de collecte d'identifiants. Ces URLs échappent souvent aux filtres traditionnels car elles ne sont pas directement analysées.

## Comment l'IA contre-attaque

PhishGuard.IA analyse plus de 200 signaux contextuels en temps réel : ton de l'email, historique de l'expéditeur, anomalies de domaine, structure linguistique, et metadata des pièces jointes. Notre modèle est ré-entraîné chaque 48 heures sur les nouvelles menaces.

## Recommandations pratiques

1. Activez l'authentification multi-facteurs sur tous les comptes critiques
2. Formez régulièrement vos équipes avec des simulations de phishing
3. Mettez en place un protocole de vérification pour les demandes financières
4. Utilisez une solution de protection email avec analyse IA en temps réel`,
  },
  {
    id: 'post_02',
    slug: 'guide-mise-en-place-dmarc-dkim-spf',
    title: 'Guide complet : configurer SPF, DKIM et DMARC pour protéger votre domaine',
    excerpt: "La trinité des standards d'authentification email expliquée pas à pas. Protégez votre domaine contre l'usurpation d'identité.",
    category: 'Guide',
    author: { name: 'Pierre Moreau', role: 'Lead Engineer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pierre' },
    date: '2025-03-05',
    readingTime: 12,
    coverColor: 'from-[#34d399]/30 to-[#7dd3fc]/30',
    tags: ['spf', 'dkim', 'dmarc', 'dns', 'guide'],
    content: `## Pourquoi configurer SPF, DKIM et DMARC ?

Ces trois protocoles forment une barrière essentielle contre l'usurpation d'identité par email. Sans eux, n'importe qui peut envoyer un email en se faisant passer pour votre domaine.

## SPF : Sender Policy Framework

SPF définit quels serveurs sont autorisés à envoyer des emails pour votre domaine via un enregistrement DNS TXT.

Exemple d'enregistrement SPF :
v=spf1 include:_spf.google.com include:mailgun.org ~all

## DKIM : DomainKeys Identified Mail

DKIM ajoute une signature cryptographique aux emails, permettant au destinataire de vérifier que le message n'a pas été altéré.

## DMARC : Domain-based Message Authentication

DMARC définit la politique à appliquer quand SPF ou DKIM échouent. Commencez avec p=none pour surveiller, puis passez à p=quarantine et enfin p=reject.

## Vérification et monitoring

Utilisez des outils comme MXToolbox ou le monitoring DMARC intégré à PhishGuard.IA pour suivre vos rapports et détecter les tentatives d'usurpation.`,
  },
  {
    id: 'post_03',
    slug: 'rapport-cybersecurite-pme-2025',
    title: 'Rapport 2025 : l\'état de la cybersécurité dans les PME françaises',
    excerpt: '73% des PME françaises ont subi au moins une tentative de phishing réussie en 2024. Analyse des données et recommandations.',
    category: 'Actualités',
    author: { name: 'Sophie Leclerc', role: 'CTO', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie' },
    date: '2025-02-20',
    readingTime: 6,
    coverColor: 'from-[#fb7185]/30 to-[#fbbf24]/30',
    tags: ['pme', 'rapport', 'statistiques', 'france'],
    content: `## Méthodologie

Ce rapport s'appuie sur une enquête menée auprès de 1 200 PME françaises entre octobre et décembre 2024, complétée par l'analyse anonymisée de 50 millions d'emails traités par PhishGuard.IA.

## Les chiffres clés

73% des PME interrogées ont subi une attaque de phishing réussie en 2024, contre 58% en 2023. Le coût moyen d'un incident est estimé à 127 000€ en pertes directes et indirectes.

## Les secteurs les plus ciblés

Finance et comptabilité (34% des attaques), RH et recrutement (22%), Direction générale (18%), Informatique (15%), Autres (11%).

## Les vecteurs d'attaque dominants

L'email reste le vecteur principal avec 82% des attaques. La compromission de comptes (BEC) représente désormais 41% des incidents, dépassant pour la première fois le phishing classique.

## Recommandations prioritaires

Face à cette montée en puissance, nos experts recommandent d'investir en priorité dans : la formation des collaborateurs, les solutions de protection email IA, et les outils de détection des anomalies comportementales.`,
  },
  {
    id: 'post_04',
    slug: 'integration-phishguard-microsoft365',
    title: 'Intégrer PhishGuard.IA avec Microsoft 365 : guide pas à pas',
    excerpt: 'Découvrez comment connecter PhishGuard.IA à votre environnement Microsoft 365 en moins de 30 minutes pour une protection maximale.',
    category: 'Technique',
    author: { name: 'Pierre Moreau', role: 'Lead Engineer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pierre' },
    date: '2025-02-10',
    readingTime: 10,
    coverColor: 'from-[#a78bfa]/30 to-[#7dd3fc]/30',
    tags: ['microsoft365', 'intégration', 'office365', 'technique'],
    content: `## Prérequis

Pour cette intégration vous aurez besoin d'un accès administrateur à votre tenant Microsoft 365 et d'un compte PhishGuard.IA avec le plan Pro ou Enterprise.

## Étape 1 : Créer l'application Azure AD

Dans le portail Azure, créez une nouvelle application avec les permissions : Mail.Read, Mail.ReadWrite, MailboxSettings.ReadWrite.

## Étape 2 : Configurer le connecteur dans PhishGuard.IA

Dans votre dashboard PhishGuard.IA, allez dans Paramètres > Intégrations > Microsoft 365. Saisissez votre Tenant ID, Client ID et Client Secret.

## Étape 3 : Configurer les règles de transport

Créez une règle de transport dans Exchange Online pour rediriger les emails suspects vers la quarantaine PhishGuard.IA.

## Étape 4 : Tester l'intégration

Envoyez un email de test depuis l'outil de simulation PhishGuard.IA pour vérifier que le flux fonctionne correctement.

## Résultats attendus

Après configuration, 100% des emails entrants passeront par l'analyse IA PhishGuard.IA avant d'être délivrés dans les boîtes de vos collaborateurs.`,
  },
  {
    id: 'post_05',
    slug: 'formation-anti-phishing-equipes',
    title: 'Former vos équipes contre le phishing : les meilleures pratiques',
    excerpt: 'La technologie seule ne suffit pas. Voici comment construire une culture de cybersécurité solide au sein de votre organisation.',
    category: 'Guide',
    author: { name: 'Camille Rousseau', role: 'Head of Sales', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Camille' },
    date: '2025-01-28',
    readingTime: 7,
    coverColor: 'from-[#34d399]/30 to-[#a78bfa]/30',
    tags: ['formation', 'sensibilisation', 'culture', 'équipes'],
    content: `## Pourquoi la formation humaine est indispensable

Même avec les meilleures solutions techniques, 90% des violations de données impliquent une erreur humaine. La formation régulière réduit le taux de clics sur les liens de phishing de 67%.

## Simuler des attaques réelles

PhishGuard.IA permet de créer des campagnes de phishing simulées adaptées à votre secteur d'activité. Ces exercices mesurent le taux de vulnérabilité de vos équipes.

## Construire un programme de formation efficace

Un bon programme inclut : modules e-learning mensuels (15 minutes max), simulations trimestrielles, sessions live annuelles avec retour d'expérience, et rappels contextuels quand un collaborateur clique sur une simulation.

## Mesurer les progrès

Trackez l'évolution du taux de clic sur les simulations, le délai de signalement des emails suspects, et le score de sensibilisation global par département.

## Créer une culture de signalement

Encouragez vos collaborateurs à signaler les emails suspects sans crainte d'être jugés. Le bouton "Signaler" intégré à PhishGuard.IA simplifie ce processus.`,
  },
  {
    id: 'post_06',
    slug: 'zero-trust-securite-email',
    title: 'Zero Trust appliqué à la sécurité email : principes et mise en œuvre',
    excerpt: "L'architecture Zero Trust révolutionne la cybersécurité. Comment l'appliquer concrètement à votre infrastructure email.",
    category: 'Sécurité',
    author: { name: 'Antoine Bernard', role: 'Head of AI', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Antoine' },
    date: '2025-01-15',
    readingTime: 9,
    coverColor: 'from-[#fbbf24]/30 to-[#fb7185]/30',
    tags: ['zero-trust', 'architecture', 'sécurité', 'avancé'],
    content: `## Le principe Zero Trust

"Ne jamais faire confiance, toujours vérifier." Ce principe fondateur s'oppose aux modèles de sécurité périmétrique traditionnels où tout ce qui est dans le réseau interne est considéré sûr.

## Appliquer Zero Trust à l'email

Dans une architecture Zero Trust pour l'email : chaque email est inspecté indépendamment de son origine, les pièces jointes sont exécutées en sandbox, les URLs sont vérifiées au moment du clic, et les comportements inhabituels déclenchent une re-authentification.

## Les 5 piliers du Zero Trust Email

1. Vérification de l'identité de l'expéditeur (SPF/DKIM/DMARC + réputation)
2. Inspection profonde du contenu (IA + pattern matching)
3. Analyse comportementale (comparaison avec l'historique)
4. Sandboxing des pièces jointes
5. Vérification dynamique des URLs

## Intégration avec PhishGuard.IA

PhishGuard.IA implémente nativement ces 5 piliers dans une architecture unifiée, s'intégrant avec vos solutions IAM (Okta, Azure AD) pour une approche Zero Trust complète.`,
  },
]
