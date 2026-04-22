import { type HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  accent?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>((
  { className, padding = 'md', accent = false, children, ...props }, ref
) => {
  const pads = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' }
  return (
    <div ref={ref}
      className={cn(
        'rounded-xl border transition-colors duration-150',
        'bg-[#161c26] border-[#1e2a3a] hover:border-[#253347]',
        accent && 'border-[rgba(65,232,196,.2)] bg-[rgba(65,232,196,.03)]',
        pads[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
Card.displayName = 'Card'
