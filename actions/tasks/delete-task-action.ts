"use server"

import { revalidatePath } from "next/cache"

import { db } from "@/lib/db"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { getCurrentLocalUserId, parseStorageUrl, toUserFriendlyError } from "./task-utils"

export type TaskActionResult = {
  ok: boolean
  error?: string
}

export async function deleteTaskAction(taskId: string): Promise<TaskActionResult> {
  try {
    const localUserId = await getCurrentLocalUserId()

    if (!localUserId) {
      return { ok: false, error: "Sesión inválida" }
    }

    const task = await db.task.findFirst({
      where: {
        id: taskId,
        userId: localUserId,
      },
      select: {
        id: true,
        audioUrl: true,
      },
    })

    if (!task) {
      return { ok: false, error: "Task no encontrada" }
    }

    if (task.audioUrl?.startsWith("sb://")) {
      const parsed = parseStorageUrl(task.audioUrl)
      if (parsed) {
        await supabaseAdmin.storage.from(parsed.bucket).remove([parsed.path])
      }
    }

    await db.task.delete({ where: { id: task.id } })

    revalidatePath("/dashboard")
    return { ok: true }
  } catch (error) {
    return { ok: false, error: toUserFriendlyError(error) }
  }
}
