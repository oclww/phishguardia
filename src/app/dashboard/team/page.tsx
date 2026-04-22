'use client'

import { useState } from 'react'
import { UserPlus, Mail, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/contexts/ToastContext'
import { mockTeamMembers } from '@/data/mockData'
import type { TeamMember } from '@/types'
import { formatDate } from '@/lib/utils'

const roleVariants: Record<string, 'info' | 'medium' | 'success'> = {
  admin: 'info',
  analyst: 'medium',
  viewer: 'success',
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>(mockTeamMembers)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'analyst' | 'viewer'>('analyst')
  const [isInviting, setIsInviting] = useState(false)
  const { addToast } = useToast()

  const handleInvite = async () => {
    if (!inviteEmail) return
    setIsInviting(true)
    await new Promise(r => setTimeout(r, 800))
    const newMember: TeamMember = {
      id: `mem_${Date.now()}`,
      firstName: inviteEmail.split('@')[0],
      lastName: '',
      email: inviteEmail,
      role: inviteRole,
      status: 'pending',
      joinedAt: new Date().toISOString(),
    }
    setMembers(prev => [...prev, newMember])
    setIsInviting(false)
    setInviteOpen(false)
    setInviteEmail('')
    addToast('success', 'Invitation envoyée', `Un email a été envoyé à ${inviteEmail}`)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setMembers(prev => prev.filter(m => m.id !== deleteTarget.id))
    addToast('success', 'Membre retiré', `${deleteTarget.firstName} a été retiré de l'équipe`)
    setDeleteTarget(null)
  }

  const handleRoleChange = (id: string, role: 'admin' | 'analyst' | 'viewer') => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, role } : m))
    addToast('success', 'Rôle mis à jour')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-[#eaf2fb]"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            Équipe
          </h1>
          <p className="text-sm text-[#7a96b4] mt-1">
            {members.length} membre{members.length > 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setInviteOpen(true)} size="sm">
          <UserPlus size={16} />
          Inviter un membre
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Administrateurs', count: members.filter(m => m.role === 'admin').length, color: '#7dd3fc' },
          { label: 'Analystes', count: members.filter(m => m.role === 'analyst').length, color: '#a78bfa' },
          { label: 'Observateurs', count: members.filter(m => m.role === 'viewer').length, color: '#34d399' },
        ].map(s => (
          <Card key={s.label} className="p-4 text-center">
            <p
              className="text-2xl font-bold"
              style={{ color: s.color, fontFamily: 'JetBrains Mono, monospace' }}
            >
              {s.count}
            </p>
            <p className="text-xs text-[#7a96b4] mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Members table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1a2740]">
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#7a96b4] uppercase tracking-wider">
                  Membre
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#7a96b4] uppercase tracking-wider">
                  Rôle
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#7a96b4] uppercase tracking-wider">
                  Statut
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#7a96b4] uppercase tracking-wider">
                  Ajouté
                </th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-[#7a96b4] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, i) => (
                <motion.tr
                  key={member.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-[#1a2740] last:border-0 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={`${member.firstName} ${member.lastName}`}
                        src={member.avatar}
                        size="md"
                      />
                      <div>
                        <p className="text-sm font-medium text-[#eaf2fb]">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-xs text-[#7a96b4]">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={member.role}
                      onChange={e =>
                        handleRoleChange(member.id, e.target.value as 'admin' | 'analyst' | 'viewer')
                      }
                      className="bg-[#060d18] border border-[#1a2740] rounded-lg px-2 py-1 text-xs text-[#eaf2fb] outline-none focus:border-[#7dd3fc]/50 cursor-pointer"
                    >
                      <option value="admin">Administrateur</option>
                      <option value="analyst">Analyste</option>
                      <option value="viewer">Observateur</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={member.status === 'active' ? 'success' : 'high'}>
                      {member.status === 'active' ? 'Actif' : 'En attente'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#7a96b4]">
                    {formatDate(member.joinedAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setDeleteTarget(member)}
                        className="p-1.5 rounded-lg text-[#7a96b4] hover:text-[#fb7185] hover:bg-[#fb7185]/10 transition-all"
                        title="Retirer le membre"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Invite Modal */}
      <Modal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Inviter un membre"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#eaf2fb] mb-1.5">
              Adresse email
            </label>
            <input
              type="email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleInvite()}
              placeholder="colleague@company.com"
              className="w-full bg-[#060d18] border border-[#1a2740] rounded-xl px-4 py-3 text-sm text-[#eaf2fb] placeholder:text-[#7a96b4] outline-none focus:border-[#7dd3fc]/60 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#eaf2fb] mb-1.5">Rôle</label>
            <select
              value={inviteRole}
              onChange={e => setInviteRole(e.target.value as 'admin' | 'analyst' | 'viewer')}
              className="w-full bg-[#060d18] border border-[#1a2740] rounded-xl px-4 py-3 text-sm text-[#eaf2fb] outline-none focus:border-[#7dd3fc]/60 transition-colors"
            >
              <option value="admin">Administrateur</option>
              <option value="analyst">Analyste</option>
              <option value="viewer">Observateur</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInviteOpen(false)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              size="sm"
              onClick={handleInvite}
              isLoading={isInviting}
              disabled={!inviteEmail}
              className="flex-1"
            >
              <Mail size={15} />
              Envoyer l'invitation
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Retirer le membre"
        size="sm"
      >
        <p className="text-sm text-[#7a96b4] mb-6">
          Êtes-vous sûr de vouloir retirer{' '}
          <strong className="text-[#eaf2fb]">
            {deleteTarget?.firstName} {deleteTarget?.lastName}
          </strong>{' '}
          de l'équipe ? Cette action est irréversible.
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteTarget(null)}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete} className="flex-1">
            Retirer
          </Button>
        </div>
      </Modal>
    </div>
  )
}
