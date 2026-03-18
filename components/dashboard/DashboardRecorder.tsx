"use client"

import { AlertCircle, CheckCircle2, Info, Zap } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState, useTransition } from "react"

import {
  createTaskFromAudioAction,
  type CreateTaskFromAudioState,
} from "@/actions/tasks/create-task-from-audio-action"
import { RecordButton } from "@/components/dashboard/RecordButton"
import { useToast } from "@/components/ui/toast"
import { AUDIO_MAX_DURATION_SECONDS, AUDIO_MAX_SIZE_BYTES } from "@/lib/audio-limits"

const initialState: CreateTaskFromAudioState = {
  error: null,
  success: false,
  warning: null,
}

interface DashboardRecorderProps {
  onCreated?: () => void
  /** Créditos actuales del usuario; se actualiza tras cada grabación exitosa */
  initialCredits: number
}

type FeedbackKind = "success" | "warning" | "error"

type RecorderFeedback = {
  kind: FeedbackKind
  title: string
  message: string
}

function classifyError(message: string): RecorderFeedback {
  const normalized = message.toLowerCase()

  if (normalized.includes("créditos") || normalized.includes("creditos") || normalized.includes("límite de tickets")) {
    return {
      kind: "error",
      title: "Sin créditos disponibles",
      message,
    }
  }

  if (normalized.includes("supera el límite") || normalized.includes("tamaño") || normalized.includes("segundos")) {
    return {
      kind: "error",
      title: "Audio demasiado largo o pesado",
      message,
    }
  }

  if (normalized.includes("bucket") || normalized.includes("storage") || normalized.includes("subir el audio")) {
    return {
      kind: "error",
      title: "Error de almacenamiento",
      message: "No se pudo subir el audio a Supabase Storage. Verifica bucket, permisos y claves.",
    }
  }

  if (normalized.includes("sesión") || normalized.includes("inicia sesión")) {
    return {
      kind: "error",
      title: "Sesión inválida",
      message: "Tu sesión expiró. Vuelve a iniciar sesión para continuar.",
    }
  }

  if (normalized.includes("audio inválido")) {
    return {
      kind: "error",
      title: "Audio inválido",
      message: "No se detectó audio válido. Intenta grabar nuevamente.",
    }
  }

  return {
    kind: "error",
    title: "Error al procesar audio",
    message,
  }
}

function classifyWarning(message: string): RecorderFeedback {
  const normalized = message.toLowerCase()

  if (normalized.includes("gemini") || normalized.includes("cuota") || normalized.includes("api key")) {
    return {
      kind: "warning",
      title: "Procesado parcial por IA",
      message: "Gemini no respondió en este intento. Se creó un task fallback para que no pierdas la nota.",
    }
  }

  return {
    kind: "warning",
    title: "Task creado con advertencia",
    message,
  }
}

export function DashboardRecorder({ onCreated, initialCredits }: DashboardRecorderProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { pushToast, pushError } = useToast()
  const [feedback, setFeedback] = useState<RecorderFeedback | null>(null)
  const [credits, setCredits] = useState(initialCredits)

  const feedbackStyles = useMemo(() => {
    if (!feedback) {
      return ""
    }

    if (feedback.kind === "error") {
      return "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-200"
    }

    if (feedback.kind === "warning") {
      return "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-200"
    }

    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
  }, [feedback])

  const creditsColor = credits <= 2
    ? "text-red-500 dark:text-red-400"
    : credits <= 5
      ? "text-amber-500 dark:text-amber-400"
      : "text-emerald-600 dark:text-emerald-400"

  const handleRecorded = (audioBlob: Blob, durationSeconds: number) => {
    startTransition(async () => {
      setFeedback(null)

      const extension = audioBlob.type.includes("mp4") ? "mp4" : "webm"
      const audioFile = new File([audioBlob], `note-${Date.now()}.${extension}`, {
        type: audioBlob.type || "audio/webm",
      })

      const formData = new FormData()
      formData.append("audio", audioFile)
      formData.append("duration", String(durationSeconds))

      const result = await createTaskFromAudioAction(initialState, formData)

      if (result.error) {
        const uiError = classifyError(result.error)
        setFeedback(uiError)
        pushError(result.error, "No se pudo procesar el audio")
        return
      }

      // Actualizar créditos localmente si el servidor los devuelve
      if (typeof result.creditsLeft === "number") {
        setCredits(result.creditsLeft)
      }

      if (result.warning) {
        const uiWarning = classifyWarning(result.warning)
        setFeedback(uiWarning)
        pushToast(uiWarning.message, "warning")
      } else {
        setFeedback({
          kind: "success",
          title: "Task creado correctamente",
          message: "Audio procesado y ticket guardado en el dashboard.",
        })
        pushToast("Audio procesado con Gemini. Task creado correctamente.")
      }
      onCreated?.()
      router.refresh()
    })
  }

  const isOutOfCredits = credits <= 0

  return (
    <div className="space-y-3">
      {/* Indicador de créditos */}
      <div className="flex items-center justify-center gap-1.5 text-sm">
        <Zap className={`size-4 ${creditsColor}`} />
        <span className={`font-medium ${creditsColor}`}>{credits}</span>
        <span className="text-muted-foreground">
          {credits === 1 ? "crédito disponible" : "créditos disponibles"}
        </span>
        <span className="text-muted-foreground/60 text-xs ml-1">
          · máx. {AUDIO_MAX_DURATION_SECONDS}s / {AUDIO_MAX_SIZE_BYTES / (1024 * 1024)}MB por nota
        </span>
      </div>

      <RecordButton
        onRecorded={handleRecorded}
        disabled={isPending || isOutOfCredits}
        maxDurationSeconds={AUDIO_MAX_DURATION_SECONDS}
      />

      {isPending ? <p className="text-center text-sm text-muted-foreground">Subiendo audio...</p> : null}

      {isOutOfCredits && !feedback ? (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-200" role="alert">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 size-4" />
            <div>
              <p className="font-semibold">Sin créditos disponibles</p>
              <p>Has alcanzado el límite de tickets en tu plan gratuito.</p>
            </div>
          </div>
        </div>
      ) : null}

      {feedback ? (
        <div className={`rounded-md border px-4 py-3 text-sm ${feedbackStyles}`} role="status" aria-live="polite">
          <div className="flex items-start gap-2">
            {feedback.kind === "error" ? (
              <AlertCircle className="mt-0.5 size-4" />
            ) : feedback.kind === "warning" ? (
              <Info className="mt-0.5 size-4" />
            ) : (
              <CheckCircle2 className="mt-0.5 size-4" />
            )}
            <div>
              <p className="font-semibold">{feedback.title}</p>
              <p>{feedback.message}</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
