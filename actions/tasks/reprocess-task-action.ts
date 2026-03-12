"use server"

import { Status } from "@prisma/client"
import { revalidatePath } from "next/cache"

import { extractTaskFromAudioWithGemini } from "@/lib/ai/task-from-audio"
import { db } from "@/lib/db"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { getCurrentLocalUserId, parseStorageUrl, toUserFriendlyError } from "./task-utils"

export type TaskActionResult = {
  ok: boolean
  error?: string
}

export async function reprocessTaskAction(taskId: string): Promise<TaskActionResult> {
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

    if (!task || !task.audioUrl) {
      return { ok: false, error: "Task sin audio para reprocesar" }
    }

    const parsedUrl = parseStorageUrl(task.audioUrl)
    if (!parsedUrl) {
      return { ok: false, error: "Audio URL inválida" }
    }

    const { data, error } = await supabaseAdmin.storage.from(parsedUrl.bucket).download(parsedUrl.path)

    if (error || !data) {
      return { ok: false, error: "No se pudo descargar el audio desde storage" }
    }

    const mimeType = data.type || "audio/webm"
    const buffer = Buffer.from(await data.arrayBuffer())

    const extracted = await extractTaskFromAudioWithGemini({
      audioBuffer: buffer,
      mimeType,
    })

    await db.task.update({
      where: { id: task.id },
      data: {
        title: extracted.title,
        description: extracted.description,
        priority: extracted.priority,
        category: extracted.category,
        transcription: extracted.transcription,
        status: Status.COMPLETED,
      },
    })

    revalidatePath("/dashboard")
    revalidatePath(`/dashboard/tasks/${task.id}`)
    return { ok: true }
  } catch (error) {
    return { ok: false, error: toUserFriendlyError(error) }
  }
}
