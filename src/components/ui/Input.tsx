'use client'

import { type InputHTMLAttributes, forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  hint,
  type = 'text',
  className,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-[#eaf2fb]">{label}</label>
      )}
      <div className="relative">
        <input
          ref={ref}
          type={inputType}
          className={cn(
            'w-full bg-[#060d18] border rounded-xl px-4 py-3 text-[#eaf2fb] text-sm',
            'placeholder:text-[#7a96b4] outline-none transition-all duration-200',
            'focus:border-[#7dd3fc]/60 focus:ring-2 focus:ring-[#7dd3fc]/10',
            error ? 'border-[#fb7185]/60' : 'border-[#1a2740]',
            isPassword && 'pr-12',
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a96b4] hover:text-[#eaf2fb] transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-[#fb7185]">{error}</p>}
      {hint && !error && <p className="text-xs text-[#7a96b4]">{hint}</p>}
    </div>
  )
})
Input.displayName = 'Input'
