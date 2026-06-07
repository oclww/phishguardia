╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║              PHISHGUARD.IA — GUIDE COMPLET DU PRODUIT                       ║
║              Par Matis L., Sami H. et Lucas M.                              ║
║              Version 1.0 — Juin 2026                                        ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  TABLE DES MATIÈRES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  1.  QU'EST-CE QUE PHISHGUARD.IA ?
  2.  COMMENT ÇA MARCHE : LE MOTEUR DE DÉTECTION
  3.  QU'EST-CE QU'UNE "GATEWAY" EMAIL ?
  4.  L'API REST : COMMENT L'UTILISER
  5.  EXEMPLES D'INTÉGRATION (cURL, Python, JavaScript)
  6.  LES RÉSULTATS : COMPRENDRE LA RÉPONSE
  7.  INTÉGRATION AVEC LES GRANDES PLATEFORMES
  8.  PRÉSENTER LE PRODUIT À UN CLIENT
  9.  ARCHITECTURE TECHNIQUE
  10. MISE EN PLACE DU PROJET (pour développeurs)
  11. VARIABLES D'ENVIRONNEMENT
  12. BASE DE DONNÉES (Supabase)
  13. QUESTIONS FRÉQUENTES (FAQ)
  14. CONTACT

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  1. QU'EST-CE QUE PHISHGUARD.IA ?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PhishGuard.IA est une plateforme SaaS de détection anti-phishing par intelligence
artificielle. Elle permet aux entreprises de protéger leurs collaborateurs contre
les emails frauduleux (phishing, BEC, spear-phishing, malware).

  ► Le problème qu'on résout :
    91% des cyberattaques commencent par un email.
    Les filtres anti-spam classiques (règles statiques) ne suffisent plus.
    Les attaques modernes sont personnalisées, bien rédigées, et indétectables
    par les antivirus traditionnels.

  ► Notre réponse :
    Une API REST que n'importe quel système d'email peut appeler en quelques
    lignes de code. L'email est analysé par notre moteur hybride (heuristiques
    avancées + Google Gemini 2.0 Flash IA) et reçoit un score de risque 0-100
    en moins de 2 secondes.

  ► Ce qu'on est aujourd'hui :
    - Plateforme SaaS en ligne : https://phishguardia.vercel.app
    - API REST fonctionnelle avec authentification par clé API
    - Dashboard temps réel avec visualisation des menaces
    - Intégration Gmail via OAuth2
    - Moteur de détection v2 avec 8 catégories d'analyse

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  2. COMMENT ÇA MARCHE : LE MOTEUR DE DÉTECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Quand un email arrive, voici ce qu'il se passe :

  ÉTAPE 1 — Analyse heuristique (rapide, déterministe, 8 signaux)
  ──────────────────────────────────────────────────────────────────

  Le moteur calcule un score sur 8 dimensions :

  ┌─────────────────────────────────┬──────────┬─────────────────────────────┐
  │ Signal                          │ Score max│ Ce qu'on détecte            │
  ├─────────────────────────────────┼──────────┼─────────────────────────────┤
  │ Domain Spoofing                 │ 25 pts   │ "micros0ft.com", punycode,  │
  │                                 │          │ TLDs suspects (.xyz, .tk)   │
  ├─────────────────────────────────┼──────────┼─────────────────────────────┤
  │ Display Name Spoof              │ 20 pts   │ "PayPal Support"            │
  │                                 │          │ <attaquant@gmail.com>        │
  ├─────────────────────────────────┼──────────┼─────────────────────────────┤
  │ Urgency Manipulation            │ 20 pts   │ "Urgent!", "24h", "suspendu"│
  │                                 │          │ "action requise"            │
  ├─────────────────────────────────┼──────────┼─────────────────────────────┤
  │ Suspicious Links                │ 20 pts   │ IP brutes, URL shorteners,  │
  │                                 │          │ ports inhabituels           │
  ├─────────────────────────────────┼──────────┼─────────────────────────────┤
  │ Subject Patterns                │ 15 pts   │ "Compte suspendu", "Vous    │
  │                                 │          │ avez gagné", factures       │
  ├─────────────────────────────────┼──────────┼─────────────────────────────┤
  │ BEC Indicators                  │ 15 pts   │ Fraude au président : CEO   │
  │                                 │          │ via Gmail, demandes virement│
  ├─────────────────────────────────┼──────────┼─────────────────────────────┤
  │ Content Patterns                │ 15 pts   │ Demandes de mot de passe,   │
  │                                 │          │ numéro CB, "cliquez ici"    │
  ├─────────────────────────────────┼──────────┼─────────────────────────────┤
  │ Structural Anomalies            │ 10 pts   │ Corps vide, base64, texte   │
  │                                 │          │ ultra-court avec un lien    │
  └─────────────────────────────────┴──────────┴─────────────────────────────┘

  Score heuristique max = 100 (somme plafonnée)

  ÉTAPE 2 — Enrichissement IA (Google Gemini 2.0 Flash)
  ──────────────────────────────────────────────────────

  Si une clé Gemini est configurée, l'email est envoyé à Gemini avec :
  - Le contenu de l'email (les 800 premiers caractères du corps)
  - Les signaux déjà détectés par les heuristiques
  - Une instruction précise pour retourner un score 0-100 ET une explication
    en français de la menace

  Gemini répond avec : {"score": 87, "explanation": "Email imitant PayPal..."}

  ÉTAPE 3 — Score final (blend pondéré)
  ──────────────────────────────────────

  Score final = (heuristique × 55%) + (Gemini × 45%)

  Ce blend est intentionnel :
  - Les heuristiques sont rapides et déterministes (pas de frais)
  - Gemini apporte le contexte sémantique (compréhension du langage)
  - Ni l'un ni l'autre seul n'est suffisant

  ÉTAPE 4 — Classification de la menace
  ──────────────────────────────────────

  ┌────────────┬────────────┬──────────────┬───────────────────────────────┐
  │ Score      │ Statut     │ Sévérité     │ Type de menace                │
  ├────────────┼────────────┼──────────────┼───────────────────────────────┤
  │ 0 - 24     │ safe       │ low          │ none                          │
  │ 25 - 49    │ quarantined│ low          │ spam                          │
  │ 50 - 74    │ quarantined│ medium/high  │ phishing                      │
  │ 75 - 100   │ blocked    │ critical     │ phishing / spear-phishing     │
  │ BEC détecté│ blocked    │ critical     │ bec (fraude au président)     │
  │ Display+50 │ blocked    │ critical     │ spear-phishing                │
  └────────────┴────────────┴──────────────┴───────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  3. QU'EST-CE QU'UNE "GATEWAY" EMAIL ?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Une "gateway" (passerelle) email est un point de passage obligatoire pour tous
