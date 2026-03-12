import Link from "next/link"

import { logoutAction } from "@/actions/auth/logout-action"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "../dark-mode/ModeToggle"
import { ChevronLeft, LogOut } from "lucide-react"

interface DashboardTopBarProps {
  title: string
  subtitle?: string
  backHref?: string
  backLabel?: string,
  backIcon?: boolean
}

export function DashboardTopBar({
  title,
  subtitle,
  backHref,
  backLabel = "Volver",
  backIcon = true,
}: DashboardTopBarProps) {
  return (
    <header className="flex flex-col gap-8 justify-between rounded-xl border bg-background text-foreground p-4 sm:flex-row sm:items-center sm:justify-between  dark:border-zinc-700">
      <div className="space-y-1">
        <h1 className="text-2xl text-center md:text-left font-bold tracking-tight dark:text-zinc-100 text-zinc-800">{title}</h1>
        {subtitle ? <p className="text-sm text-muted-foreground dark:text-zinc-400">{subtitle}</p> : null}
      </div>

      <div className="flex flex-col md:flex-row flex-wrap gap-4 items-center">
        <ModeToggle btnClassName="w-full md:w-auto px-2 py-4"
        />
        {backHref ? (
          <Button asChild variant="outline" className="w-full md:w-auto px-2 py-4">
            <Link href={backHref}>
              {backIcon && (
                < ChevronLeft />
              )}
              {backLabel}
            </Link>
          </Button>
        ) : null}
      </div>
      <div className="flex w-full flex-col gap-8 sm:w-auto sm:flex-row">

        <form action={logoutAction} className="w-full sm:w-auto">
          <Button type="submit" variant="outline" className="w-full sm:w-auto outline-2 outline-indigo-600 justify-center items-center">
            <LogOut />
            Cerrar sesión
          </Button>
        </form>
      </div>
    </header>
  )
}
