'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  Download,
  Eye,
  Plus,
  BarChart2,
  Calendar,
  TrendingUp,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/contexts/ToastContext'
import { mockReports } from '@/data/mockData'
import { formatDate, formatDateTime } from '@/lib/utils'
import type { Report } from '@/types'

function TypeBadge({ type }: { type: Report['type'] }) {
  const map = {
    weekly: { label: 'Hebdomadaire', variant: 'info' as const },
    monthly: { label: 'Mensuel', variant: 'success' as const },
    custom: { label: 'Personnalisé', variant: 'high' as const },
  }
  const { label, variant } = map[type]
  return <Badge variant={variant}>{label}</Badge>
}

// Fake preview chart bars
const previewBars = [42, 67, 55, 80, 73, 60, 88, 70, 65, 78, 90, 55]

export default function ReportsPage() {
  const { addToast } = useToast()
  const [generateOpen, setGenerateOpen] = useState(false)
  const [previewReport, setPreviewReport] = useState<Report | null>(null)
  const [genType, setGenType] = useState<Report['type']>('weekly')
  const [genDateFrom, setGenDateFrom] = useState('2026-03-01')
  const [genDateTo, setGenDateTo] = useState('2026-03-31')
  const [isGenerating, setIsGenerating] = useState(false)

  const totalDownloads = mockReports.reduce((s, r) => s + r.downloadCount, 0)
  const lastReport = [...mockReports].sort(
    (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
  )[0]

  const handleDownload = (report: Report) => {
    addToast('success', 'Téléchargement démarré', `${report.name} (${report.size})`)
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    await new Promise((r) => setTimeout(r, 1800))
    setIsGenerating(false)
    setGenerateOpen(false)
    addToast('success', 'Rapport généré avec succès', 'Il est disponible dans la liste ci-dessous.')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-[#eaf2fb]">Rapports</h1>
          <p className="text-[#7a96b4] text-sm mt-0.5">Générez et téléchargez vos rapports de sécurité</p>
        </div>
        <Button onClick={() => setGenerateOpen(true)} className="flex items-center gap-2">
          <Plus size={15} />
          Générer un rapport
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {[
          {
            label: 'Total rapports',
            value: mockReports.length.toString(),
            icon: FileText,
            color: '#7dd3fc',
          },
          {
            label: 'Téléchargements ce mois',
            value: totalDownloads.toString(),
            icon: Download,
            color: '#a78bfa',
          },
          {
            label: 'Dernier rapport généré',
            value: lastReport ? formatDate(lastReport.generatedAt) : '—',
            icon: Calendar,
            color: '#34d399',
          },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="flex items-center gap-4 p-5">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${stat.color}18`, border: `1px solid ${stat.color}30` }}
              >
                <Icon size={20} style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-2xl font-mono font-bold text-[#eaf2fb]">{stat.value}</p>
                <p className="text-[#7a96b4] text-sm">{stat.label}</p>
              </div>
            </Card>
          )
        })}
      </motion.div>

      {/* Reports Grid */}
      {mockReports.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-[#1a2740] flex items-center justify-center mb-4">
              <FileText size={32} className="text-[#7a96b4]" />
            </div>
            <p className="text-[#eaf2fb] font-semibold text-lg mb-2">Aucun rapport disponible</p>
            <p className="text-[#7a96b4] text-sm mb-6">
              Générez votre premier rapport pour analyser votre sécurité email.
            </p>
            <Button onClick={() => setGenerateOpen(true)}>
              <Plus size={15} /> Générer un rapport
            </Button>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {mockReports.map((report, i) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <Card className="flex flex-col h-full hover:border-[#7dd3fc]/30 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: '#7dd3fc18', border: '1px solid #7dd3fc30' }}
                  >
                    <BarChart2 size={18} className="text-[#7dd3fc]" />
                  </div>
                  <TypeBadge type={report.type} />
                </div>

                <h3 className="text-[#eaf2fb] font-semibold text-sm leading-snug mb-1">
                  {report.name}
                </h3>
                <p className="text-[#7a96b4] text-xs mb-3">Période : {report.period}</p>

                <div className="mt-auto space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#7a96b4]">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      {formatDate(report.generatedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Download size={11} />
                      {report.downloadCount} téléch.
                    </span>
                    <span>{report.size}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setPreviewReport(report)}
                    >
                      <Eye size={13} /> Aperçu
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDownload(report)}
                    >
                      <Download size={13} /> Télécharger
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Generate Report Modal */}
      <Modal
        isOpen={generateOpen}
        onClose={() => setGenerateOpen(false)}
        title="Générer un rapport"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-[#7a96b4] text-xs mb-2">Type de rapport</label>
            <div className="grid grid-cols-3 gap-2">
              {(['weekly', 'monthly', 'custom'] as Report['type'][]).map((t) => {
                const labels = { weekly: 'Hebdomadaire', monthly: 'Mensuel', custom: 'Personnalisé' }
                return (
                  <button
                    key={t}
                    onClick={() => setGenType(t)}
                    className={`px-3 py-2 rounded-xl text-sm border transition-all ${
                      genType === t
                        ? 'border-[#7dd3fc]/40 bg-[#7dd3fc]/10 text-[#7dd3fc]'
                        : 'border-[#1a2740] text-[#7a96b4] hover:bg-white/5'
                    }`}
                  >
                    {labels[t]}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#7a96b4] text-xs mb-2">Date de début</label>
              <input
                type="date"
                value={genDateFrom}
                onChange={(e) => setGenDateFrom(e.target.value)}
                className="w-full bg-[#060d18] border border-[#1a2740] rounded-xl px-3 py-2 text-sm text-[#eaf2fb] outline-none focus:border-[#7dd3fc]/40"
              />
            </div>
            <div>
              <label className="block text-[#7a96b4] text-xs mb-2">Date de fin</label>
              <input
                type="date"
                value={genDateTo}
                onChange={(e) => setGenDateTo(e.target.value)}
                className="w-full bg-[#060d18] border border-[#1a2740] rounded-xl px-3 py-2 text-sm text-[#eaf2fb] outline-none focus:border-[#7dd3fc]/40"
              />
            </div>
          </div>
          <div className="rounded-xl bg-[#060d18] border border-[#1a2740] p-3 text-xs text-[#7a96b4]">
            Le rapport inclura : synthèse des menaces, statistiques d'emails, évolution du score de risque,
            top des expéditeurs malveillants et recommandations de sécurité.
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleGenerate}
              isLoading={isGenerating}
              className="flex-1"
            >
              <TrendingUp size={14} /> Générer le rapport
            </Button>
            <Button variant="ghost" onClick={() => setGenerateOpen(false)}>
              Annuler
            </Button>
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={!!previewReport}
        onClose={() => setPreviewReport(null)}
        title={previewReport?.name ?? 'Aperçu'}
        size="xl"
      >
        {previewReport && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TypeBadge type={previewReport.type} />
                <span className="text-[#7a96b4] text-sm">{previewReport.period}</span>
              </div>
              <span className="text-[#7a96b4] text-xs">Généré le {formatDateTime(previewReport.generatedAt)}</span>
            </div>

            {/* Fake PDF-like preview */}
            <div className="rounded-2xl border border-[#1a2740] bg-[#060d18] p-6 space-y-6">
              {/* Title */}
              <div className="text-center border-b border-[#1a2740] pb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7dd3fc] to-[#a78bfa] flex items-center justify-center">
                    <span className="text-[#060d18] text-xs font-bold">PG</span>
                  </div>
                  <span className="text-[#7dd3fc] font-bold text-lg">PhishGuard.IA</span>
                </div>
                <p className="text-[#eaf2fb] font-bold text-base">{previewReport.name}</p>
                <p className="text-[#7a96b4] text-xs mt-1">Période couverte : {previewReport.period}</p>
              </div>

              {/* Stats summary */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Emails analysés', value: '12 847', color: '#7dd3fc' },
                  { label: 'Menaces bloquées', value: '342', color: '#fb7185' },
                  { label: 'Taux détection', value: '99.8%', color: '#34d399' },
                  { label: 'Temps moyen', value: '2.1ms', color: '#a78bfa' },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="font-mono font-bold text-xl" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-[#7a96b4] text-xs">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Fake bar chart */}
              <div>
                <p className="text-[#7a96b4] text-xs mb-3">Évolution des menaces détectées</p>
                <div className="flex items-end gap-1 h-20">
                  {previewBars.map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-sm"
                      style={{
                        height: `${h}%`,
                        backgroundColor: h > 75 ? '#fb7185' : h > 60 ? '#fbbf24' : '#7dd3fc',
                        opacity: 0.8,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <p className="text-[#eaf2fb] font-semibold text-sm mb-2">Recommandations</p>
                <ul className="space-y-1 text-xs text-[#7a96b4]">
                  <li className="flex gap-2"><span className="text-[#34d399]">✓</span> Maintenir les règles de filtrage anti-phishing à jour</li>
                  <li className="flex gap-2"><span className="text-[#fbbf24]">!</span> Renforcer l'authentification MFA pour les comptes à risque</li>
                  <li className="flex gap-2"><span className="text-[#fb7185]">▲</span> Former les équipes aux nouvelles techniques de spear-phishing</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => handleDownload(previewReport)} className="flex-1">
                <Download size={14} /> Télécharger ({previewReport.size})
              </Button>
              <Button variant="ghost" onClick={() => setPreviewReport(null)}>
                Fermer
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