les emails entrants d'une organisation. C'est là qu'on branche notre API.

  Analogie simple pour un client :
  ─────────────────────────────────
  "Imaginez un vigile à l'entrée d'un bureau. Chaque email qui entre, le vigile
  le lit rapidement, appelle notre service (l'API) en 1 seconde, et décide :
  livrer, mettre en quarantaine, ou bloquer."

  Les principales gateways du marché :
  ──────────────────────────────────────

  ┌────────────────────┬──────────────────────────────────────────────────────┐
  │ Plateforme         │ Comment intégrer PhishGuard.IA                       │
  ├────────────────────┼──────────────────────────────────────────────────────┤
  │ Google Workspace   │ Appel API depuis Google Apps Script ou une Cloud Fn  │
  │                    │ dans la règle de routage des emails entrants          │
  ├────────────────────┼──────────────────────────────────────────────────────┤
  │ Microsoft 365      │ Connecteur Exchange Online + règle de transport →    │
  │                    │ webhook PowerAutomate → notre API                    │
  ├────────────────────┼──────────────────────────────────────────────────────┤
  │ Postfix (serveur   │ milter (mail filter) ou script de pipe qui appelle   │
  │ email propre)      │ l'API avant d'accepter le message                    │
  ├────────────────────┼──────────────────────────────────────────────────────┤
  │ n8n / Zapier       │ Workflow automatique : nouveau email → appel API →   │
  │                    │ si score > 70 → déplacer dans dossier spam           │
  ├────────────────────┼──────────────────────────────────────────────────────┤
  │ Proofpoint / Mimecast│ Intégration via leur SDK/API de plugins tiers     │
  └────────────────────┴──────────────────────────────────────────────────────┘

  Ce qu'on fait déjà (Gmail via OAuth2) :
  ─────────────────────────────────────────
  L'utilisateur connecte son compte Gmail. Un job de synchronisation tourne
  périodiquement, récupère les nouveaux emails via l'API Gmail, les analyse
  via notre moteur, et stocke les résultats dans le dashboard.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  4. L'API REST : COMMENT L'UTILISER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  BASE URL : https://phishguardia.vercel.app/api/v1

  ─── Authentification ───────────────────────────────────────────────────────

  Toutes les requêtes nécessitent un header Authorization :

    Authorization: Bearer YOUR_API_KEY

  La clé API se génère depuis le Dashboard → "Clés API".
  Elle ressemble à : pg_live_xxxxxxxxxxxxxxxxxxxx

  ─── Endpoint principal : Analyser un email ─────────────────────────────────

  POST /api/v1/analyze

  Corps de la requête (JSON) :
  ┌─────────────┬──────────┬─────────────────────────────────────────────────┐
  │ Champ       │ Type     │ Description                                     │
  ├─────────────┼──────────┼─────────────────────────────────────────────────┤
  │ from        │ string   │ Adresse email de l'expéditeur (requis)          │
  │             │          │ Exemple: "John <john@evil.com>"                  │
  ├─────────────┼──────────┼─────────────────────────────────────────────────┤
  │ subject     │ string   │ Objet de l'email (requis)                       │
  ├─────────────┼──────────┼─────────────────────────────────────────────────┤
  │ body        │ string   │ Corps du message en texte brut (optionnel)      │
  │             │          │ Les 2000 premiers caractères sont analysés      │
  └─────────────┴──────────┴─────────────────────────────────────────────────┘

  ─── Endpoint batch : Analyser plusieurs emails ─────────────────────────────

  POST /api/v1/batch

  Corps de la requête : tableau d'emails (max 10 par appel)

  {
    "emails": [
      { "from": "...", "subject": "...", "body": "..." },
      { "from": "...", "subject": "...", "body": "..." }
    ]
  }

  Retourne un tableau de résultats dans le même ordre.
  Idéal pour synchroniser un batch d'emails historiques.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  5. EXEMPLES D'INTÉGRATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ─── cURL (test rapide en ligne de commande) ─────────────────────────────────

  curl -X POST https://phishguardia.vercel.app/api/v1/analyze \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "from": "support@paypa1-secure.com",
      "subject": "Action requise — Votre compte est suspendu",
      "body": "Cliquez immédiatement sur ce lien pour éviter la suspension définitive de votre compte : http://bit.ly/xyz123"
    }'

  ─── Python ──────────────────────────────────────────────────────────────────

  import requests

  API_KEY = "YOUR_API_KEY"
  BASE_URL = "https://phishguardia.vercel.app/api/v1"

  def analyser_email(expediteur, sujet, corps=""):
      reponse = requests.post(
          f"{BASE_URL}/analyze",
          headers={
              "Authorization": f"Bearer {API_KEY}",
              "Content-Type": "application/json"
          },
          json={"from": expediteur, "subject": sujet, "body": corps},
          timeout=10
      )
      reponse.raise_for_status()
      return reponse.json()

  # Utilisation
  resultat = analyser_email(
      expediteur="support@paypa1-secure.com",
      sujet="Votre compte est suspendu",
      corps="Cliquez immédiatement..."
  )

  print(f"Score IA    : {resultat['ai_score']}/100")
  print(f"Statut      : {resultat['status']}")
  print(f"Menace      : {resultat['threat_type']}")
  print(f"Explication : {resultat['explanation']}")

  # Décision métier
  if resultat['status'] == 'blocked':
      print("→ Email bloqué automatiquement")
  elif resultat['status'] == 'quarantined':
      print("→ Email mis en quarantaine pour révision")
  else:
      print("→ Email sûr, livré normalement")

  ─── JavaScript / Node.js ────────────────────────────────────────────────────

  const PHISHGUARD_KEY = process.env.PHISHGUARD_API_KEY;

  async function analyserEmail(from, subject, body = '') {
    const res = await fetch('https://phishguardia.vercel.app/api/v1/analyze', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PHISHGUARD_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, subject, body }),
    });

    if (!res.ok) throw new Error(`Erreur API: ${res.status}`);
    return res.json();
  }

  // Dans un webhook Gmail / Microsoft 365 :
  async function traiterEmailEntrant(email) {
    const analyse = await analyserEmail(email.from, email.subject, email.body);
    
    if (analyse.status === 'blocked') {
      await deplacerDansSpam(email.id);
      await alerterAdministrateur(email, analyse);
    } else if (analyse.status === 'quarantined') {
      await deplacerEnQuarantaine(email.id);
    }
    
    return analyse;
  }

  ─── Google Apps Script (intégration Gmail) ──────────────────────────────────

  function analyserNouveauxEmails() {
    var threads = GmailApp.search('in:inbox is:unread', 0, 10);
    var apiKey = PropertiesService.getScriptProperties().getProperty('PHISHGUARD_KEY');
    
    threads.forEach(function(thread) {
      var messages = thread.getMessages();
      var message = messages[messages.length - 1]; // dernier message
      
      var payload = {
        from: message.getFrom(),
        subject: message.getSubject(),
        body: message.getPlainBody().substring(0, 2000)
      };
      
      var options = {
        method: 'POST',
        contentType: 'application/json',
        headers: { 'Authorization': 'Bearer ' + apiKey },
        payload: JSON.stringify(payload)
      };
      
      var reponse = UrlFetchApp.fetch(
        'https://phishguardia.vercel.app/api/v1/analyze',
        options
      );
      
      var resultat = JSON.parse(reponse.getContentText());
      
      if (resultat.status === 'blocked' || resultat.status === 'quarantined') {
        message.moveToTrash(); // ou déplacer dans un label "PhishGuard"
        Logger.log('Email suspect bloqué : ' + message.getSubject());
      }
    });
  }

  // Configurer un déclencheur toutes les 5 minutes dans Google Apps Script

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  6. LES RÉSULTATS : COMPRENDRE LA RÉPONSE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Réponse JSON complète d'un email analysé :

  {
    "success": true,
    "ai_score": 87,                          // Score 0-100 (100 = certitude menace)
    "status": "blocked",                     // safe | quarantined | blocked
    "severity": "critical",                  // low | medium | high | critical
    "threat_type": "spear-phishing",         // none | spam | phishing | spear-phishing | bec | malware
    "engine": "gemini-2.0-flash+heuristic-v2",
    "explanation": "Email imitant PayPal avec un domaine typosquat (paypa1-secure.com) et un lien raccourci vers une page de collecte d'identifiants.",
    "signals": {
      "domain_spoofing": 25,                 // Détail par catégorie
      "display_name_spoof": 20,
      "urgency_manipulation": 16,
      "suspicious_links": 20,
      "subject_patterns": 6,
      "bec_indicators": 0,
      "content_patterns": 0,
      "structural_anomalies": 6
    },
    "findings": [                            // Liste lisible des détections
      "PayPal typosquat",
      "Urgency trigger words",
      "URL shortener detected",
      "Credential harvesting path"
    ],
    "email_id": "uuid-de-l-email-en-base"   // ID en base pour traçabilité
  }

  ─── Signification des champs principaux ─────────────────────────────────────

  ai_score   : 0-100. En dessous de 25 = sûr. Entre 25-74 = surveillance.
               Au-dessus de 75 = bloquer immédiatement.

  status     : La recommandation d'action :
               - "safe"        → Livrer normalement
               - "quarantined" → Mettre de côté, alerter l'utilisateur
               - "blocked"     → Ne pas livrer, alerter l'équipe sécurité

  severity   : Niveau de risque pour prioriser les alertes.

  threat_type: La catégorie de la menace :
               - "bec"           → Fraude au président (le plus dangereux)
               - "spear-phishing"→ Attaque ciblée et personnalisée
               - "phishing"      → Phishing classique (faux PayPal, banque...)
               - "spam"          → Indésirable non dangereux
               - "none"          → Email sûr

  findings   : Explication humainement lisible de ce qui a été détecté.
               Utile pour les rapports et les alertes envoyées aux équipes.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  7. INTÉGRATION AVEC LES GRANDES PLATEFORMES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ─── Google Workspace (Gmail entreprise) ─────────────────────────────────────

  Option 1 — Connexion directe (déjà intégrée dans PhishGuard.IA) :
    → Dashboard → Paramètres → Intégrations → "Connecter Gmail"
    → OAuth2 : l'utilisateur autorise l'accès à ses emails
    → Synchronisation automatique toutes les heures
    → Aucune configuration côté Google requise

  Option 2 — Google Apps Script (pour admin) :
    → Créer un script dans admin.google.com
    → Copier l'exemple JavaScript de la section 5
    → Configurer un déclencheur temporel (toutes les 5 minutes)
    → Stocker la clé API dans PropertiesService

  ─── Microsoft 365 / Exchange ────────────────────────────────────────────────

  Via Power Automate (no-code) :
  1. Créer un flux "Quand un nouvel email arrive dans la boîte de réception"
  2. Ajouter une action "HTTP" → POST vers /api/v1/analyze
  3. Ajouter une condition : si ai_score > 70 → déplacer dans "Spam PhishGuard"
  4. Optionnel : envoyer une alerte Teams si status = "blocked"

  Via Exchange Transport Rules (avancé) :
  → Configurer une règle de transport qui route les emails vers un journal
  → Le journal appelle un webhook → notre API
  → Recommandé pour les grandes organisations (1000+ boîtes)

  ─── n8n (workflow automation) ───────────────────────────────────────────────

  n8n est un outil no-code que beaucoup de DSI utilisent.
  L'intégration se fait en 4 nœuds :

  [Webhook Gmail/IMAP] → [HTTP Request → /api/v1/analyze] → [IF score > 70] → [Alerter Slack/Email]

  ─── Postfix (serveur email auto-hébergé) ────────────────────────────────────

  Pour les clients avec leur propre serveur mail :
  1. Configurer un script de pipe dans Postfix
  2. Le script intercepte chaque email, appelle l'API
  3. Si status = "blocked" → retourner code 550 (rejet) ou 451 (temporaire)
  4. Si status = "quarantined" → rediriger vers boîte quarantaine

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  8. PRÉSENTER LE PRODUIT À UN CLIENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ─── Pitch en 30 secondes ────────────────────────────────────────────────────

  "On a créé PhishGuard.IA : une API qui analyse chaque email entrant de votre
   entreprise en moins de 2 secondes et lui donne un score de risque 0 à 100.
   Si l'email est dangereux, il est automatiquement bloqué. Vos collaborateurs
   ne le voient jamais. Vous, vous avez un dashboard complet pour voir ce qui
   a été bloqué, pourquoi, et depuis quel expéditeur."

  ─── Arguments clés par type de client ───────────────────────────────────────

  PME (10-200 personnes) :
  → "5 minutes pour connecter votre Gmail ou Microsoft 365"
  → "Pas besoin d'un informaticien, ça se configure tout seul"
  → "49€/mois pour 10 000 emails analysés"

  ETI / Grande entreprise (via DSI) :
  → "API REST standard, compatible avec toutes vos stack existantes"
  → "Intégration avec Power Automate, Postfix, Proofpoint"
  → "Chaque décision est traçable, expliquée, et loggée dans la base"
  → "RGPD : les emails ne sont jamais stockés en clair, seulement les métadonnées"

  ─── Les questions qu'on vous posera ─────────────────────────────────────────

  Q: "Quel est votre taux de détection ?"
  R: "Notre moteur détecte les patterns que les humains manquent : typosquatting
      (micros0ft.com), fraude au président via Gmail, et URLs raccourcies vers
      des pages de phishing. Sur des jeux de test standards, notre score de
      précision est élevé, mais on est transparents : aucun outil ne détecte
      100%. C'est pour ça qu'on ne bloque pas automatiquement tout ce qui est
      suspect — on quarantine d'abord pour révision humaine."

  Q: "Vos données vont où ?"
  R: "Les emails analysés via API ne sont jamais stockés en clair. On stocke
      uniquement les métadonnées (expéditeur, score, type de menace) dans
      notre base Supabase (hébergée dans l'UE). Conforme RGPD."

  Q: "Vous êtes combien ?"
  R: "On est 3 fondateurs : Matis, Sami et Lucas. On a construit ce produit
      from scratch en quelques mois. On est une petite équipe qui avance vite,
      et c'est une force : vous avez accès directement à ceux qui ont construit
      le produit, pas à un support externalisé."

  Q: "Vous avez des clients ?"
  R: "On est en phase beta. On cherche nos 10 premiers clients pilotes avec qui
      travailler main dans la main. En échange d'un tarif préférentiel, on
      intègre vos retours directement dans le produit."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  9. ARCHITECTURE TECHNIQUE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ┌──────────────────────────────────────────────────────────────────────────┐
  │                         PHISHGUARD.IA STACK                             │
  ├──────────────────────────────────────────────────────────────────────────┤
  │                                                                          │
  │  FRONTEND               BACKEND               DONNÉES                   │
  │  ──────────             ───────────           ──────────                 │
  │  Next.js 15             Next.js API Routes    Supabase (PostgreSQL)      │
  │  React                  TypeScript            ├── auth.users             │
  │  Framer Motion          /api/v1/analyze       ├── profiles               │
  │  Recharts               /api/v1/batch         ├── emails                 │
  │  TailwindCSS            /api/v1/batch         ├── threats                │
  │                         /api/contact          ├── api_keys               │
  │  DÉPLOIEMENT            /api/v1/mail/sync     ├── subscriptions          │
  │  ──────────             /api/v1/stripe/       ├── mail_connections       │
  │  Vercel (edge)                                └── contact_messages       │
  │  Auto-deploy GitHub     IA EXTERNE                                       │
  │  CDN global             ────────────           PAIEMENTS                 │
  │                         Google Gemini 2.0      ───────────               │
  │  AUTH                   Flash (analyse)        Stripe                    │
  │  ────                   Gmail OAuth2           ├── Plans (Starter/Pro)   │
  │  Supabase Auth          (connexion Gmail)      └── Webhooks              │
  │  Google OAuth                                                            │
  │  GitHub OAuth                                                            │
  │                                                                          │
  └──────────────────────────────────────────────────────────────────────────┘

  ─── Flux d'une analyse (chemin critique de l'API) ───────────────────────────

  Client → POST /api/v1/analyze
     ↓
  Vérification de la clé API (table api_keys)
     ↓
  8 analyseurs heuristiques en parallèle (< 1ms)
     ↓
  Appel Gemini 2.0 Flash (max 6 secondes, avec timeout)
     ↓
  Score final = heuristique×0.55 + Gemini×0.45
     ↓
  Classification (safe / quarantined / blocked)
     ↓
  Sauvegarde en base (table emails + table threats si menace)
     ↓
  Mise à jour last_used de la clé API
     ↓
  Réponse JSON → Client (< 2 secondes en moyenne)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  10. MISE EN PLACE DU PROJET (pour développeurs)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Prérequis :
  - Node.js 18+
  - Un compte Supabase (gratuit sur supabase.com)
  - Un compte Vercel (gratuit pour déployer)
  - Optionnel : clé API Google Gemini (aistudio.google.com)
  - Optionnel : compte Google Cloud (pour OAuth Gmail)

  ─── Installation locale ──────────────────────────────────────────────────────

  1. Cloner le projet
     git clone https://github.com/oclww/phishguardia.git
     cd phishguardia/guardia-main

  2. Installer les dépendances
     npm install

  3. Créer le fichier .env.local (voir section 11)

  4. Lancer en développement
     npm run dev

  5. Ouvrir http://localhost:3000

  ─── Déployer sur Vercel ──────────────────────────────────────────────────────

  1. Créer un compte sur vercel.com
  2. Importer le repository GitHub
  3. Configurer les variables d'environnement (section 11)
  4. Vercel déploie automatiquement à chaque push sur main

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  11. VARIABLES D'ENVIRONNEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  À configurer dans .env.local (local) et dans Vercel (production) :

  ─── OBLIGATOIRES ────────────────────────────────────────────────────────────

  NEXT_PUBLIC_SUPABASE_URL=https://VOTRE_PROJET.supabase.co
    → L'URL de votre projet Supabase (dans Project Settings > API)

  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
    → Clé publique Supabase (dans Project Settings > API)

  SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
    → Clé secrète Supabase (NE JAMAIS EXPOSER côté client !)
    → Utilisée uniquement dans les API routes (backend)

  NEXT_PUBLIC_APP_URL=https://phishguardia.vercel.app
    → URL publique de l'application (pour les redirections OAuth)

  ─── RECOMMANDÉES ────────────────────────────────────────────────────────────

  GEMINI_API_KEY=AIza...
    → Clé API Google Gemini (aistudio.google.com, gratuit jusqu'à 15 req/min)
    → Sans cette clé, le moteur tourne en mode heuristique uniquement

  ─── POUR L'INTÉGRATION GMAIL ────────────────────────────────────────────────

  GOOGLE_CLIENT_ID=...apps.googleusercontent.com
    → Créer sur console.cloud.google.com > OAuth 2.0 Client IDs

  GOOGLE_CLIENT_SECRET=GOCSPX-...
    → Même endroit que le Client ID

  ─── POUR STRIPE (paiements) ─────────────────────────────────────────────────

  STRIPE_SECRET_KEY=sk_live_...
    → Clé secrète Stripe (production — commencer par sk_test pour les tests)

  STRIPE_WEBHOOK_SECRET=whsec_...
    → Secret du webhook (Stripe Dashboard > Webhooks)

  STRIPE_MONTHLY_STARTER_PRICE_ID=price_...
    → ID du prix mensuel plan Starter (créer dans Stripe Dashboard > Products)

  STRIPE_ANNUAL_STARTER_PRICE_ID=price_...
  STRIPE_MONTHLY_PRO_PRICE_ID=price_...
  STRIPE_ANNUAL_PRO_PRICE_ID=price_...
    → Idem pour les autres plans

  CRON_SECRET=votre-secret-cron
    → Secret pour sécuriser l'endpoint de sync Gmail automatique

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  12. BASE DE DONNÉES (Supabase)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Tables principales (à créer dans Supabase SQL Editor) :

  ─── profiles ────────────────────────────────────────────────────────────────
  Informations utilisateur étendues (prénom, entreprise, etc.)
  → Créée automatiquement lors de l'inscription via trigger

  ─── api_keys ────────────────────────────────────────────────────────────────
  Clés API générées par les utilisateurs
  Colonnes : id, user_id, name, key, status (active/revoked), last_used

  ─── emails ──────────────────────────────────────────────────────────────────
  Tous les emails analysés via l'API
  Colonnes : id, user_id, from_email, subject, status, ai_score, threat_type

  ─── threats ─────────────────────────────────────────────────────────────────
  Menaces détectées (sous-ensemble des emails)
  Colonnes : id, user_id, email_id, type, severity, status, ai_score

  ─── mail_connections ────────────────────────────────────────────────────────
  Connexions Gmail/Outlook des utilisateurs
  → Migration : supabase/migrations/20260608_mail_connections.sql

  ─── contact_messages ────────────────────────────────────────────────────────
  Messages envoyés via le formulaire de contact
  → Migration : supabase/migrations/20260608_contact_messages.sql

  ─── subscriptions ───────────────────────────────────────────────────────────
  Abonnements Stripe actifs
  Colonnes : id, user_id, plan_id, status, stripe_subscription_id

  ─── Pour exécuter une migration ─────────────────────────────────────────────
  1. Aller sur supabase.com → votre projet
  2. Cliquer sur "SQL Editor"
  3. Copier-coller le contenu du fichier .sql
  4. Cliquer "Run"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  13. QUESTIONS FRÉQUENTES (FAQ)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Q: L'API analyse-t-elle les pièces jointes ?
  R: Pas encore. On analyse l'expéditeur, le sujet et le corps texte.
     L'analyse des pièces jointes est sur la roadmap (sandboxing).

  Q: Combien d'appels API puis-je faire par minute ?
  R: Pas de rate limit strict actuellement (beta). Un rate limit par clé
     API sera introduit selon les plans (Starter: 60 req/min, Pro: 600 req/min).

  Q: Que se passe-t-il si Gemini est indisponible ?
  R: Le moteur bascule automatiquement en mode heuristique seul.
     La réponse indique "engine: heuristic-v2" dans ce cas.
     Aucune interruption de service.

  Q: Les emails sont-ils stockés ?
  R: Non. On stocke uniquement les métadonnées : expéditeur, score, type de
     menace, horodatage. Jamais le corps complet de l'email.

  Q: Comment sécuriser ma clé API ?
  R: Ne jamais l'exposer dans du code frontend (navigateur).
     Utiliser uniquement côté serveur (Node.js, Python backend, etc.)
     En cas de compromission : révoquer depuis le dashboard et en générer une.

  Q: Peut-on tester sans carte bancaire ?
  R: Oui. Créer un compte sur phishguardia.vercel.app, aller dans
     Dashboard → Clés API → Créer une clé. Le plan gratuit permet
     de tester l'API immédiatement.

  Q: Vous êtes conformes RGPD ?
  R: Oui. L'hébergement est sur Supabase (UE), Vercel (CDN edge global
     mais données en UE). Pas de revente de données. Droit à l'oubli
     supporté depuis le dashboard.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  14. CONTACT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Site web    : https://phishguardia.vercel.app
  Contact     : oclaw78@gmail.com
  GitHub      : https://github.com/oclww/phishguardia

  Pour les demandes commerciales, partenariats, ou démonstrations :
  → Formulaire de contact sur le site : /contact
  → Email direct : oclaw78@gmail.com

  Réponse garantie sous 48h ouvrées.

  ─────────────────────────────────────────────────────────────────────────────
  PhishGuard.IA — Construit avec sérieux par Matis L., Sami H. et Lucas M.
  "La cybersécurité ne devrait pas être réservée aux grandes entreprises."
  ─────────────────────────────────────────────────────────────────────────────
