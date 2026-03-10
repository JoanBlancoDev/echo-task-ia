"use client"

import { Mic, Square } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface RecordButtonProps {
  onRecorded?: (audioBlob: Blob, durationSeconds: number) => void
  disabled?: boolean
}

function getSupportedMimeType() {
  if (typeof window === "undefined" || typeof MediaRecorder === "undefined") {
    return undefined
  }

  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"]
  return candidates.find((type) => MediaRecorder.isTypeSupported(type))
}

export function RecordButton({ onRecorded, disabled = false }: RecordButtonProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(true)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const startedAtRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  const handleStart = async () => {
    setErrorMessage(null)

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
        const durationMs = startedAtRef.current ? Date.now() - startedAtRef.current : 0
        const durationSeconds = Math.max(0, Math.round(durationMs / 1000))

        const audioBlob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        })

        onRecorded?.(audioBlob, durationSeconds)
        streamRef.current?.getTracks().forEach((track) => track.stop())
        streamRef.current = null
        startedAtRef.current = null
      }

      recorder.start()
      startedAtRef.current = Date.now()
      mediaRecorderRef.current = recorder
      setIsRecording(true)
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

  const handleToggleRecording = async () => {
    if (isRecording) {
      handleStop()
      return
    }

    await handleStart()
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Button
        type="button"
        size="lg"
        onClick={handleToggleRecording}
        disabled={!isSupported || disabled}
        className={cn(
          "h-16 min-w-52 rounded-full px-8 text-base font-semibold transition-all",
          isRecording
            ? "bg-destructive text-white hover:bg-destructive/90 shadow-lg shadow-destructive/25 animate-pulse"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
      >
        {isRecording ? <Square className="size-5" /> : <Mic className="size-5" />}
        {isRecording ? "Detener grabación" : "Iniciar grabación"}
      </Button>

      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
    </div>
  )
}
