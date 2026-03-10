"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"

import {
  createTaskFromAudioAction,
  type CreateTaskFromAudioState,
} from "@/actions/tasks/create-task-from-audio-action"
import { RecordButton } from "@/components/dashboard/RecordButton"
import { useToast } from "@/components/ui/toast"

const initialState: CreateTaskFromAudioState = {
  error: null,
  success: false,
  warning: null,
}

interface DashboardRecorderProps {
  onCreated?: () => void
}

export function DashboardRecorder({ onCreated }: DashboardRecorderProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { pushToast, pushError } = useToast()

  const handleRecorded = (audioBlob: Blob, durationSeconds: number) => {
    startTransition(async () => {
      const extension = audioBlob.type.includes("mp4") ? "mp4" : "webm"
      const audioFile = new File([audioBlob], `note-${Date.now()}.${extension}`, {
        type: audioBlob.type || "audio/webm",
      })

      const formData = new FormData()
      formData.append("audio", audioFile)
      formData.append("duration", String(durationSeconds))

      const result = await createTaskFromAudioAction(initialState, formData)

      if (result.error) {
        pushError(result.error, "No se pudo procesar el audio")
        return
      }

      if (result.warning) {
        pushToast(result.warning)
      } else {
        pushToast("Audio procesado con Gemini. Task creado correctamente.")
      }
      onCreated?.()
      router.refresh()
    })
  }

  return (
    <div className="space-y-3">
      <RecordButton onRecorded={handleRecorded} disabled={isPending} />

      {isPending ? <p className="text-center text-sm text-muted-foreground">Subiendo audio...</p> : null}
    </div>
  )
}
