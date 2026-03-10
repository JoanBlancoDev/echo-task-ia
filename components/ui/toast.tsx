"use client"

import { createContext, useCallback, useContext, useMemo, useState } from "react"

import { cn } from "@/lib/utils"

type ToastVariant = "default" | "destructive" | "warning"

interface ToastItem {
  id: number
  message: string
  variant: ToastVariant
  closing?: boolean
}

interface ToastContextValue {
  pushToast: (message?: string | null, variant?: ToastVariant) => void
  pushError: (message?: string | null, fallback?: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const DEFAULT_MESSAGE_BY_VARIANT: Record<ToastVariant, string> = {
  default: "Acción completada.",
  destructive: "Ocurrió un error. Intenta nuevamente.",
  warning: "Revisa la información ingresada.",
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const pushToast = useCallback((message?: string | null, variant: ToastVariant = "default") => {
    const normalizedMessage = message?.trim() || DEFAULT_MESSAGE_BY_VARIANT[variant]
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setToasts((prev) => [...prev, { id, message: normalizedMessage, variant }])

    setTimeout(() => {
      setToasts((prev) => prev.map((toast) => (toast.id === id ? { ...toast, closing: true } : toast)))
    }, 3400)

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 3800)
  }, [])

  const pushError = useCallback(
    (message?: string | null, fallback?: string) => {
      pushToast(message?.trim() || fallback || DEFAULT_MESSAGE_BY_VARIANT.destructive, "destructive")
    },
    [pushToast]
  )

  const value = useMemo(
    () => ({
      pushToast,
      pushError,
    }),
    [pushError, pushToast]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} />
    </ToastContext.Provider>
  )
}

export function ToastViewport({ toasts }: { toasts: ToastItem[] }) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-100 flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto rounded-md border px-4 py-3 text-sm shadow-lg backdrop-blur transition-all duration-200",
            toast.closing ? "animate-out fade-out slide-out-to-right-4" : "animate-in fade-in slide-in-from-top-2",
            toast.variant === "destructive"
              ? "border-red-500/40 bg-red-500/10 text-red-100"
              : toast.variant === "warning"
                ? "border-amber-500/40 bg-amber-500/15 text-amber-100"
                : "border-border bg-card text-card-foreground"
          )}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast debe usarse dentro de ToastProvider")
  }

  return context
}
