import { cn } from '@/lib/utils'

interface AvatarProps {
  src?: string
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-20 h-20 text-2xl',
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??'

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? 'Avatar'}
        className={cn('rounded-full object-cover bg-[#0c1526]', sizes[size], className)}
      />
    )
  }

  return (
    <div className={cn(
      'rounded-full flex items-center justify-center font-semibold',
      'bg-gradient-to-br from-[#7dd3fc]/20 to-[#a78bfa]/20 text-[#7dd3fc] border border-[#7dd3fc]/20',
      sizes[size],
      className
    )}>
      {initials}
    </div>
  )
}
