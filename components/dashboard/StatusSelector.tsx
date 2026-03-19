"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"

import { updateTaskStatusAction } from "@/actions/tasks/update-task-status-action"
import { useToast } from "@/components/ui/toast"
import { type TaskStatus } from "@/lib/task-enums"

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "PENDING", label: "Pendiente" },
  { value: "IN_PROGRESS", label: "En progreso" },
  { value: "COMPLETED", label: "Completado" },
  { value: "ARCHIVED", label: "Archivado" },
]

interface StatusSelectorProps {
  taskId: string
  currentStatus: TaskStatus
}

export function StatusSelector({ taskId, currentStatus }: StatusSelectorProps) {
  const [isPending, startTransition] = useTransition()
  const { pushToast, pushError } = useToast()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as TaskStatus
    if (newStatus === currentStatus) return

    startTransition(async () => {
      const result = await updateTaskStatusAction(taskId, newStatus)
      if (!result.ok) {
        pushError(result.error ?? "Error", "No se pudo cambiar el estado")
        return
      }
      pushToast("Estado actualizado")
      router.refresh()
    })
  }

  return (
    <div className="grid gap-1.5">
      <label
        htmlFor={`status-${taskId}`}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Estado
      </label>
      <select
        id={`status-${taskId}`}
        value={currentStatus}
        onChange={handleChange}
        disabled={isPending}
        aria-label="Cambiar estado del ticket"
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      >
        {STATUS_OPTIONS.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      {isPending && <p className="text-xs text-muted-foreground">Guardando...</p>}
    </div>
  )
}
