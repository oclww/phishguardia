'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { Search, Download, Eye, CheckCircle, ShieldAlert, ShieldX, Clock, ChevronLeft, ChevronRight, AlertTriangle, X } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { mockThreats, threatsByDayData } from '@/data/mockData'
import { formatDateTime, getScoreColor } from '@/lib/utils'
import type { Threat } from '@/types'

const PAGE_SIZE = 6
const typeLabels: Record<Threat['type'],string> = { phishing:'Phishing', malware:'Malware', 'spear-phishing':'Spear-phishing', bec:'BEC', spam:'Spam' }
const severityLabels: Record<Threat['severity'],string> = { critical:'Critique', high:'Élevée', medium:'Moyenne', low:'Faible' }
const statusLabels: Record<Threat['status'],string> = { blocked:'Bloqué', quarantined:'Quarantaine', reviewed:'Examiné' }

function TypeBadge({type}:{type:Threat['type']}) {
  const v: Record<Threat['type'],'critical'|'high'|'medium'|'low'|'default'> = {phishing:'critical',malware:'high','spear-phishing':'high',bec:'medium',spam:'default'}
  return <Badge variant={v[type]}>{typeLabels[type]}</Badge>
}
function SeverityBadge({severity}:{severity:Threat['severity']}) {
  const v={critical:'critical' as const,high:'high' as const,medium:'medium' as const,low:'low' as const}
  return <Badge variant={v[severity]}>{severityLabels[severity]}</Badge>
}
function StatusBadge({status}:{status:Threat['status']}) {
  const v={blocked:'critical' as const,quarantined:'high' as const,reviewed:'success' as const}
  return <Badge variant={v[status]}>{statusLabels[status]}</Badge>
}

