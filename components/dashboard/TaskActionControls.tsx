"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef, useState, useTransition } from "react"

import { deleteTaskAction } from "@/actions/tasks/delete-task-action"
import { reprocessTaskAction } from "@/actions/tasks/reprocess-task-action"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { type TaskStatus } from "@/lib/task-enums"

interface TaskActionControlsProps {
  taskId: string
  status: TaskStatus
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

  // Focus trap: referencia al primer botón enfocable del modal
  const cancelBtnRef = useRef<HTMLButtonElement>(null)
  const confirmBtnRef = useRef<HTMLButtonElement>(null)

  // Al abrir el modal, mover el foco al botón de cancelar
  useEffect(() => {
    if (isDeleteModalOpen) {
      cancelBtnRef.current?.focus()
    }
  }, [isDeleteModalOpen])

  // Focus trap: tab/shift-tab quedan dentro del modal
  const handleModalKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      setIsDeleteModalOpen(false)
      return
    }

    if (e.key !== "Tab") return

    const focusable = [cancelBtnRef.current, confirmBtnRef.current].filter(Boolean) as HTMLButtonElement[]
    if (focusable.length < 2) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault()
        last.focus()
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }

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
          aria-label={status !== "PENDING" ? "Reprocesar (solo disponible en tasks pendientes)" : "Reprocesar task con Gemini"}
        >
          {status === 'COMPLETED' ? 'Reprocesado' : 'Reprocesar'}
        </Button>
        <Button
          type="button"
          variant="destructive"
          className="w-full"
          disabled={isPending}
          onClick={() => setIsDeleteModalOpen(true)}
          aria-label="Eliminar task"
        >
          Eliminar
        </Button>
      </div>

      {isDeleteModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
          onKeyDown={handleModalKeyDown}
        >
          <div className="w-full max-w-md rounded-lg border bg-card p-5 shadow-xl">
            <h3 id="delete-dialog-title" className="text-base font-semibold">
              Confirmar eliminación
            </h3>
            <p id="delete-dialog-description" className="mt-2 text-sm text-muted-foreground">
              Esta acción eliminará la task y su audio asociado. No se puede deshacer.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <Button
                ref={cancelBtnRef}
                type="button"
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button
                ref={confirmBtnRef}
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isPending}
              >
                Confirmar eliminar
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
