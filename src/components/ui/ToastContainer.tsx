'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'
import { cn } from '@/lib/utils'

const icons = {
  success: <CheckCircle size={18} className="text-[#34d399]" />,
  error: <XCircle size={18} className="text-[#fb7185]" />,
  info: <Info size={18} className="text-[#7dd3fc]" />,
  warning: <AlertTriangle size={18} className="text-[#fbbf24]" />,
}

const styles = {
  success: 'border-[#34d399]/30 shadow-[#34d399]/10',
  error: 'border-[#fb7185]/30 shadow-[#fb7185]/10',
  info: 'border-[#7dd3fc]/30 shadow-[#7dd3fc]/10',
  warning: 'border-[#fbbf24]/30 shadow-[#fbbf24]/10',
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-80">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            className={cn(
              'flex items-start gap-3 p-4 rounded-xl border',
              'bg-[#0c1526]/95 backdrop-blur-sm shadow-xl',
              styles[t.type]
            )}
          >
            <span className="mt-0.5 shrink-0">{icons[t.type]}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#eaf2fb]">{t.title}</p>
              {t.message && <p className="text-xs text-[#7a96b4] mt-0.5">{t.message}</p>}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-[#7a96b4] hover:text-[#eaf2fb] transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
