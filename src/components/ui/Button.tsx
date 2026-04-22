'use client'
import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'ghost' | 'outline' | 'danger' | 'success' | 'subtle'
type Size = 'xs' | 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant; size?: Size; isLoading?: boolean
}

const V: Record<Variant, string> = {
  primary: 'bg-[#eaf2fb] text-[#060d18] font-semibold shadow-[0_4px_14px_rgba(255,255,255,0.1)] hover:bg-white hover:shadow-[0_6px_20px_rgba(255,255,255,0.15)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300',
  ghost:   'text-[#7a96b0] hover:text-[#eaf2ff] hover:bg-white/[.04] active:scale-95 transition-all duration-200',
  outline: 'border border-[#1e2a3a] text-[#c8d8e8] hover:border-[#253347] hover:bg-white/[.03]',
  danger:  'bg-[rgba(255,95,109,.1)] border border-[rgba(255,95,109,.25)] text-[#ff5f6d] hover:bg-[rgba(255,95,109,.18)]',
  success: 'bg-[rgba(50,213,131,.1)] border border-[rgba(50,213,131,.25)] text-[#32d583] hover:bg-[rgba(50,213,131,.18)]',
  subtle:  'bg-[#161c26] border border-[#1e2a3a] text-[#7a96b0] hover:text-[#c8d8e8] hover:border-[#253347]',
}
const S: Record<Size, string> = {
  xs: 'px-2.5 py-1 text-[11px] rounded-md gap-1',
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm rounded-lg gap-2',
  lg: 'px-6 py-2.5 text-sm rounded-xl gap-2',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>((
  { variant='primary', size='md', isLoading, className, children, disabled, ...props }, ref
) => (
  <button ref={ref} disabled={disabled||isLoading}
    className={cn('inline-flex items-center justify-center font-medium transition-all duration-150 select-none disabled:opacity-40 disabled:cursor-not-allowed', V[variant], S[size], className)}
    {...props}>
    {isLoading
      ? <><span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"/>Chargement...</>
      : children}
  </button>
))
Button.displayName = 'Button'
