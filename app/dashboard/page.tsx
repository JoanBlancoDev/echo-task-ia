import { Priority } from "@prisma/client"

import { DashboardRecorder } from "@/components/dashboard/DashboardRecorder"
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar"
import { TaskCard } from "@/components/dashboard/TaskCard"
import { getDashboardTasks } from "@/actions/tasks/get-dashboard-tasks"


const priorityOrder: Record<Priority, number> = {
  URGENT: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
}

export default async function DashboardPage() {
  const tasks = await getDashboardTasks()
  const sortedTasks = [...tasks].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-10 md:px-8">
      <DashboardTopBar
        title="Dashboard"
        subtitle="Graba una nota de voz y visualiza los tickets procesados por prioridad."
      />

      <section>
        <DashboardRecorder />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Tasks recientes</h2>
        </div>

        {sortedTasks.length ? (
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
        ) : (
          <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            Aún no tienes tickets. Graba una nota para generar el primero.
          </p>
        )}
      </section>
    </main>
  )
}
