export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  company: string
  phone?: string
  companySize?: string
  role: 'admin' | 'analyst' | 'viewer'
  avatar?: string
  plan: 'starter' | 'pro' | 'enterprise'
  createdAt: string
}

export interface Threat {
  id: string
  type: 'phishing' | 'malware' | 'spear-phishing' | 'bec' | 'spam'
  severity: 'critical' | 'high' | 'medium' | 'low'
  sender: string
  senderEmail: string
  subject: string
  origin: string
  country: string
  detectedAt: string
  status: 'blocked' | 'quarantined' | 'reviewed'
  aiScore: number
  indicators: string[]
}

export interface Email {
  id: string
  from: string
  fromEmail: string
  to: string
  subject: string
  receivedAt: string
  status: 'safe' | 'suspicious' | 'malicious'
  aiScore: number
  threatType?: string
  indicators?: string[]
}

export interface Report {
  id: string
  name: string
  type: 'weekly' | 'monthly' | 'custom'
  generatedAt: string
  period: string
  size: string
  downloadCount: number
}

export interface TeamMember {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'admin' | 'analyst' | 'viewer'
  avatar?: string
  status: 'active' | 'pending'
  joinedAt: string
}

export interface ApiKey {
  id: string
  name: string
  key: string
  permissions: ('read' | 'write' | 'admin')[]
  createdAt: string
  lastUsed?: string
  status: 'active' | 'revoked'
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  author: Author
  category: string
  tags: string[]
  publishedAt: string
  readingTime: number
  imageUrl?: string
}

export interface Author {
  id: string
  name: string
  role: string
  avatar?: string
  bio: string
}

export interface PricingPlan {
  id: string
  name: string
  monthlyPrice: number
  annualPrice: number
  description: string
  features: string[]
  highlighted: boolean
  cta: string
}

export interface Invoice {
  id: string
  number: string
  amount: number
  status: 'paid' | 'pending' | 'failed'
  date: string
  period: string
}

export type Severity = 'critical' | 'high' | 'medium' | 'low'
export type ThreatType = 'phishing' | 'malware' | 'spear-phishing' | 'bec' | 'spam'
