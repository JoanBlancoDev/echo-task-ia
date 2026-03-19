"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Pencil, X } from "lucide-react"

import { updateTaskAction, type UpdateTaskInput } from "@/actions/tasks/update-task-action"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toast"
import { TASK_PRIORITIES, type TaskPriority } from "@/lib/task-enums"

const schema = z.object({
  title: z.string().trim().min(3, "Al menos 3 caracteres").max(120, "Máximo 120"),
  description: z.string().trim().min(10, "Al menos 10 caracteres").max(4000, "Máximo 4000"),
  priority: z.enum(TASK_PRIORITIES),
  category: z.enum(["Bug", "Feature", "Refactor", "Task"]),
})

interface EditTaskFormProps {
  taskId: string
  initialValues: UpdateTaskInput
}

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: "P2 · Normal",
  MEDIUM: "P1 · Importante",
  HIGH: "P0 · Alta",
  URGENT: "P0 · Urgente",
}

const CATEGORIES = ["Bug", "Feature", "Refactor", "Task"] as const

export function EditTaskForm({ taskId, initialValues }: EditTaskFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { pushToast, pushError } = useToast()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateTaskInput>({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
  })

  const onSubmit = (data: UpdateTaskInput) => {
    startTransition(async () => {
      const result = await updateTaskAction(taskId, data)
      if (!result.ok) {
        pushError(result.error ?? "Error desconocido", "No se pudo guardar")
        return
      }
      pushToast("Task actualizado correctamente")
      setIsOpen(false)
      router.refresh()
    })
  }

  const handleClose = () => {
    reset(initialValues)
    setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <Button
        type="button"
        variant="outline"
        className="w-full gap-2"
        onClick={() => setIsOpen(true)}
        aria-label="Editar ticket"
      >
        <Pencil className="size-4" />
        Editar ticket
      </Button>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-task-dialog-title"
    >
      <div className="w-full max-w-lg rounded-lg border bg-card p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <h2 id="edit-task-dialog-title" className="text-lg font-semibold">
            Editar ticket
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClose}
            aria-label="Cerrar editor"
          >
            <X className="size-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Título */}
          <div className="grid gap-1.5">
            <Label htmlFor="edit-title">Título</Label>
            <Input
              id="edit-title"
              {...register("title")}
              aria-invalid={!!errors.title}
              autoFocus
            />
            {errors.title && (
              <p className="text-xs text-red-500" role="alert">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Descripción */}
          <div className="grid gap-1.5">
            <Label htmlFor="edit-description">Descripción</Label>
            <textarea
              id="edit-description"
              {...register("description")}
              rows={5}
              aria-invalid={!!errors.description}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y min-h-[80px]"
            />
            {errors.description && (
              <p className="text-xs text-red-500" role="alert">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Prioridad */}
          <div className="grid gap-1.5">
            <Label htmlFor="edit-priority">Prioridad</Label>
            <select
              id="edit-priority"
              {...register("priority")}
              aria-invalid={!!errors.priority}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {TASK_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABELS[p]}
                </option>
              ))}
            </select>
          </div>

          {/* Categoría */}
          <div className="grid gap-1.5">
            <Label htmlFor="edit-category">Categoría</Label>
            <select
              id="edit-category"
              {...register("category")}
              aria-invalid={!!errors.category}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending || !isDirty}
              className="bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {isPending ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
