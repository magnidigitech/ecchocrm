'use client'

import * as React from "react"
import { CheckCircle2, AlertCircle, X, Info } from "lucide-react"

export type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
  action?: {
    label: string
    onClick: () => void
  }
  duration?: number
}

export const useToast = () => {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const showToast = (message: string, type: ToastType = 'success', options?: { action?: { label: string, onClick: () => void }, duration?: number }) => {
    const id = Math.random().toString(36).substring(2, 9)
    const duration = options?.duration || 5000
    
    setToasts((prev) => [...prev, { id, message, type, action: options?.action, duration }])
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }

  return { toasts, showToast, hideToast: (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id)) }
}

export function ToastContainer({ toasts, hideToast }: { toasts: Toast[], hideToast: (id: string) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div 
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-4 px-5 py-4 rounded-2xl shadow-2xl border min-w-[350px] animate-in slide-in-from-right-full duration-300 ${
            toast.type === 'success' ? 'bg-white border-emerald-100 text-emerald-900' :
            toast.type === 'error' ? 'bg-white border-red-100 text-red-900' :
            'bg-white border-zinc-100 text-zinc-900'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />}
          {toast.type === 'info' && <Info className="h-5 w-5 text-zinc-600 shrink-0" />}
          
          <div className="flex-1 flex flex-col gap-1">
            <p className="text-sm font-black tracking-tight">{toast.message}</p>
            {toast.action && (
              <button 
                onClick={() => {
                  toast.action?.onClick()
                  hideToast(toast.id)
                }}
                className="text-[10px] font-black uppercase tracking-widest text-left mt-1 hover:underline underline-offset-4"
                style={{ color: 'var(--brand-primary)' }}
              >
                {toast.action.label}
              </button>
            )}
          </div>
          
          <button 
            onClick={() => hideToast(toast.id)}
            className="p-2 hover:bg-zinc-50 rounded-xl transition-colors text-zinc-400 border border-transparent hover:border-zinc-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
