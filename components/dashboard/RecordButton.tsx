"use client"

import { Mic, Square } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface RecordButtonProps {
  onRecorded?: (audioBlob: Blob, durationSeconds: number) => void
  disabled?: boolean
  /** Si se pasa, la grabación se detiene automáticamente al llegar a este límite (en segundos) */
  maxDurationSeconds?: number
}

function getSupportedMimeType() {
  if (typeof window === "undefined" || typeof MediaRecorder === "undefined") {
    return undefined
  }

  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"]
  return candidates.find((type) => MediaRecorder.isTypeSupported(type))
}

export function RecordButton({ onRecorded, disabled = false, maxDurationSeconds }: RecordButtonProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(true)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const startedAtRef = useRef<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const autoStopRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop())
      if (timerRef.current) clearInterval(timerRef.current)
      if (autoStopRef.current) clearTimeout(autoStopRef.current)
    }
  }, [])

  const stopTimers = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (autoStopRef.current) {
      clearTimeout(autoStopRef.current)
      autoStopRef.current = null
    }
  }

  const handleStart = async () => {
    setErrorMessage(null)
    setElapsedSeconds(0)

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setIsSupported(false)
      setErrorMessage("Este navegador no soporta grabación de audio.")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mimeType = getSupportedMimeType()
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)

      chunksRef.current = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      recorder.onstop = () => {
        stopTimers()
        const durationMs = startedAtRef.current ? Date.now() - startedAtRef.current : 0
        const durationSeconds = Math.max(0, Math.round(durationMs / 1000))

        const audioBlob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        })

        onRecorded?.(audioBlob, durationSeconds)
        streamRef.current?.getTracks().forEach((track) => track.stop())
        streamRef.current = null
        startedAtRef.current = null
        setElapsedSeconds(0)
      }

      recorder.start()
      startedAtRef.current = Date.now()
      mediaRecorderRef.current = recorder
      setIsRecording(true)

      // Temporizador de UI: actualiza cada segundo
      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1)
      }, 1000)

      // Auto-stop al alcanzar el límite de duración
      if (maxDurationSeconds && maxDurationSeconds > 0) {
        autoStopRef.current = setTimeout(() => {
          const rec = mediaRecorderRef.current
          if (rec && rec.state !== "inactive") {
            rec.stop()
            setIsRecording(false)
          }
        }, maxDurationSeconds * 1000)
      }
    } catch {
      setErrorMessage("No se pudo acceder al micrófono. Revisa permisos del navegador.")
    }
  }

  const handleStop = () => {
    const recorder = mediaRecorderRef.current
    if (!recorder || recorder.state === "inactive") {
      return
    }
    recorder.stop()
    setIsRecording(false)
  }

  const handleCancel = () => {
    stopTimers()
    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state !== "inactive") {
      recorder.ondataavailable = null
      recorder.onstop = null
      recorder.stop()
    }
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    startedAtRef.current = null
    chunksRef.current = []
    setIsRecording(false)
    setElapsedSeconds(0)
    setErrorMessage(null)
  }

  const handleToggleRecording = async () => {
    if (isRecording) {
      handleStop()
      return
    }
    await handleStart()
  }

  /** Formatea segundos como MM:SS */
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  }

  const isNearLimit =
    maxDurationSeconds !== undefined && elapsedSeconds >= maxDurationSeconds - 10 && isRecording

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-3">
        <Button
          type="button"
          size="lg"
          onClick={handleToggleRecording}
          disabled={!isSupported || disabled}
          aria-label={isRecording ? "Detener grabación" : "Iniciar grabación de audio"}
          aria-pressed={isRecording}
          className={cn(
            "h-16 min-w-52 rounded-full px-8 text-base font-semibold transition-all bg-indigo-600 text-white hover:bg-indigo-700",
            isRecording
              ? "bg-indigo-600/50 text-white hover:bg-indigo-600/90 shadow-lg shadow-destructive/25 animate-pulse"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          )}
        >
          {isRecording ? <Square className="size-5" /> : <Mic className="size-5" />}
          {isRecording ? "Grabando" : "Iniciar grabación"}
        </Button>
        {isRecording && (
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={handleCancel}
            className="h-16 rounded-full px-6 text-base font-semibold"
          >
            Cancelar
          </Button>
        )}
      </div>

      {isRecording && (
        <div className="flex flex-col items-center gap-0.5">
          <span
            aria-live="polite"
            aria-label={`Tiempo grabado: ${formatTime(elapsedSeconds)}`}
            className={cn(
              "text-sm font-mono font-medium",
              isNearLimit ? "text-red-500 dark:text-red-400" : "text-muted-foreground"
            )}
          >
            {formatTime(elapsedSeconds)}
            {maxDurationSeconds ? ` / ${formatTime(maxDurationSeconds)}` : ""}
          </span>
          {isNearLimit && (
            <span className="text-xs text-red-500 dark:text-red-400">
              Límite alcanzado, deteniéndose pronto…
            </span>
          )}
        </div>
      )}

      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
    </div>
  )
}
