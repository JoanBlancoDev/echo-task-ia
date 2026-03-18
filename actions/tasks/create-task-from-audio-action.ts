"use server"

import { Priority, Status } from "@prisma/client"

import { extractTaskFromAudioWithGemini, mapGeminiErrorToUserMessage } from "@/lib/ai/task-from-audio"
import { validateAudioLimits } from "@/lib/audio-limits"
import { db } from "@/lib/db"
import { checkRateLimit, getRateLimitErrorMessage } from "@/lib/rate-limit"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export type CreateTaskFromAudioState = {
  error: string | null
  success: boolean
  taskId?: string
  warning?: string | null
  /** Créditos restantes del usuario tras la operación (solo presente en éxito) */
  creditsLeft?: number
}

const AUDIO_BUCKET = process.env.SUPABASE_STORAGE_BUCKET?.trim() || "task-audios"

const extByMimeType: Record<string, string> = {
  "audio/webm": "webm",
  "audio/webm;codecs=opus": "webm",
  "audio/mp4": "mp4",
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
}

function getFileExtension(mimeType: string) {
  return extByMimeType[mimeType] ?? "webm"
}

export async function createTaskFromAudioAction(
  _: CreateTaskFromAudioState,
  formData: FormData
): Promise<CreateTaskFromAudioState> {
  const audio = formData.get("audio")
  const durationRaw = formData.get("duration")
  const duration = Number(durationRaw)

  // ── 1. Validación básica del archivo ───────────────────────────────────────
  if (!(audio instanceof File) || audio.size === 0) {
    return { error: "Audio inválido", success: false, warning: null }
  }

  // ── 2. Validación de límites de tamaño y duración ──────────────────────────
  const limitError = validateAudioLimits(audio, duration)
  if (limitError) {
    return { error: limitError, success: false, warning: null }
  }

  // ── 3. Autenticación ───────────────────────────────────────────────────────
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user?.id || !user.email) {
    return { error: "Sesión inválida. Inicia sesión nuevamente.", success: false, warning: null }
  }

  const createTaskRateLimit = await checkRateLimit({
    bucket: "create-task",
    limit: 6,
    window: "1 m",
    identifier: user.id,
  })

  if (!createTaskRateLimit.success) {
    return {
      error: getRateLimitErrorMessage(createTaskRateLimit.reset),
      success: false,
      warning: null,
    }
  }

  // ── 4. Obtener / crear usuario local y verificar créditos ─────────────────
  const localUser = await db.user.upsert({
    where: { externalId: user.id },
    update: {
      email: user.email,
      name: user.user_metadata?.name ?? null,
      avatarUrl: user.user_metadata?.avatar_url ?? null,
    },
    create: {
      externalId: user.id,
      email: user.email,
      name: user.user_metadata?.name ?? null,
      avatarUrl: user.user_metadata?.avatar_url ?? null,
      // credits ya tiene @default(10) en el schema
    },
    select: { id: true, credits: true },
  })

  if (localUser.credits <= 0) {
    return {
      error: "Sin créditos disponibles. Has alcanzado el límite de tickets en tu plan gratuito.",
      success: false,
      warning: null,
    }
  }

  // ── 5. Subir audio a Supabase Storage ─────────────────────────────────────
  const extension = getFileExtension(audio.type)
  const filePath = `${localUser.id}/${crypto.randomUUID()}.${extension}`

  const buffer = Buffer.from(await audio.arrayBuffer())
  const { error: uploadError } = await supabaseAdmin.storage
    .from(AUDIO_BUCKET)
    .upload(filePath, buffer, {
      contentType: audio.type || "audio/webm",
      upsert: false,
    })

  if (uploadError) {
    return {
      error: "No se pudo subir el audio. Verifica que exista el bucket task-audios en Supabase.",
      success: false,
      warning: null,
    }
  }

  // ── 6. Procesar audio con Gemini ───────────────────────────────────────────
  let warning: string | null = null

  let aiData: {
    title: string
    description: string
    priority: Priority
    category: string
    transcription: string
  } | null = null

  try {
    const extracted = await extractTaskFromAudioWithGemini({
      audioBuffer: buffer,
      mimeType: audio.type || "audio/webm",
    })

    aiData = {
      title: extracted.title,
      description: extracted.description,
      priority: extracted.priority,
      category: extracted.category,
      transcription: extracted.transcription,
    }
  } catch (error) {
    const reason = mapGeminiErrorToUserMessage(error)
    warning = `${reason} Se creó el task base en modo fallback (Importante/Pendiente/Task).`
  }

  // ── 7. Guardar task y decrementar crédito en una transacción atómica ───────
  const [task, updatedUser] = await db.$transaction([
    db.task.create({
      data: {
        userId: localUser.id,
        title: aiData?.title ?? `Nota de voz ${new Date().toLocaleString("es-ES")}`,
        description:
          aiData?.description ??
          "Audio recibido correctamente. Pendiente de transcripción y estructuración con IA.",
        category: aiData?.category ?? "Task",
        priority: aiData?.priority ?? Priority.MEDIUM,
        status: aiData ? Status.COMPLETED : Status.PENDING,
        audioUrl: `sb://${AUDIO_BUCKET}/${filePath}`,
        transcription: aiData?.transcription ?? null,
        duration: Number.isFinite(duration) ? Math.max(0, Math.round(duration)) : null,
      },
      select: { id: true },
    }),
    db.user.update({
      where: { id: localUser.id },
      data: { credits: { decrement: 1 } },
      select: { credits: true },
    }),
  ])

  return {
    error: null,
    success: true,
    taskId: task.id,
    warning,
    creditsLeft: updatedUser.credits,
  }
}
