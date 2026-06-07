'use client'

import { useState, useEffect } from 'react'
import { Key, Plus, Copy, Eye, EyeOff, Trash2, Check, ChevronDown, ChevronRight, Terminal, BookOpen, Zap, Shield, Server, Mail, AlertTriangle, CheckCircle2, Code2, Globe, Plug } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/contexts/ToastContext'
import { cn, formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = 'keys' | 'docs' | 'integrations' | 'playground'
type Lang = 'curl' | 'python' | 'javascript' | 'php' | 'go'
type Gateway = 'postfix' | 'exchange' | 'google_workspace' | 'microsoft365' | 'proofpoint' | 'n8n'

// ─── Code examples ────────────────────────────────────────────────────────────
const analyzeExamples: Record<Lang, string> = {
  curl: `curl -X POST https://phishguardia.vercel.app/api/v1/analyze \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "cfo@micros0ft-alert.com",
    "subject": "Action requise — Compte suspendu",
    "body": "Cliquez immédiatement pour éviter..."
  }'`,

  python: `import requests

PHISHGUARD_API_KEY = "YOUR_API_KEY"
BASE_URL = "https://phishguardia.vercel.app/api/v1"

def scan_email(from_addr: str, subject: str, body: str = "") -> dict:
    response = requests.post(
        f"{BASE_URL}/analyze",
        headers={
            "Authorization": f"Bearer {PHISHGUARD_API_KEY}",
            "Content-Type": "application/json"
        },
        json={"from": from_addr, "subject": subject, "body": body},
        timeout=10
    )
    response.raise_for_status()
    return response.json()

# Usage
result = scan_email(
    from_addr="attacker@micros0ft-alert.com",
    subject="Action requise — Compte suspendu",
    body="Cliquez immédiatement pour éviter..."
)

print(f"Score IA : {result['ai_score']}/100")
print(f"Statut   : {result['status']}")        # safe | quarantined | blocked
print(f"Menace   : {result['threat_type']}")   # phishing | malware | bec | spear-phishing
print(f"Sévérité : {result['severity']}")      # low | medium | high | critical`,

  javascript: `const PHISHGUARD_API_KEY = process.env.PHISHGUARD_API_KEY;

async function scanEmail({ from, subject, body = "" }) {
  const response = await fetch("https://phishguardia.vercel.app/api/v1/analyze", {
    method: "POST",
    headers: {
      "Authorization": \`Bearer \${PHISHGUARD_API_KEY}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, subject, body }),
  });

  if (!response.ok) throw new Error(\`PhishGuard error: \${response.status}\`);
  return response.json();
}

// Usage (Node.js / Express middleware)
app.post("/incoming-email", async (req, res) => {
  const { from, subject, body } = req.body;
  const result = await scanEmail({ from, subject, body });

  if (result.status === "blocked") {
    return res.status(403).json({ rejected: true, reason: result.threat_type });
  }
  if (result.status === "quarantined") {
    await moveToQuarantine(req.body);
  }
  res.json({ delivered: true, score: result.ai_score });
});`,

  php: `<?php
define('PHISHGUARD_API_KEY', getenv('PHISHGUARD_API_KEY'));
define('PHISHGUARD_BASE_URL', 'https://phishguardia.vercel.app/api/v1');

function scanEmail(string $from, string $subject, string $body = ''): array {
    $ch = curl_init(PHISHGUARD_BASE_URL . '/analyze');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_HTTPHEADER     => [
            'Authorization: Bearer ' . PHISHGUARD_API_KEY,
            'Content-Type: application/json',
        ],
        CURLOPT_POSTFIELDS     => json_encode([
            'from'    => $from,
            'subject' => $subject,
            'body'    => $body,
        ]),
        CURLOPT_TIMEOUT => 10,
    ]);

    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response, true);
}

// Usage
$result = scanEmail(
    'attacker@micros0ft-alert.com',
    'Action requise — Compte suspendu',
    'Cliquez immédiatement...'
);

if ($result['status'] === 'blocked') {
    // Reject email
    header('HTTP/1.1 550 Rejected');
    exit('Email rejected: ' . $result['threat_type']);
}`,

  go: `package phishguard

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
    "os"
)

type ScanRequest struct {
    From    string \`json:"from"\`
    Subject string \`json:"subject"\`
    Body    string \`json:"body,omitempty"\`
}

type ScanResult struct {
    AiScore   int    \`json:"ai_score"\`
    Status    string \`json:"status"\`      // safe | quarantined | blocked
    ThreatType string \`json:"threat_type"\`
    Severity  string \`json:"severity"\`
    Engine    string \`json:"engine"\`
}

func ScanEmail(req ScanRequest) (*ScanResult, error) {
    body, _ := json.Marshal(req)
    
    httpReq, _ := http.NewRequest("POST", 
        "https://phishguardia.vercel.app/api/v1/analyze", 
        bytes.NewBuffer(body))
    
    httpReq.Header.Set("Authorization", "Bearer "+os.Getenv("PHISHGUARD_API_KEY"))
    httpReq.Header.Set("Content-Type", "application/json")

    resp, err := http.DefaultClient.Do(httpReq)
    if err != nil { return nil, err }
    defer resp.Body.Close()

    var result ScanResult
    json.NewDecoder(resp.Body).Decode(&result)
    return &result, nil
}`,
}

// ─── Gateway integration examples ─────────────────────────────────────────────
const gatewayExamples: Record<Gateway, { title: string; lang: string; code: string; description: string }> = {
  postfix: {
    title: 'Postfix (Linux)',
    lang: 'bash',
    description: 'Filtre SMTP Postfix via un script milter qui appelle PhishGuard avant livraison.',
    code: `# /etc/postfix/master.cf — ajouter le filtre PhishGuard
phishguard unix  -       n       n       -       -       pipe
  flags=Rq user=phishguard argv=/usr/local/bin/phishguard-filter.sh
  \${sender} \${recipient}

# /etc/postfix/main.cf
smtpd_milters = unix:/var/run/phishguard/phishguard.sock
non_smtpd_milters = unix:/var/run/phishguard/phishguard.sock
milter_default_action = accept

# Script de filtre : /usr/local/bin/phishguard-filter.sh
#!/bin/bash
FROM=$(cat /tmp/mail_from)
SUBJECT=$(grep -i "^Subject:" /tmp/mail_headers | head -1 | cut -d: -f2-)
BODY=$(cat /tmp/mail_body | head -c 2000)

RESULT=$(curl -s -X POST https://phishguardia.vercel.app/api/v1/analyze \\
  -H "Authorization: Bearer $PHISHGUARD_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d "{\\"from\\":\\"$FROM\\",\\"subject\\":\\"$SUBJECT\\",\\"body\\":\\"$BODY\\"}")

STATUS=$(echo $RESULT | python3 -c "import sys,json; print(json.load(sys.stdin)['status'])")

if [ "$STATUS" = "blocked" ]; then
  exit 69  # EX_UNAVAILABLE — rejet SMTP
fi`,
  },

  exchange: {
    title: 'Microsoft Exchange (on-premise)',
    lang: 'powershell',
    description: 'Transport Rule Exchange + script PowerShell qui appelle PhishGuard à chaque email entrant.',
    code: `# Exchange Management Shell — Créer une Transport Rule
New-TransportRule -Name "PhishGuard Scan" \\
  -FromScope "NotInOrganization" \\
  -SentToScope "InOrganization" \\
  -BlindCopyTo "phishguard-scanner@votredomaine.com"

# Script PowerShell sur le scanner mailbox
# $env:PHISHGUARD_API_KEY = "YOUR_API_KEY"

function Invoke-PhishGuardScan {
    param($From, $Subject, $Body)
    
    $payload = @{
        from    = $From
        subject = $Subject
        body    = $Body
    } | ConvertTo-Json

    $response = Invoke-RestMethod \\
        -Uri "https://phishguardia.vercel.app/api/v1/analyze" \\
        -Method POST \\
        -Headers @{ Authorization = "Bearer $env:PHISHGUARD_API_KEY" } \\
        -ContentType "application/json" \\
        -Body $payload

    return $response
}

# Dans la boucle de traitement des emails
$messages = Get-MailboxFolderStatistics -Identity phishguard-scanner | ...
foreach ($msg in $messages) {
    $result = Invoke-PhishGuardScan -From $msg.From -Subject $msg.Subject -Body $msg.Body
    
    if ($result.status -eq "blocked") {
        # Supprimer l'original + notifier l'admin
        Remove-Message -Identity $original.MessageIdentity -Confirm:$false
        Send-AlertToAdmin -Threat $result
    }
}`,
  },

  microsoft365: {
    title: 'Microsoft 365 (Graph API)',
    lang: 'typescript',
    description: 'Webhook Microsoft Graph qui reçoit chaque email entrant et le soumet automatiquement à PhishGuard.',
    code: `// 1. Créer un abonnement Graph pour les emails entrants
// POST https://graph.microsoft.com/v1.0/subscriptions

const subscription = await graphClient.api('/subscriptions').post({
  changeType: 'created',
  notificationUrl: 'https://phishguardia.vercel.app/api/v1/webhooks/m365',
  resource: '/users/ALL/mailFolders/Inbox/messages',
  expirationDateTime: new Date(Date.now() + 3600000 * 24 * 3).toISOString(),
  clientState: process.env.PHISHGUARD_WEBHOOK_SECRET,
});

// 2. Endpoint qui reçoit les notifications Microsoft
// POST /api/v1/webhooks/m365
export async function POST(req: Request) {
  const { value: notifications } = await req.json();
  
  for (const notification of notifications) {
    // Fetch le contenu de l'email via Graph
    const message = await graphClient
      .api(\`/users/\${notification.resourceData.userId}/messages/\${notification.resourceData.id}\`)
      .select('from,subject,body')
      .get();

    // Scanner avec PhishGuard
    const result = await fetch('https://phishguardia.vercel.app/api/v1/analyze', {
      method: 'POST',
      headers: { 'Authorization': \`Bearer \${process.env.PHISHGUARD_API_KEY}\` },
      body: JSON.stringify({
        from: message.from.emailAddress.address,
        subject: message.subject,
        body: message.body.content,
      }),
    }).then(r => r.json());

    // Si menace : déplacer vers dossier Quarantaine
    if (result.status !== 'safe') {
      await graphClient
        .api(\`/users/\${notification.resourceData.userId}/messages/\${notification.resourceData.id}/move\`)
        .post({ destinationId: 'quarantine' });
    }
  }
  return new Response('OK');
}`,
  },

  google_workspace: {
    title: 'Google Workspace',
    lang: 'python',
    description: 'Gmail API + Pub/Sub pour scanner tous les emails entrants de votre domaine Google Workspace.',
    code: `# Configuration Google Workspace
# 1. Activer Gmail API + Cloud Pub/Sub dans Google Cloud Console
# 2. Créer un Service Account avec délégation domain-wide
# 3. Accorder le scope : https://www.googleapis.com/auth/gmail.modify

from google.oauth2 import service_account
from googleapiclient.discovery import build
import requests, base64, json

SCOPES = ['https://www.googleapis.com/auth/gmail.modify']
SERVICE_ACCOUNT_FILE = 'service-account.json'
PHISHGUARD_API_KEY = os.environ['PHISHGUARD_API_KEY']
DOMAIN = 'votreentreprise.com'

def get_gmail_service(user_email: str):
    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    delegated = credentials.with_subject(user_email)
    return build('gmail', 'v1', credentials=delegated)

def scan_and_quarantine(user_email: str, message_id: str):
    service = get_gmail_service(user_email)
    
    # Récupérer le contenu de l'email
    msg = service.users().messages().get(
        userId='me', id=message_id, format='full').execute()
    
    headers = {h['name']: h['value'] for h in msg['payload'].get('headers', [])}
    body = base64.urlsafe_b64decode(
        msg['payload'].get('body', {}).get('data', '')).decode('utf-8', errors='ignore')
    
    # Scanner avec PhishGuard
    result = requests.post(
        'https://phishguardia.vercel.app/api/v1/analyze',
        headers={'Authorization': f'Bearer {PHISHGUARD_API_KEY}'},
        json={
            'from': headers.get('From', ''),
            'subject': headers.get('Subject', ''),
            'body': body[:2000]
        }
    ).json()
    
    # Si menace détectée : mettre en quarantaine
    if result['status'] != 'safe':
        service.users().messages().modify(
            userId='me', id=message_id,
            body={'addLabelIds': ['SPAM'], 'removeLabelIds': ['INBOX']}
        ).execute()
        print(f"[BLOCKED] {headers.get('From')} — Score: {result['ai_score']}/100")`,
  },

  proofpoint: {
    title: 'Proofpoint / Mimecast',
    lang: 'json',
    description: 'Configuration webhook Proofpoint/Mimecast pour envoyer chaque email à PhishGuard via leur système de sandboxing.',
    code: `// Configuration Proofpoint TAP Webhook
// Dans Proofpoint Admin Console → Connected Applications → Add

{
  "name": "PhishGuard.IA Integration",
  "type": "webhook",
  "config": {
    "url": "https://phishguardia.vercel.app/api/v1/analyze",
    "method": "POST",
    "headers": {
      "Authorization": "Bearer YOUR_API_KEY",
      "Content-Type": "application/json"
    },
    "payload_mapping": {
      "from": "{{message.header.from}}",
      "subject": "{{message.header.subject}}",
      "body": "{{message.body.text}}"
    },
    "trigger": "on_message_received",
    "filter": {
      "direction": "inbound",
      "disposition": "all"
    }
  },
  "actions": {
    "on_response": {
      "blocked": {
        "action": "quarantine",
        "folder": "PhishGuard-Quarantine"
      },
      "quarantined": {
        "action": "tag",
        "tag": "[SUSPICIOUS]"
      },
      "safe": {
        "action": "deliver"
      }
    }
  }
}

// Alternative : Mimecast Content Examination Policy
// Settings → Gateway → Policies → Content Examination
// → Add External Service → PhishGuard.IA`,
  },

  n8n: {
    title: 'n8n / Zapier / Make',
    lang: 'json',
    description: 'Workflow d\'automatisation no-code : chaque email Gmail/Outlook déclenche un scan PhishGuard.',
    code: `// Workflow n8n — Import ce JSON dans ton instance n8n
{
  "name": "PhishGuard Auto-Scan",
  "nodes": [
    {
      "type": "n8n-nodes-base.gmailTrigger",
      "name": "Nouveau email Gmail",
      "parameters": {
        "pollTimes": { "item": [{ "mode": "everyMinute" }] },
        "filters": { "labelIds": ["INBOX"] }
      }
    },
    {
      "type": "n8n-nodes-base.httpRequest",
      "name": "Scanner avec PhishGuard",
      "parameters": {
        "method": "POST",
        "url": "https://phishguardia.vercel.app/api/v1/analyze",
        "headers": {
          "Authorization": "Bearer YOUR_API_KEY"
        },
        "body": {
          "from": "={{ $json.from }}",
          "subject": "={{ $json.subject }}",
          "body": "={{ $json.textPlain }}"
        }
      }
    },
    {
      "type": "n8n-nodes-base.if",
      "name": "Menace détectée ?",
      "parameters": {
        "conditions": {
          "string": [{ "value1": "={{ $json.status }}", "operation": "notEqual", "value2": "safe" }]
        }
      }
    },
    {
      "type": "n8n-nodes-base.slack",
      "name": "Alerter sur Slack",
      "parameters": {
        "channel": "#security-alerts",
        "text": "🚨 Menace détectée\\nDe: {{ $node['Nouveau email Gmail'].json.from }}\\nScore: {{ $json.ai_score }}/100\\nType: {{ $json.threat_type }}"
      }
    }
  ]
}`,
  },
}

// ─── Response schema ──────────────────────────────────────────────────────────
const responseSchema = `{
  "success": true,
  "ai_score": 87,              // 0-100 — score de risque
  "status": "blocked",         // "safe" | "quarantined" | "blocked"
  "threat_type": "phishing",   // "none" | "phishing" | "spear-phishing" | "malware" | "bec" | "spam"
  "severity": "critical",      // "low" | "medium" | "high" | "critical"
  "engine": "gemini+heuristic",// moteur d'analyse utilisé
  "signals": {
    "domainSpoofing":  25,     // 0-30
    "urgencyKeywords": 16,     // 0-20
    "suspiciousLinks": 10,     // 0-20
    "subjectPatterns": 12,     // 0-15
    "senderAnomaly":    0      // 0-15
  },
  "email_id": "uuid"           // ID stocké en base
}`

// ─── Main component ───────────────────────────────────────────────────────────
export default function ApiPage() {
  const [activeTab, setActiveTab] = useState<Tab>('keys')
  const [keys, setKeys] = useState<any[]>([])
  const [createOpen, setCreateOpen] = useState(false)
  const [keyName, setKeyName] = useState('')
  const [permissions, setPermissions] = useState<string[]>(['read', 'write'])
  const [revealMap, setRevealMap] = useState<Record<string, boolean>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [codeLang, setCodeLang] = useState<Lang>('curl')
  const [activeGateway, setActiveGateway] = useState<Gateway>('postfix')
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState(false)

  // Playground
  const [pgFrom, setPgFrom] = useState('cfo-alert@micros0ft-secure.com')
  const [pgSubject, setPgSubject] = useState('⚠️ Action requise — Compte suspendu dans 24h')
  const [pgBody, setPgBody] = useState('Votre compte Office 365 a été compromis. Cliquez immédiatement pour éviter la suspension définitive.')
  const [pgResult, setPgResult] = useState<any>(null)
  const [pgLoading, setPgLoading] = useState(false)

  const { addToast } = useToast()
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => { if (user) loadKeys() }, [user])

  const loadKeys = async () => {
    setIsLoading(true)
    const { data } = await supabase.from('api_keys').select('*').order('created_at', { ascending: false })
    if (data) setKeys(data)
    setIsLoading(false)
  }

  const handleCreate = async () => {
    if (!keyName || !user) return
    setIsCreating(true)
    const rawKey = `pg_sk_live_${Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('')}`
    const { data, error } = await supabase.from('api_keys').insert([{
      user_id: user.id, name: keyName, key: rawKey, permissions, status: 'active',
    }]).select().single()
    setIsCreating(false)
    if (error) { addToast('error', 'Erreur', error.message); return }
    setKeys(prev => [data, ...prev])
    setCreateOpen(false); setKeyName('')
    addToast('success', 'Clé créée', `"${data.name}" est prête`)
  }

  const handleCopy = (keyItem: any) => {
    navigator.clipboard.writeText(keyItem.key).catch(() => {})
    setCopiedId(keyItem.id)
    addToast('info', 'Clé copiée')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {})
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const handleRevoke = async (id: string) => {
    await supabase.from('api_keys').update({ status: 'revoked' }).eq('id', id)
    setKeys(prev => prev.map(k => k.id === id ? { ...k, status: 'revoked' } : k))
    addToast('success', 'Clé révoquée')
  }

  const handlePlayground = async () => {
    const activeKey = keys.find(k => k.status === 'active')
    if (!activeKey) { addToast('error', 'Aucune clé active', 'Crée une clé API d\'abord'); return }
    setPgLoading(true); setPgResult(null)
    try {
      const res = await fetch('/api/v1/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${activeKey.key}` },
        body: JSON.stringify({ from: pgFrom, subject: pgSubject, body: pgBody }),
      })
      setPgResult(await res.json())
    } catch { addToast('error', 'Erreur réseau', '') }
    finally { setPgLoading(false) }
  }

  const maskKey = (key: string) => key.slice(0, 14) + '••••••••••••' + key.slice(-4)
  const getScoreColor = (s: number) => s >= 75 ? '#ff5f6d' : s >= 45 ? '#f5a623' : '#32d583'

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'keys', label: 'Clés API', icon: Key },
    { key: 'docs', label: 'Documentation', icon: BookOpen },
    { key: 'integrations', label: 'Intégrations Gateway', icon: Plug },
    { key: 'playground', label: 'Playground', icon: Terminal },
  ]

  const gateways: { key: Gateway; label: string; badge?: string }[] = [
    { key: 'postfix', label: 'Postfix' },
    { key: 'exchange', label: 'Exchange' },
    { key: 'microsoft365', label: 'Microsoft 365', badge: 'Populaire' },
    { key: 'google_workspace', label: 'Google Workspace' },
    { key: 'proofpoint', label: 'Proofpoint / Mimecast' },
    { key: 'n8n', label: 'n8n / Zapier / Make', badge: 'No-code' },
  ]

  const inputClass = 'w-full bg-[#060d18] border border-[#1a2740] rounded-xl px-3 py-2.5 text-sm text-[#eaf2fb] outline-none focus:border-[#7dd3fc]/50 transition-colors placeholder:text-[#4d6580] resize-none font-mono'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#eaf2fb]" style={{ fontFamily: 'Syne, sans-serif' }}>API & Intégrations</h1>
        <p className="text-sm text-[#7a96b4] mt-1">Intégrez PhishGuard.IA dans votre infrastructure email en quelques minutes.</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Clés actives', value: keys.filter(k => k.status === 'active').length, color: '#41e8c4', icon: Key },
          { label: 'Dernière utilisation', value: keys.find(k => k.last_used)?.last_used ? new Date(keys.find(k => k.last_used)!.last_used).toLocaleDateString('fr-FR') : '—', color: '#7dd3fc', icon: Zap },
          { label: 'Gateways supportés', value: '6+', color: '#a78bfa', icon: Server },
        ].map(s => (
          <Card key={s.label} className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${s.color}12`, border: `1px solid ${s.color}20` }}>
              <s.icon size={16} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-lg font-bold font-mono" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[11px]" style={{ color: '#4d6580' }}>{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Tab nav */}
      <div className="flex items-center gap-1 p-1 bg-[#0c1526] border border-[#1a2740] rounded-2xl w-fit">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
              activeTab === tab.key ? 'bg-[#7dd3fc]/15 text-[#7dd3fc] border border-[#7dd3fc]/30' : 'text-[#7a96b4] hover:text-[#eaf2fb]')}>
            <tab.icon size={14} />{tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB: KEYS ── */}
      {activeTab === 'keys' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setCreateOpen(true)} size="sm"><Plus size={14} />Générer une clé</Button>
          </div>
          <Card className="p-0 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1a2740]">
                  {['Nom', 'Clé', 'Permissions', 'Créée', 'Dernière utilisation', 'Statut', ''].map(h => (
                    <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-[#7a96b4] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={7} className="px-5 py-6 text-center text-[#7a96b4] text-xs">Chargement…</td></tr>
                ) : keys.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-8 text-center text-[#7a96b4] text-xs">
                    Aucune clé API — <button onClick={() => setCreateOpen(true)} className="text-[#7dd3fc] hover:underline">Créer la première</button>
                  </td></tr>
                ) : keys.map((k, i) => (
                  <motion.tr key={k.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="border-b border-[#1a2740] last:border-0 hover:bg-white/[0.015]">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Key size={13} className="text-[#7a96b4]" />
                        <span className="text-sm font-medium text-[#eaf2fb]">{k.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono text-[#7a96b4]">{revealMap[k.id] ? k.key : maskKey(k.key)}</code>
                        <button onClick={() => setRevealMap(p => ({ ...p, [k.id]: !p[k.id] }))} className="text-[#7a96b4] hover:text-[#eaf2fb]">
                          {revealMap[k.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                        </button>
                        <button onClick={() => handleCopy(k)} className={cn('transition-colors', copiedId === k.id ? 'text-[#34d399]' : 'text-[#7a96b4] hover:text-[#eaf2fb]')}>
                          {copiedId === k.id ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1 flex-wrap">
                        {(k.permissions || []).map((p: string) => (
                          <Badge key={p} variant={p === 'admin' ? 'critical' : p === 'write' ? 'high' : 'info'} className="text-[10px]">{p}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#7a96b4]">{formatDate(k.created_at)}</td>
                    <td className="px-5 py-4 text-sm text-[#7a96b4]">{k.last_used ? formatDate(k.last_used) : '—'}</td>
                    <td className="px-5 py-4">
                      <Badge variant={k.status === 'active' ? 'success' : 'default'} dot>{k.status === 'active' ? 'Active' : 'Révoquée'}</Badge>
                    </td>
                    <td className="px-5 py-4">
                      {k.status === 'active' && (
                        <button onClick={() => handleRevoke(k.id)} className="p-1.5 rounded-lg text-[#7a96b4] hover:text-[#fb7185] hover:bg-[#fb7185]/10 transition-all">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </Card>
        </motion.div>
      )}

      {/* ── TAB: DOCS ── */}
      {activeTab === 'docs' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Endpoint card */}
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid #1a2740' }}>
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg border font-mono bg-[#a78bfa]/15 text-[#a78bfa] border-[#a78bfa]/30">POST</span>
              <code className="text-sm text-[#eaf2fb] font-mono">/api/v1/analyze</code>
              <Badge variant="success" className="ml-auto">Disponible</Badge>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-[#7a96b4]">Analyse un email entrant et retourne un score de risque IA, le type de menace détectée, et le détail des signaux.</p>

              {/* Request body */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#4d6580' }}>Corps de la requête</p>
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #1a2740' }}>
                  {[
                    { field: 'from', type: 'string', req: true, desc: 'Adresse email de l\'expéditeur' },
                    { field: 'subject', type: 'string', req: true, desc: 'Objet de l\'email' },
                    { field: 'body', type: 'string', req: false, desc: 'Corps de l\'email (max 2000 chars)' },
                  ].map((row, i) => (
                    <div key={row.field} className="flex items-start gap-4 px-4 py-3 text-xs"
                      style={{ borderTop: i === 0 ? 'none' : '1px solid #1a2740', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,.01)' }}>
                      <code className="text-[#7dd3fc] font-mono w-20 shrink-0">{row.field}</code>
                      <code className="text-[#a78bfa] w-16 shrink-0">{row.type}</code>
                      <span className={cn('w-16 shrink-0', row.req ? 'text-[#ff5f6d]' : 'text-[#4d6580]')}>{row.req ? 'required' : 'optional'}</span>
                      <span className="text-[#4d6580]">{row.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Response */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#4d6580' }}>Réponse (200 OK)</p>
                <pre className="bg-[#060d18] border border-[#1a2740] rounded-xl p-4 text-xs font-mono text-[#7a96b4] overflow-x-auto leading-relaxed">
                  {responseSchema}
                </pre>
              </div>

              {/* Auth */}
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(167,139,250,.05)', border: '1px solid rgba(167,139,250,.15)' }}>
                <Shield size={14} style={{ color: '#a78bfa', flexShrink: 0 }} />
                <p className="text-xs" style={{ color: '#7a96b0' }}>
                  Authentification : <code className="text-[#a78bfa]">Authorization: Bearer YOUR_API_KEY</code> — Générer une clé dans l'onglet "Clés API"
                </p>
              </div>
            </div>
          </Card>

          {/* Code examples */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-[#eaf2fb]">Exemples de code</p>
              <button onClick={() => handleCopyCode(analyzeExamples[codeLang])}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all"
                style={{ color: copiedCode ? '#34d399' : '#7a96b4', border: '1px solid #1a2740' }}>
                {copiedCode ? <Check size={12} /> : <Copy size={12} />}
                {copiedCode ? 'Copié !' : 'Copier'}
              </button>
            </div>
            <div className="flex gap-2 mb-4 flex-wrap">
              {(['curl', 'python', 'javascript', 'php', 'go'] as Lang[]).map(lang => (
                <button key={lang} onClick={() => setCodeLang(lang)}
                  className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border',
                    codeLang === lang ? 'bg-[#7dd3fc]/15 border-[#7dd3fc]/30 text-[#7dd3fc]' : 'border-[#1a2740] text-[#7a96b4] hover:text-[#eaf2fb]')}>
                  {lang === 'curl' ? 'cURL' : lang === 'javascript' ? 'JavaScript' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                </button>
              ))}
            </div>
            <pre className="bg-[#060d18] border border-[#1a2740] rounded-xl p-4 text-xs font-mono text-[#7a96b4] overflow-x-auto leading-relaxed whitespace-pre">
              {analyzeExamples[codeLang]}
            </pre>
          </Card>
        </motion.div>
      )}

      {/* ── TAB: INTEGRATIONS ── */}
      {activeTab === 'integrations' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4">
          {/* Left: gateway list */}
          <div className="w-52 shrink-0 space-y-1">
            {gateways.map(gw => (
              <button key={gw.key} onClick={() => setActiveGateway(gw.key)}
                className={cn('w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left',
                  activeGateway === gw.key ? 'bg-[#7dd3fc]/10 text-[#7dd3fc] border border-[#7dd3fc]/20' : 'text-[#7a96b4] hover:text-[#eaf2fb] hover:bg-white/[0.03]')}>
                <span>{gw.label}</span>
                <div className="flex items-center gap-2">
                  {gw.badge && <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold" style={{ background: 'rgba(65,232,196,.1)', color: '#41e8c4' }}>{gw.badge}</span>}
                  <ChevronRight size={12} />
                </div>
              </button>
            ))}
          </div>

          {/* Right: code */}
          <div className="flex-1 space-y-4">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-[#eaf2fb]">{gatewayExamples[activeGateway].title}</p>
                <button onClick={() => handleCopyCode(gatewayExamples[activeGateway].code)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all"
                  style={{ color: copiedCode ? '#34d399' : '#7a96b4', border: '1px solid #1a2740' }}>
                  {copiedCode ? <Check size={12} /> : <Copy size={12} />}{copiedCode ? 'Copié !' : 'Copier'}
                </button>
              </div>
              <p className="text-xs text-[#4d6580] mb-4">{gatewayExamples[activeGateway].description}</p>
              <pre className="bg-[#060d18] border border-[#1a2740] rounded-xl p-4 text-xs font-mono text-[#7a96b4] overflow-x-auto leading-relaxed whitespace-pre max-h-96">
                {gatewayExamples[activeGateway].code}
              </pre>
            </Card>

            <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(65,232,196,.04)', border: '1px solid rgba(65,232,196,.1)' }}>
              <CheckCircle2 size={14} style={{ color: '#41e8c4', marginTop: 1, flexShrink: 0 }} />
              <p className="text-xs" style={{ color: '#4d6580' }}>
                Remplace <code className="text-[#7dd3fc]">YOUR_API_KEY</code> par ta clé générée dans l'onglet "Clés API".
                Besoin d'aide ? <a href="mailto:support@phishguard.ia" className="text-[#7dd3fc] hover:underline">support@phishguard.ia</a>
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── TAB: PLAYGROUND ── */}
      {activeTab === 'playground' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Input */}
            <Card className="p-5 space-y-4">
              <p className="text-sm font-semibold text-[#eaf2fb]">Email à analyser</p>
              <div>
                <label className="block text-xs text-[#7a96b4] mb-1.5">From</label>
                <input className={inputClass} value={pgFrom} onChange={e => setPgFrom(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-[#7a96b4] mb-1.5">Subject</label>
                <input className={inputClass} value={pgSubject} onChange={e => setPgSubject(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-[#7a96b4] mb-1.5">Body</label>
                <textarea className={inputClass} rows={4} value={pgBody} onChange={e => setPgBody(e.target.value)} />
              </div>
              <Button onClick={handlePlayground} isLoading={pgLoading} className="w-full gap-2">
                <Zap size={14} />Analyser maintenant
              </Button>
            </Card>

            {/* Result */}
            <Card className="p-5">
              <p className="text-sm font-semibold text-[#eaf2fb] mb-4">Résultat</p>
              {!pgResult && !pgLoading && (
                <div className="flex flex-col items-center justify-center h-48 gap-3">
                  <Terminal size={28} style={{ color: '#1a2740' }} />
                  <p className="text-xs text-[#374f67]">Lance une analyse pour voir le résultat ici</p>
                </div>
              )}
              {pgLoading && (
                <div className="flex flex-col items-center justify-center h-48 gap-3">
                  <div className="w-8 h-8 border-2 border-[#7dd3fc] border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-[#4d6580]">Analyse en cours…</p>
                </div>
              )}
              {pgResult && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {/* Score */}
                  <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: '#060d18', border: '1px solid #1a2740' }}>
                    <div className="text-center">
                      <p className="text-3xl font-bold font-mono" style={{ color: getScoreColor(pgResult.ai_score) }}>
                        {pgResult.ai_score}
                      </p>
                      <p className="text-[10px] text-[#4d6580]">/ 100</p>
                    </div>
                    <div>
                      <Badge variant={pgResult.status === 'blocked' ? 'critical' : pgResult.status === 'quarantined' ? 'high' : 'success'} dot>
                        {pgResult.status === 'blocked' ? 'Bloqué' : pgResult.status === 'quarantined' ? 'Quarantaine' : 'Sûr'}
                      </Badge>
                      <p className="text-xs text-[#7a96b4] mt-1">{pgResult.threat_type !== 'none' ? pgResult.threat_type : 'Aucune menace'}</p>
                      <p className="text-[11px] text-[#4d6580]">Moteur : {pgResult.engine}</p>
                    </div>
                  </div>
                  {/* Signals */}
                  {pgResult.signals && (
                    <div className="space-y-2">
                      {Object.entries(pgResult.signals).map(([key, val]: any) => {
                        const labels: Record<string, string> = { domainSpoofing: 'Spoofing domaine', urgencyKeywords: 'Urgence', suspiciousLinks: 'Liens suspects', subjectPatterns: 'Patterns sujet', senderAnomaly: 'Anomalie BEC' }
                        const maxV: Record<string, number> = { domainSpoofing: 30, urgencyKeywords: 20, suspiciousLinks: 20, subjectPatterns: 15, senderAnomaly: 15 }
                        const pct = Math.round((val / (maxV[key] || 30)) * 100)
                        const c = pct > 60 ? '#ff5f6d' : pct > 30 ? '#f5a623' : '#32d583'
                        return (
                          <div key={key}>
                            <div className="flex justify-between text-xs mb-1">
                              <span style={{ color: '#7a96b0' }}>{labels[key] ?? key}</span>
                              <span className="font-mono" style={{ color: c }}>{val}/{maxV[key] || 30}</span>
                            </div>
                            <div className="h-1.5 rounded-full" style={{ background: '#1a2740' }}>
                              <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: .5 }}
                                className="h-full rounded-full" style={{ background: c }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </Card>
          </div>
        </motion.div>
      )}

      {/* Create key modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Générer une clé API" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#eaf2fb] mb-1.5">Nom de la clé</label>
            <input value={keyName} onChange={e => setKeyName(e.target.value)}
              placeholder="Production, CI/CD pipeline, Postfix server…"
              className="w-full bg-[#060d18] border border-[#1a2740] rounded-xl px-4 py-3 text-sm text-[#eaf2fb] placeholder:text-[#4d6580] outline-none focus:border-[#7dd3fc]/60" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#eaf2fb] mb-2">Permissions</label>
            <div className="space-y-2">
              {[['read', 'Lecture seule'], ['write', 'Écriture (scan emails)'], ['admin', 'Admin complet']].map(([val, label]) => (
                <label key={val} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={permissions.includes(val)} onChange={() => setPermissions(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val])} className="w-4 h-4 rounded accent-[#7dd3fc]" />
                  <span className="text-sm text-[#7a96b4]">{label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(false)} className="flex-1">Annuler</Button>
            <Button size="sm" onClick={handleCreate} isLoading={isCreating} className="flex-1"><Key size={14} />Générer</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
