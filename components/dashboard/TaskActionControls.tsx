"use client"

import { Status } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { deleteTaskAction } from "@/actions/tasks/delete-task-action"
import { reprocessTaskAction } from "@/actions/tasks/reprocess-task-action"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"

interface TaskActionControlsProps {
  taskId: string
  status: Status
  layout?: "grid" | "inline"
  redirectOnDeleteTo?: string
}

export function TaskActionControls({
  taskId,
  status,
  layout = "grid",
  redirectOnDeleteTo,
}: TaskActionControlsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const { pushToast, pushError } = useToast()

  const handleReprocess = () => {
    startTransition(async () => {
      const result = await reprocessTaskAction(taskId)
      if (!result.ok) {
        pushError(result.error, "No se pudo reprocesar")
        return
      }

      pushToast("Task reprocesado con Gemini")
      router.refresh()
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteTaskAction(taskId)
      if (!result.ok) {
        pushError(result.error, "No se pudo eliminar")
        return
      }

      setIsDeleteModalOpen(false)
      pushToast("Task eliminada correctamente")
      if (redirectOnDeleteTo) {
        router.push(redirectOnDeleteTo)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <>
      <div className={layout === "grid" ? "grid grid-cols-2 gap-2" : "grid grid-cols-1 gap-2 sm:grid-cols-2"}>
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          disabled={status !== "PENDING" || isPending}
          onClick={handleReprocess}
        >
          Reprocesar
        </Button>
        <Button
          type="button"
          variant="destructive"
          className="w-full"
          disabled={isPending}
          onClick={() => setIsDeleteModalOpen(true)}
        >
          Eliminar
        </Button>
      </div>

      {isDeleteModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border bg-card p-5 shadow-xl">
            <h3 className="text-base font-semibold">Confirmar eliminación</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Esta acción eliminará la task y su audio asociado. No se puede deshacer.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)} disabled={isPending}>
                Cancelar
              </Button>
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={isPending}>
                Confirmar eliminar
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
