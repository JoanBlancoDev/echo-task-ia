"use client"

import { ToastProvider } from "@/components/ui/toast"
import { ThemeProvider } from "./ThemeProvider"
import { SidebarProvider } from "../ui/sidebar"



type AppProvidersProps = {
  children: React.ReactNode
  isAuthenticated: boolean
}

export function AppProviders({ children, isAuthenticated: _isAuthenticated }: AppProvidersProps) {
  void _isAuthenticated


  return (
    <ThemeProvider attribute={'class'} defaultTheme="system" enableSystem disableTransitionOnChange>
      <ToastProvider>
        <SidebarProvider className="block w-full min-h-screen">
          {children}
        </SidebarProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
