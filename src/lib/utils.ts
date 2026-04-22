import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('fr-FR').format(num)
}

export function getSeverityBg(severity: string): string {
  switch (severity) {
    case 'critical': return 'bg-red-DEFAULT/20 text-red-DEFAULT border-red-DEFAULT/30'
    case 'high': return 'bg-amber-DEFAULT/20 text-amber-DEFAULT border-amber-DEFAULT/30'
    case 'medium': return 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30'
    case 'low': return 'bg-green-DEFAULT/20 text-green-DEFAULT border-green-DEFAULT/30'
    default: return 'bg-muted/20 text-muted border-muted/30'
  }
}

export function getStatusBg(status: string): string {
  switch (status) {
    case 'blocked': return 'bg-red-DEFAULT/20 text-red-DEFAULT border-red-DEFAULT/30'
    case 'quarantined': return 'bg-amber-DEFAULT/20 text-amber-DEFAULT border-amber-DEFAULT/30'
    case 'reviewed': return 'bg-green-DEFAULT/20 text-green-DEFAULT border-green-DEFAULT/30'
    case 'safe': return 'bg-green-DEFAULT/20 text-green-DEFAULT border-green-DEFAULT/30'
    case 'suspicious': return 'bg-amber-DEFAULT/20 text-amber-DEFAULT border-amber-DEFAULT/30'
    case 'malicious': return 'bg-red-DEFAULT/20 text-red-DEFAULT border-red-DEFAULT/30'
    default: return 'bg-muted/20 text-muted border-muted/30'
  }
}

export function getScoreColor(score: number): string {
  if (score >= 80) return '#fb7185'
  if (score >= 60) return '#fbbf24'
  if (score >= 40) return '#facc15'
  return '#34d399'
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + '...' : str
}

export function generateAvatar(name: string): string {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0c1526&textColor=7dd3fc`
}
