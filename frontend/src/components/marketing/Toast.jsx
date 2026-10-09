/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

const ToastContext =
  globalThis.__shopsmartToastContext || (globalThis.__shopsmartToastContext = createContext(null))

const ICONS = {
  success: { Icon: CheckCircle2, style: 'text-emerald-500' },
  error: { Icon: AlertCircle, style: 'text-red-500' },
  info: { Icon: Info, style: 'text-violet-500' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const show = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id))
    }, 3500)
  }, [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[60] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => {
            const { Icon, style } = ICONS[toast.type] || ICONS.info
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40 }}
                className="pointer-events-auto flex items-start gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-xl"
              >
                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${style}`} />
                <p className="flex-1 text-sm font-medium text-slate-800">{toast.message}</p>
                <button
                  onClick={() => setToasts((t) => t.filter((x) => x.id !== toast.id))}
                  className="text-slate-400 hover:text-slate-700"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  const fallback = useCallback((message, type = 'info') => {
    const log = type === 'error' ? console.error : console.info
    log(`[toast:${type}] ${message}`)
  }, [])

  return { show: context || fallback }
}
