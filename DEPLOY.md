# PhishGuard.IA — Déploiement Vercel

## Prérequis

1. Compte [Vercel](https://vercel.com) (gratuit)
2. Repo GitHub avec le projet

---

## Étapes de déploiement

### 1. Push sur GitHub
```bash
git init
git add .
git commit -m "feat: PhishGuard.IA v1.0"
git remote add origin https://github.com/TON_USERNAME/phishguard-ia.git
git push -u origin main
```

### 2. Importer sur Vercel
1. Va sur [vercel.com/new](https://vercel.com/new)
2. **Import** ton repo GitHub
3. Framework détecté automatiquement : **Next.js**
4. Clique **Deploy** (Vercel lit automatiquement les variables d'environnement)

### 3. Variables d'environnement Vercel
Dans **Settings → Environment Variables**, ajoute :

| Variable | Valeur |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | (depuis .env.local) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (depuis .env.local) |
| `SUPABASE_SERVICE_ROLE_KEY` | (depuis .env.local) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | (depuis .env.local) |
| `STRIPE_SECRET_KEY` | (depuis .env.local) |
| `STRIPE_WEBHOOK_SECRET` | (depuis .env.local) |
| `STRIPE_MONTHLY_PRO_PRICE_ID` | (depuis .env.local) |
| `STRIPE_ANNUAL_PRO_PRICE_ID` | (depuis .env.local) |
| `STRIPE_MONTHLY_STARTER_PRICE_ID` | (depuis .env.local) |
| `STRIPE_ANNUAL_STARTER_PRICE_ID` | (depuis .env.local) |
| `GOOGLE_CLIENT_ID` | (depuis .env.local) |
| `GOOGLE_CLIENT_SECRET` | (depuis .env.local) |
| `GEMINI_API_KEY` | (depuis .env.local) |
| `NEXT_PUBLIC_APP_URL` | `https://phishguard-ia.vercel.app` (ton domaine Vercel) |
| `CRON_SECRET` | `phishguard-cron-2026` |

### 4. Après déploiement
- Mets à jour `NEXT_PUBLIC_APP_URL` avec ton vrai domaine Vercel
- Mets à jour l'**URI de redirection** dans Google Cloud Console :
  - `https://phishguard-ia.vercel.app/api/v1/mail/callback`
- Mets à jour l'**URI de redirection** dans Stripe Dashboard

### 5. Cron Vercel (sync mail auto)
Le fichier `vercel.json` configure automatiquement un cron toutes les 2 minutes sur `/api/v1/mail/sync`.  
Nécessite le **plan Pro Vercel** ($20/mois) pour les crons.  
Alternativement, utilise **Supabase Edge Functions** (gratuit).

---

## Supabase — Migration SQL requise

Exécute ce SQL dans le **SQL Editor** de Supabase Dashboard :

```sql
-- Fichier : supabase/migrations/20260608_mail_connections.sql
```

Voir le fichier complet dans `supabase/migrations/`.

---

## Domaine personnalisé
Dans Vercel → Settings → Domains → ajoute `phishguard.ia` ou ton domaine.
