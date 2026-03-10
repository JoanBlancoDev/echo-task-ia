import Link from "next/link"

import { logoutAction } from "@/actions/auth/logout-action"
import { Button } from "@/components/ui/button"

interface DashboardTopBarProps {
  title: string
  subtitle?: string
  backHref?: string
  backLabel?: string
}

export function DashboardTopBar({
  title,
  subtitle,
  backHref,
  backLabel = "Volver",
}: DashboardTopBarProps) {
  return (
    <header className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>

      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        {backHref ? (
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href={backHref}>{backLabel}</Link>
          </Button>
        ) : null}

        <form action={logoutAction} className="w-full sm:w-auto">
          <Button type="submit" variant="ghost" className="w-full sm:w-auto">
            Cerrar sesión
          </Button>
        </form>
      </div>
    </header>
  )
}
