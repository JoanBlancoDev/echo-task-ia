"use server"

import { Status } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { db } from "@/lib/db"
import { getCurrentLocalUserId, toUserFriendlyError } from "./task-utils"

export type TaskActionResult = {
  ok: boolean
  error?: string
}

const updateStatusSchema = z.object({
  status: z.nativeEnum(Status),
})

export async function updateTaskStatusAction(
  taskId: string,
  status: Status
): Promise<TaskActionResult> {
  try {
    const localUserId = await getCurrentLocalUserId()
    if (!localUserId) return { ok: false, error: "Sesión inválida" }

    const parsed = updateStatusSchema.safeParse({ status })
    if (!parsed.success) return { ok: false, error: "Estado inválido" }

    const existing = await db.task.findFirst({
      where: { id: taskId, userId: localUserId },
      select: { id: true },
    })
    if (!existing) return { ok: false, error: "Task no encontrada o sin permiso" }

    await db.task.update({
      where: { id: taskId },
      data: { status: parsed.data.status },
    })

    revalidatePath("/dashboard")
    revalidatePath(`/dashboard/tasks/${taskId}`)
    return { ok: true }
  } catch (error) {
    return { ok: false, error: toUserFriendlyError(error) }
  }
}
