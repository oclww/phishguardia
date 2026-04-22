import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'critical' | 'high' | 'medium' | 'low' | 'success' | 'info'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
  dot?: boolean
}

const styles: Record<BadgeVariant, string> = {
  default:  'bg-[#1e2a3a] text-[#7a96b0] border-[#253347]',
  critical: 'bg-[rgba(255,95,109,.1)]  text-[#ff5f6d] border-[rgba(255,95,109,.25)]',
  high:     'bg-[rgba(245,166,35,.1)]  text-[#f5a623] border-[rgba(245,166,35,.25)]',
  medium:   'bg-[rgba(94,158,247,.1)]  text-[#5e9ef7] border-[rgba(94,158,247,.25)]',
  low:      'bg-[rgba(50,213,131,.1)]  text-[#32d583] border-[rgba(50,213,131,.25)]',
  success:  'bg-[rgba(50,213,131,.1)]  text-[#32d583] border-[rgba(50,213,131,.25)]',
  info:     'bg-[rgba(65,232,196,.1)]  text-[#41e8c4] border-[rgba(65,232,196,.25)]',
}

export function Badge({ variant = 'default', children, className, dot }: BadgeProps) {
  const dotC: Record<BadgeVariant, string> = {
    default:'#7a96b0', critical:'#ff5f6d', high:'#f5a623',
    medium:'#5e9ef7', low:'#32d583', success:'#32d583', info:'#41e8c4',
  }
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium border',
      styles[variant], className
    )}>
      {dot && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dotC[variant] }}/>}
      {children}
    </span>
  )
}