const Tip = ({active,payload,label}:any) => {
  if(!active||!payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2.5 text-xs shadow-2xl" style={{background:'#0c1526',border:'1px solid rgba(22,32,53,.9)'}}>
      <p className="mb-1.5 font-medium" style={{color:'#7a96b4'}}>{label}</p>
      {payload.map((p:any)=>(
        <p key={p.name} className="font-mono flex items-center gap-1.5" style={{color:p.fill}}>
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{backgroundColor:p.fill}}/>{p.name}: <span className="font-bold ml-0.5">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

export default function ThreatsPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [selectedThreat, setSelectedThreat] = useState<Threat|null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const filtered = useMemo(()=>mockThreats.filter(t=>{
    const s=search.toLowerCase()
    return (!search||t.sender.toLowerCase().includes(s)||t.senderEmail.toLowerCase().includes(s)||t.subject.toLowerCase().includes(s))
      &&(typeFilter==='all'||t.type===typeFilter)
      &&(severityFilter==='all'||t.severity===severityFilter)
      &&(statusFilter==='all'||t.status===statusFilter)
  }),[search,typeFilter,severityFilter,statusFilter])

  const totalPages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE))
  const paginated=filtered.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE)
  const stats=useMemo(()=>({
    total:mockThreats.length,
    critical:mockThreats.filter(t=>t.severity==='critical').length,
    blocked:mockThreats.filter(t=>t.status==='blocked').length,
    quarantined:mockThreats.filter(t=>t.status==='quarantined').length,
  }),[])

  const toggleSelect=(id:string)=>setSelectedIds(prev=>{const n=new Set(prev);n.has(id)?n.delete(id):n.add(id);return n})
  const hasFilters=search||typeFilter!=='all'||severityFilter!=='all'||statusFilter!=='all'

  const exportCSV=()=>{
    const h=['ID','Type','Sévérité','Expéditeur','Email','Sujet','Origine','Score IA','Statut','Date']
    const r=mockThreats.map(t=>[t.id,typeLabels[t.type],severityLabels[t.severity],t.sender,t.senderEmail,`"${t.subject.replace(/"/g,'""')}"`,t.country,t.aiScore,statusLabels[t.status],formatDateTime(t.detectedAt)])
    const csv=[h,...r].map(x=>x.join(',')).join('\n')
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download=`menaces-${new Date().toISOString().slice(0,10)}.csv`;a.click()
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} className="flex items-center justify-between">
        <div>
          <h1 className="font-bold tracking-tight" style={{fontSize:'22px',fontFamily:'Syne, sans-serif',color:'#eaf2fb'}}>Menaces Détectées</h1>
          <p className="text-sm mt-0.5" style={{color:'#4a6580'}}>{mockThreats.length} menaces enregistrées</p>
        </div>
        <Button onClick={exportCSV} variant="outline" size="sm" className="gap-2">
          <Download size={13}/>Exporter CSV
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:.05}} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {label:'Total menaces',   value:stats.total,       icon:ShieldAlert, color:'#7dd3fc'},
          {label:'Critiques',       value:stats.critical,     icon:ShieldX,    color:'#fb7185'},
          {label:'Bloquées',        value:stats.blocked,      icon:ShieldX,    color:'#34d399'},
          {label:'Quarantaine',     value:stats.quarantined,  icon:Clock,      color:'#fbbf24'},
        ].map(s=>{
          const Icon=s.icon
          return (
            <Card key={s.label} className="flex items-center gap-3 p-4 card-hover">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{background:`${s.color}12`,border:`1px solid ${s.color}20`}}>
                <Icon size={15} style={{color:s.color}}/>
              </div>
              <div>
                <p className="text-2xl font-mono font-bold" style={{color:'#eaf2fb'}}>{s.value}</p>
                <p className="text-[11px]" style={{color:'#4a6580'}}>{s.label}</p>
              </div>
            </Card>
          )
        })}
      </motion.div>

      {/* Chart */}
      <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:.1}}>
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold" style={{color:'#eaf2fb'}}>Menaces par type — 7 jours</h2>
            <div className="flex items-center gap-3 text-[11px]" style={{color:'#4a6580'}}>
              {[{l:'Phishing',c:'#fb7185'},{l:'Malware',c:'#a78bfa'},{l:'Spear',c:'#fbbf24'},{l:'BEC',c:'#7dd3fc'},{l:'Spam',c:'#34d399'}].map(x=>(
                <span key={x.l} className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{backgroundColor:x.c}}/>{x.l}</span>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={threatsByDayData} margin={{top:0,right:10,left:-20,bottom:0}} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(22,32,53,.8)" vertical={false}/>
              <XAxis dataKey="day" tick={{fill:'#374e65',fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'#374e65',fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip content={<Tip/>} cursor={{fill:'rgba(94,234,212,.025)'}}/>
              <Bar dataKey="phishing" name="Phishing"       fill="#fb7185" opacity={.75} radius={[3,3,0,0]}/>
              <Bar dataKey="malware"  name="Malware"        fill="#a78bfa" opacity={.75} radius={[3,3,0,0]}/>
              <Bar dataKey="spear"    name="Spear-phishing" fill="#fbbf24" opacity={.75} radius={[3,3,0,0]}/>
              <Bar dataKey="bec"      name="BEC"            fill="#7dd3fc" opacity={.75} radius={[3,3,0,0]}/>
              <Bar dataKey="spam"     name="Spam"           fill="#34d399" opacity={.75} radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:.15}}>
        <Card className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2 flex-1 min-w-[200px] rounded-xl px-3 py-2"
              style={{background:'rgba(3,8,15,.6)',border:'1px solid rgba(22,32,53,.8)'}}>
              <Search size={13} style={{color:'#4a6580'}}/>
              <input type="text" placeholder="Rechercher expéditeur, sujet..." value={search}
                onChange={e=>{setSearch(e.target.value);setPage(1)}}
                className="bg-transparent text-sm outline-none w-full placeholder:text-[#374e65]"
                style={{color:'#eaf2fb'}}/>
              {search&&<button onClick={()=>{setSearch('');setPage(1)}} style={{color:'#4a6580'}}><X size={12}/></button>}
            </div>
            {[
              {val:typeFilter,    set:(v:string)=>{setTypeFilter(v);setPage(1)},    opts:[['all','Tous types'],['phishing','Phishing'],['malware','Malware'],['spear-phishing','Spear-phishing'],['bec','BEC'],['spam','Spam']]},
              {val:severityFilter,set:(v:string)=>{setSeverityFilter(v);setPage(1)},opts:[['all','Toutes sévérités'],['critical','Critique'],['high','Élevée'],['medium','Moyenne'],['low','Faible']]},
              {val:statusFilter,  set:(v:string)=>{setStatusFilter(v);setPage(1)},  opts:[['all','Tous statuts'],['blocked','Bloqué'],['quarantined','Quarantaine'],['reviewed','Examiné']]},
            ].map((sel,i)=>(
              <select key={i} value={sel.val} onChange={e=>sel.set(e.target.value)}
                className="rounded-xl px-3 py-2 text-sm outline-none cursor-pointer transition-colors"
                style={{background:'rgba(3,8,15,.6)',border:'1px solid rgba(22,32,53,.8)',color:'#eaf2fb'}}>
                {sel.opts.map(([v,l])=><option key={v} value={v} style={{background:'#0c1526'}}>{l}</option>)}
              </select>
            ))}
            {hasFilters&&(
              <button onClick={()=>{setSearch('');setTypeFilter('all');setSeverityFilter('all');setStatusFilter('all');setPage(1)}}
                className="text-xs px-2.5 py-1.5 rounded-lg transition-all"
                style={{color:'#fb7185',border:'1px solid rgba(248,113,113,.2)',background:'rgba(248,113,113,.06)'}}>
                ✕ Réinitialiser
              </button>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Table */}
      <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:.2}}>
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{borderBottom:'1px solid rgba(22,32,53,.8)'}}>
                  <th className="px-4 py-3 w-10">
                    <input type="checkbox" className="accent-[#7dd3fc]"
                      onChange={e=>e.target.checked?setSelectedIds(new Set(paginated.map(t=>t.id))):setSelectedIds(new Set())}/>
                  </th>
                  {['Type','Sévérité','Expéditeur','Sujet','Origine','Score','Statut','Date',''].map(h=>(
                    <th key={h} className="text-left text-[11px] font-medium px-4 py-3" style={{color:'#374e65'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length===0?(
                  <tr><td colSpan={10} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{background:'rgba(22,32,53,.6)',border:'1px solid rgba(22,32,53,.8)'}}>
                        <AlertTriangle size={22} style={{color:'#4a6580'}}/>
                      </div>
                      <p style={{color:'#4a6580'}}>Aucune menace trouvée</p>
                    </div>
                  </td></tr>
                ):(
                  <AnimatePresence mode="popLayout">
                    {paginated.map(threat=>(
                      <motion.tr key={threat.id} layout initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.15}}
                        className="transition-all cursor-pointer" style={{borderBottom:'1px solid rgba(22,32,53,.5)'}}
                        onClick={()=>setSelectedThreat(threat)}
                        onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,.012)')}
                        onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                        <td className="px-4 py-3" onClick={e=>e.stopPropagation()}>
                          <input type="checkbox" checked={selectedIds.has(threat.id)} onChange={()=>toggleSelect(threat.id)} className="accent-[#7dd3fc]"/>
                        </td>
                        <td className="px-4 py-3"><TypeBadge type={threat.type}/></td>
                        <td className="px-4 py-3"><SeverityBadge severity={threat.severity}/></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar name={threat.sender} size="sm"/>
                            <div>
                              <p className="text-[11px] font-medium truncate max-w-[95px]" style={{color:'#eaf2fb'}}>{threat.sender}</p>
                              <p className="text-[10px] truncate max-w-[95px]" style={{color:'#4a6580'}}>{threat.senderEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3"><p className="text-[11px] truncate max-w-[140px]" style={{color:'#eaf2fb'}}>{threat.subject}</p></td>
                        <td className="px-4 py-3 text-[11px] whitespace-nowrap" style={{color:'#eaf2fb'}}>{threat.country}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-mono font-bold" style={{color:getScoreColor(threat.aiScore)}}>{threat.aiScore}</span>
                            <div className="w-8 h-1 rounded-full overflow-hidden" style={{background:'rgba(22,32,53,.8)'}}>
                              <div className="h-full rounded-full" style={{width:`${threat.aiScore}%`,backgroundColor:getScoreColor(threat.aiScore)}}/>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={threat.status}/></td>
                        <td className="px-4 py-3 text-[10px] whitespace-nowrap" style={{color:'#374e65'}}>{formatDateTime(threat.detectedAt)}</td>
                        <td className="px-4 py-3" onClick={e=>e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={()=>setSelectedThreat(threat)}><Eye size={12}/></Button>
                            <Button variant="success" size="sm"><CheckCircle size={12}/></Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3" style={{borderTop:'1px solid rgba(22,32,53,.8)'}}>
            <p className="text-xs" style={{color:'#4a6580'}}>{filtered.length} résultat{filtered.length!==1?'s':''} — page {page}/{totalPages}</p>
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="sm" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}><ChevronLeft size={14}/></Button>
              {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
                <button key={p} onClick={()=>setPage(p)}
                  className="w-7 h-7 rounded-lg text-xs font-medium transition-all"
                  style={p===page?{background:'rgba(94,234,212,.1)',color:'#7dd3fc',border:'1px solid rgba(94,234,212,.22)'}:{color:'#4a6580',border:'1px solid transparent'}}>
                  {p}
                </button>
              ))}
              <Button variant="ghost" size="sm" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}><ChevronRight size={14}/></Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Modal */}
      <Modal isOpen={!!selectedThreat} onClose={()=>setSelectedThreat(null)} title="Détail de la menace" size="lg">
        {selectedThreat&&(
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-[11px] mb-1" style={{color:'#4a6580'}}>Expéditeur</p><p className="font-semibold" style={{color:'#eaf2fb'}}>{selectedThreat.sender}</p><p className="text-sm" style={{color:'#7a96b4'}}>{selectedThreat.senderEmail}</p></div>
              <div><p className="text-[11px] mb-1" style={{color:'#4a6580'}}>Origine</p><p className="font-semibold" style={{color:'#eaf2fb'}}>{selectedThreat.country}</p><p className="text-[11px]" style={{color:'#4a6580'}}>IP: {selectedThreat.origin}</p></div>
              <div className="col-span-2"><p className="text-[11px] mb-1" style={{color:'#4a6580'}}>Sujet</p><p style={{color:'#eaf2fb'}}>{selectedThreat.subject}</p></div>
              <div><p className="text-[11px] mb-1" style={{color:'#4a6580'}}>Détecté le</p><p style={{color:'#eaf2fb'}}>{formatDateTime(selectedThreat.detectedAt)}</p></div>
              <div>
                <p className="text-[11px] mb-1" style={{color:'#4a6580'}}>Score IA</p>
                <p className="text-2xl font-mono font-bold" style={{color:getScoreColor(selectedThreat.aiScore)}}>{selectedThreat.aiScore}<span className="text-sm font-normal" style={{color:'#4a6580'}}>/100</span></p>
              </div>
              <div className="col-span-2 flex flex-wrap gap-2"><TypeBadge type={selectedThreat.type}/><SeverityBadge severity={selectedThreat.severity}/><StatusBadge status={selectedThreat.status}/></div>
            </div>
            <div style={{borderTop:'1px solid rgba(22,32,53,.8)',paddingTop:'1rem'}}>
              <p className="text-[11px] mb-3 uppercase tracking-wider" style={{color:'#374e65'}}>Indicateurs de compromission ({selectedThreat.indicators.length})</p>
              <ul className="space-y-2">
                {selectedThreat.indicators.map((ind,i)=>(
                  <li key={i} className="flex items-start gap-2 text-sm rounded-xl px-3 py-2.5" style={{color:'#eaf2fb',background:'rgba(3,8,15,.6)',border:'1px solid rgba(22,32,53,.8)'}}>
                    <span style={{color:'#fb7185'}} className="shrink-0 mt-0.5">▸</span>{ind}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-2 pt-2" style={{borderTop:'1px solid rgba(22,32,53,.8)'}}>
              <Button variant="success" size="sm"><CheckCircle size={13}/>Approuver</Button>
              <Button variant="danger"  size="sm">Supprimer</Button>
              <Button variant="outline" size="sm" onClick={()=>setSelectedThreat(null)}>Fermer</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
