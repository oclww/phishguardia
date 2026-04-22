# PhishGuard.IA

Plateforme SaaS de protection anti-phishing par intelligence artificielle.

## Setup (3 commandes)

```bash
npm install
cp .env.example .env.local
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## Stack

- **Next.js 14** App Router + TypeScript
- **Tailwind CSS** + Framer Motion
- **Recharts** + Lucide React
- **next-themes** (dark mode)

## Pages publiques

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | Connexion |
| `/register` | Inscription |
| `/pricing` | Tarifs |
| `/features` | Fonctionnalités |
| `/blog` | Blog |
| `/about` | À propos |
| `/contact` | Contact |

## Dashboard (protégé)

| Route | Description |
|-------|-------------|
| `/dashboard` | Vue générale |
| `/dashboard/threats` | Menaces |
| `/dashboard/emails` | Emails analysés |
| `/dashboard/reports` | Rapports |
| `/dashboard/settings` | Paramètres |
| `/dashboard/team` | Équipe |
| `/dashboard/billing` | Facturation |
| `/dashboard/api` | Clés API |

> Auth simulée : identifiants `demo@phishguard.ia` / `Demo1234!`
