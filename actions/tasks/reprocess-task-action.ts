"use server"

import { Status } from "@prisma/client"
import { revalidatePath } from "next/cache"

import { extractTaskFromAudioWithGemini } from "@/lib/ai/task-from-audio"
import { db } from "@/lib/db"
import { checkRateLimit, getRateLimitErrorMessage } from "@/lib/rate-limit"
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

    const reprocessRateLimit = await checkRateLimit({
      bucket: "reprocess-task",
      limit: 5,
      window: "1 m",
      identifier: localUserId,
    })

    if (!reprocessRateLimit.success) {
      return { ok: false, error: getRateLimitErrorMessage(reprocessRateLimit.reset) }
    }

    const task = await db.task.findFirst({
      where: {
        id: taskId,
        userId: localUserId,
      },
      select: {
        id: true,
        audioUrl: true,
        status: true,
      },
    })

    if (!task || !task.audioUrl) {
      return { ok: false, error: "Task sin audio para reprocesar" }
    }

    // Validación server-side: solo tasks PENDING pueden reprocesarse
    // (no confiar únicamente en el disabled del botón en UI)
    if (task.status !== "PENDING") {
      return { ok: false, error: "Solo las tasks pendientes pueden reprocesarse" }
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
