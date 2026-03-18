import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Priority } from "@prisma/client"

import { DashboardRecorder } from "@/components/dashboard/DashboardRecorder"
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar"
import { TaskCard } from "@/components/dashboard/TaskCard"
import { Button } from "@/components/ui/button"
import { getDashboardTasks } from "@/actions/tasks/get-dashboard-tasks"

const priorityOrder: Record<Priority, number> = {
  URGENT: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
}

interface DashboardPageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1)

  const { tasks, credits, totalCount, totalPages } = await getDashboardTasks(page)
  const sortedTasks = [...tasks].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-10 md:px-8">
      <DashboardTopBar
        title="Dashboard"
        subtitle="Graba una nota de voz y visualiza los tickets procesados por prioridad."
      />

      <section>
        <DashboardRecorder initialCredits={credits} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-xl font-semibold">
            Tasks recientes
            {totalCount > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({totalCount} {totalCount === 1 ? "ticket" : "tickets"})
              </span>
            )}
          </h2>
        </div>

        {sortedTasks.length ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {sortedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  description={task.description}
                  category={task.category}
                  priority={task.priority}
                  status={task.status}
                  audioPlaybackUrl={task.audioPlaybackUrl}
                />
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <nav
                className="flex items-center justify-center gap-3 pt-2"
                aria-label="Paginación de tickets"
              >
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  aria-label="Página anterior"
                  className={page <= 1 ? "pointer-events-none opacity-40" : ""}
                >
                  <Link href={`/dashboard?page=${page - 1}`}>
                    <ChevronLeft className="size-4" />
                    Anterior
                  </Link>
                </Button>

                <span className="text-sm text-muted-foreground" aria-current="page">
                  Página {page} de {totalPages}
                </span>

                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  aria-label="Página siguiente"
                  className={page >= totalPages ? "pointer-events-none opacity-40" : ""}
                >
                  <Link href={`/dashboard?page=${page + 1}`}>
                    Siguiente
                    <ChevronRight className="size-4" />
                  </Link>
                </Button>
              </nav>
            )}
          </>
        ) : (
          <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            {page > 1
              ? "No hay tickets en esta página."
              : "Aún no tienes tickets. Graba una nota para generar el primero."}
          </p>
        )}
      </section>
    </main>
  )
}
