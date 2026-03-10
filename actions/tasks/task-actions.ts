"use server"

import { Status } from "@prisma/client"
import { revalidatePath } from "next/cache"

import { extractTaskFromAudioWithGemini, mapGeminiErrorToUserMessage } from "@/lib/ai/task-from-audio"
import { db } from "@/lib/db"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export type TaskActionResult = {
  ok: boolean
  error?: string
}

function parseStorageUrl(audioUrl: string) {
  if (!audioUrl.startsWith("sb://")) {
    return null
  }

  const withoutScheme = audioUrl.replace("sb://", "")
  const [bucket, ...rest] = withoutScheme.split("/")
  const path = rest.join("/")

  if (!bucket || !path) {
    return null
  }

  return { bucket, path }
}

async function getCurrentLocalUserId() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.id) {
    return null
  }

  const localUser = await db.user.findUnique({
    where: { externalId: user.id },
    select: { id: true },
  })

  if (!localUser) {
    return null
  }

  return localUser.id
}

function toUserFriendlyError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  const normalized = message.toLowerCase()

  if (
    normalized.includes("gemini") ||
    normalized.includes("quota") ||
    normalized.includes("429") ||
    normalized.includes("api key") ||
    normalized.includes("permission")
  ) {
    return mapGeminiErrorToUserMessage(error)
  }

  if (normalized.includes("429") || normalized.includes("quota") || normalized.includes("too many requests")) {
    return "Gemini sin cuota por ahora. Intenta de nuevo en unos minutos."
  }

  return "No se pudo completar la acción. Intenta nuevamente."
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
