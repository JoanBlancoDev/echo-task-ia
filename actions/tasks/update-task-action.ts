"use server"

import { Priority } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { db } from "@/lib/db"
import { getCurrentLocalUserId, toUserFriendlyError } from "./task-utils"

export type TaskActionResult = {
  ok: boolean
  error?: string
}

const updateTaskSchema = z.object({
  title: z.string().trim().min(3, "El título debe tener al menos 3 caracteres").max(120, "Máximo 120 caracteres"),
  description: z.string().trim().min(10, "La descripción debe tener al menos 10 caracteres").max(4000, "Máximo 4000 caracteres"),
  priority: z.nativeEnum(Priority),
  category: z.enum(["Bug", "Feature", "Refactor", "Task"]),
})

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>

export async function updateTaskAction(
  taskId: string,
  data: UpdateTaskInput
): Promise<TaskActionResult> {
  try {
    const localUserId = await getCurrentLocalUserId()

    if (!localUserId) {
      return { ok: false, error: "Sesión inválida" }
    }

    const parsed = updateTaskSchema.safeParse(data)
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" }
    }

    // Verificar que el task pertenece al usuario autenticado (autorización)
    const existing = await db.task.findFirst({
      where: { id: taskId, userId: localUserId },
      select: { id: true },
    })

    if (!existing) {
      return { ok: false, error: "Task no encontrada o sin permiso" }
    }

    await db.task.update({
      where: { id: taskId },
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        priority: parsed.data.priority,
        category: parsed.data.category,
      },
    })

    revalidatePath("/dashboard")
    revalidatePath(`/dashboard/tasks/${taskId}`)
    return { ok: true }
  } catch (error) {
    return { ok: false, error: toUserFriendlyError(error) }
  }
}
