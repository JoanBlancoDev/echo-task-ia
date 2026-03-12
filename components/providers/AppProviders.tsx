"use client"

import { ToastProvider } from "@/components/ui/toast"
import { ThemeProvider } from "./ThemeProvider"

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (

    <ThemeProvider attribute={'class'} defaultTheme="system" enableSystem disableTransitionOnChange>
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  )
}
