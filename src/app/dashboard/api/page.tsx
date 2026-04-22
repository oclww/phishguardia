'use client'

import { useState, useEffect } from 'react'
import { Key, Plus, Copy, Eye, EyeOff, Trash2, Check, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/contexts/ToastContext'
import type { ApiKey } from '@/types'
import { cn, formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

const endpoints = [
  { method: 'POST', path: '/api/v1/analyze', desc: 'Analyser un email pour détecter les menaces', methodColor: 'bg-[#a78bfa]/20 text-[#a78bfa] border-[#a78bfa]/30' },
  { method: 'GET', path: '/api/v1/threats', desc: 'Lister toutes les menaces détectées', methodColor: 'bg-[#7dd3fc]/20 text-[#7dd3fc] border-[#7dd3fc]/30' },
  { method: 'GET', path: '/api/v1/reports', desc: 'Lister les rapports générés', methodColor: 'bg-[#7dd3fc]/20 text-[#7dd3fc] border-[#7dd3fc]/30' },
  { method: 'DELETE', path: '/api/v1/threats/:id', desc: 'Supprimer une menace par ID', methodColor: 'bg-[#fb7185]/20 text-[#fb7185] border-[#fb7185]/30' },
]

const codeExamples = {
  curl: `curl -X POST https://phishguard.ia/api/v1/analyze \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "sender@example.com",
    "subject": "Votre compte sera suspendu",
    "body": "Cliquez ici pour éviter la suspension...",
    "headers": {}
  }'`,
  python: `import requests

response = requests.post(
    "https://phishguard.ia/api/v1/analyze",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    },
    json={
        "from": "sender@example.com",
        "subject": "Votre compte sera suspendu",
        "body": "Cliquez ici pour éviter...",
    }
)

result = response.json()
print(f"Score: {result.get('ai_score')}")
print(f"Threat: {result.get('threat_type')}")`,
  javascript: `const response = await fetch(
  'https://phishguard.ia/api/v1/analyze',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'sender@example.com',
      subject: 'Votre compte sera suspendu',
      body: 'Cliquez ici pour éviter...',
    }),
  }
)

const { ai_score, threat_type } = await response.json()
console.log('Score:', ai_score)`,
}

export default function ApiPage() {
  const [keys, setKeys] = useState<any[]>([])
  const [createOpen, setCreateOpen] = useState(false)
  const [keyName, setKeyName] = useState('')
  const [permissions, setPermissions] = useState<string[]>(['read'])
  const [revealMap, setRevealMap] = useState<Record<string, boolean>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [openEndpoint, setOpenEndpoint] = useState<number | null>(null)
  const [codeLang, setCodeLang] = useState<'curl' | 'python' | 'javascript'>('curl')
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  const { toast } = useToast()
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (user) loadKeys()
  }, [user])

  const loadKeys = async () => {
    setIsLoading(true)
    const { data } = await supabase.from('api_keys').select('*').order('created_at', { ascending: false })
    if (data) setKeys(data)
    setIsLoading(false)
  }

  const handleCreate = async () => {
    if (!keyName || !user) return
    setIsCreating(true)
    
    // Generate a secure API key string
    const rawKey = `pg_sk_live_${Math.random().toString(36).slice(2, 18)}${Math.random().toString(36).slice(2, 18)}`
    
    const newKey = {
      user_id: user.id,
      name: keyName,
      key: rawKey,
      permissions: permissions,
      status: 'active',
    }

    const { data, error } = await supabase.from('api_keys').insert([newKey]).select().single()
    
    setIsCreating(false)
    if (error) {
      toast('error', 'Erreur de création', error.message)
      return
    }

    setKeys(prev => [data, ...prev])
    setCreateOpen(false)
    setKeyName('')
    setPermissions(['read'])
    toast('success', 'Clé API créée', `La clé "${data.name}" est prête à l'emploi`)
  }

  const handleCopy = (keyItem: any) => {
    navigator.clipboard.writeText(keyItem.key).catch(() => {})
    setCopiedId(keyItem.id)
    toast('info', 'Clé copiée dans le presse-papier')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleRevoke = async (id: string) => {
    const { error } = await supabase.from('api_keys').update({ status: 'revoked' }).eq('id', id)
    if (error) {
      toast('error', 'Erreur de révocation', error.message)
      return
    }
    setKeys(prev => prev.map(k => k.id === id ? { ...k, status: 'revoked' } : k))
    toast('success', 'Clé révoquée')
  }

  const togglePermission = (p: string) => {
    setPermissions(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
  }

  const maskKey = (key: string) => key.slice(0, 12) + '••••••••••••' + key.slice(-4)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#eaf2fb]" style={{ fontFamily: 'Syne, sans-serif' }}>Clés API</h1>
          <p className="text-sm text-[#7a96b4] mt-1">{keys.filter(k => k.status === 'active').length} clé(s) active(s)</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} size="sm">
          <Plus size={16} />
          Générer une clé
        </Button>
      </div>

      {/* Keys table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1a2740]">
                {['Nom', 'Clé', 'Permissions', 'Créée le', 'Dernière utilisation', 'Statut', ''].map(h => (
                  <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-[#7a96b4] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="px-5 py-4 text-center text-[#7a96b4] text-xs">Chargement...</td></tr>
              ) : keys.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-4 text-center text-[#7a96b4] text-xs">Aucune clé API configurée.</td></tr>
              ) : keys.map((keyItem, i) => (
                <motion.tr
                  key={keyItem.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-[#1a2740] last:border-0 hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Key size={14} className="text-[#7a96b4]" />
                      <span className="text-sm font-medium text-[#eaf2fb]">{keyItem.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-[#7a96b4]">
                        {revealMap[keyItem.id] ? keyItem.key : maskKey(keyItem.key)}
                      </code>
                      <button onClick={() => setRevealMap(p => ({ ...p, [keyItem.id]: !p[keyItem.id] }))} className="text-[#7a96b4] hover:text-[#eaf2fb]">
                        {revealMap[keyItem.id] ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                      <button onClick={() => handleCopy(keyItem)} className={cn('transition-colors', copiedId === keyItem.id ? 'text-[#34d399]' : 'text-[#7a96b4] hover:text-[#eaf2fb]')}>
                        {copiedId === keyItem.id ? <Check size={13} /> : <Copy size={13} />}
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 flex-wrap">
                      {(keyItem.permissions||[]).map((p: string) => (
                        <Badge key={p} variant={p === 'admin' ? 'critical' : p === 'write' ? 'high' : 'info'} className="text-[10px]">{p}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-[#7a96b4]">{formatDate(keyItem.created_at)}</td>
                  <td className="px-5 py-4 text-sm text-[#7a96b4]">{keyItem.last_used ? formatDate(keyItem.last_used) : '—'}</td>
                  <td className="px-5 py-4">
                    <Badge variant={keyItem.status === 'active' ? 'success' : 'default'}>{keyItem.status === 'active' ? 'Active' : 'Révoquée'}</Badge>
                  </td>
                  <td className="px-5 py-4">
                    {keyItem.status === 'active' && (
                      <button onClick={() => handleRevoke(keyItem.id)} className="p-1.5 rounded-lg text-[#7a96b4] hover:text-[#fb7185] hover:bg-[#fb7185]/10 transition-all">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* API Docs */}
      <Card>
        <h2 className="text-lg font-bold text-[#eaf2fb] mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>Documentation API</h2>
        <div className="space-y-2">
          {endpoints.map((ep, i) => (
            <div key={i} className="rounded-xl border border-[#1a2740] overflow-hidden">
              <button
                onClick={() => setOpenEndpoint(openEndpoint === i ? null : i)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors"
              >
                <span className={cn('text-xs font-bold px-2 py-0.5 rounded-md border font-mono', ep.methodColor)}>{ep.method}</span>
                <code className="text-sm text-[#eaf2fb] font-mono">{ep.path}</code>
                <span className="ml-2 text-sm text-[#7a96b4] flex-1 text-left">{ep.desc}</span>
                <ChevronDown size={14} className={cn('text-[#7a96b4] transition-transform', openEndpoint === i && 'rotate-180')} />
              </button>
              <AnimatePresence>
                {openEndpoint === i && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-4 text-sm text-[#7a96b4] border-t border-[#1a2740] pt-3">
                      <p>Endpoint : <code className="text-[#7dd3fc] font-mono">{window?window.location.origin:''}{ep.path}</code></p>
                      <p className="mt-1">Authentification requise : Bearer token dans le header <code className="text-[#a78bfa]">Authorization</code></p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </Card>

      {/* Code examples */}
      <Card>
        <h2 className="text-lg font-bold text-[#eaf2fb] mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>Exemples de code</h2>
        <div className="flex items-center gap-2 mb-4">
          {(['curl', 'python', 'javascript'] as const).map(lang => (
            <button
              key={lang}
              onClick={() => setCodeLang(lang)}
              className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-all border', codeLang === lang ? 'bg-[#7dd3fc]/20 border-[#7dd3fc]/40 text-[#7dd3fc]' : 'border-[#1a2740] text-[#7a96b4] hover:text-[#eaf2fb]')}
            >
              {lang === 'curl' ? 'cURL' : lang === 'python' ? 'Python' : 'JavaScript'}
            </button>
          ))}
        </div>
        <pre className="bg-[#060d18] border border-[#1a2740] rounded-xl p-4 overflow-x-auto text-xs font-mono text-[#7a96b4] leading-relaxed whitespace-pre">
          {codeExamples[codeLang].split('\\n').map((line, i) => {
            const colored = line
              .replace(/(curl|import|const|await|requests|fetch|print|json)/g, '<span style="color:#a78bfa">$1</span>')
              .replace(/(".*?")/g, '<span style="color:#34d399">$1</span>')
              .replace(/(Bearer|POST|Content-Type|Authorization)/g, '<span style="color:#7dd3fc">$1</span>')
              .replace(/(#.*$)/g, '<span style="color:#1a2740">$1</span>')
            return <span key={i} dangerouslySetInnerHTML={{ __html: colored + '\\n' }} />
          })}
        </pre>
      </Card>

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Générer une clé API" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#eaf2fb] mb-1.5">Nom de la clé</label>
            <input
              value={keyName}
              onChange={e => setKeyName(e.target.value)}
              placeholder="Production API, CI/CD..."
              className="w-full bg-[#060d18] border border-[#1a2740] rounded-xl px-4 py-3 text-sm text-[#eaf2fb] placeholder:text-[#7a96b4] outline-none focus:border-[#7dd3fc]/60"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#eaf2fb] mb-2">Permissions</label>
            <div className="space-y-2">
              {[['read', 'Lecture — accès en lecture seule'], ['write', 'Écriture — créer et modifier des ressources'], ['admin', 'Admin — accès complet']].map(([val, label]) => (
                <label key={val} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={permissions.includes(val)}
                    onChange={() => togglePermission(val)}
                    className="w-4 h-4 rounded accent-[#7dd3fc]"
                  />
                  <span className="text-sm text-[#7a96b4] group-hover:text-[#eaf2fb] transition-colors">{label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(false)} className="flex-1">Annuler</Button>
            <Button size="sm" onClick={handleCreate} isLoading={isCreating} className="flex-1">
              <Key size={15} />
              Générer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
