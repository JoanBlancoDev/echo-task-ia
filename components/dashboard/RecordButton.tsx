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

  // Nueva función para cancelar la grabación y descartar el audio
  const handleCancel = () => {
    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state !== "inactive") {
      recorder.ondataavailable = null // Evita que se acumulen blobs
      recorder.onstop = null
      recorder.stop()
    }
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    startedAtRef.current = null
    chunksRef.current = []
    setIsRecording(false)
    setErrorMessage(null)
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
      <div className="flex gap-3">
        <Button
          type="button"
          size="lg"
          onClick={handleToggleRecording}
          disabled={!isSupported || disabled}
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
      {isRecording && <span className="text-xs text-muted-foreground">Grabando...</span>}
      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
    </div>
  )
}
