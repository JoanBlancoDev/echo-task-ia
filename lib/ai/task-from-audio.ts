import { GoogleGenerativeAI } from "@google/generative-ai"
import { Priority } from "@prisma/client"
import { z } from "zod"

const aiResultSchema = z.object({
  title: z.string().min(4).max(120),
  description: z.string().min(20).max(4000),
  priority: z.nativeEnum(Priority),
  category: z.enum(["Bug", "Feature", "Refactor", "Task"]).default("Task"),
  transcription: z.string().min(1),
})

export type AiTaskResult = z.infer<typeof aiResultSchema>

function extractJson(raw: string) {
  const trimmed = raw.trim()
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed
  }

  const fenced = trimmed.match(/```json\s*([\s\S]*?)```/i)
  if (fenced?.[1]) {
    return fenced[1].trim()
  }

  const firstCurly = trimmed.indexOf("{")
  const lastCurly = trimmed.lastIndexOf("}")
  if (firstCurly !== -1 && lastCurly !== -1 && lastCurly > firstCurly) {
    return trimmed.slice(firstCurly, lastCurly + 1)
  }

  throw new Error("No se encontró JSON válido en la respuesta de Gemini")
}

function getGeminiApiKey() {
  const value = process.env.GEMINI_API_KEY
  if (!value) {
    throw new Error("Falta GEMINI_API_KEY en variables de entorno")
  }
  return value
}

function getCandidateModels() {
  const envModel = process.env.GEMINI_MODEL?.trim()

  return [
    envModel,
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash",
  ].filter((model): model is string => Boolean(model))
}

function isModelNotFoundError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  const normalized = message.toLowerCase()
  return normalized.includes("404") || normalized.includes("not found") || normalized.includes("is not found")
}

function isRetryableAcrossModelsError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  const normalized = message.toLowerCase()

  return (
    isModelNotFoundError(error) ||
    normalized.includes("429") ||
    normalized.includes("quota") ||
    normalized.includes("too many requests") ||
    normalized.includes("unsupported") ||
    normalized.includes("not supported")
  )
}

export function mapGeminiErrorToUserMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  const normalized = message.toLowerCase()

  if (normalized.includes("gemini_api_key") || normalized.includes("api key") || normalized.includes("unauthenticated")) {
    return "Gemini no está configurado correctamente. Revisa GEMINI_API_KEY."
  }

  if (normalized.includes("429") || normalized.includes("quota") || normalized.includes("too many requests")) {
    return "Gemini sin cuota por ahora. Activa billing o espera unos minutos para reintentar."
  }

  if (normalized.includes("permission") || normalized.includes("forbidden")) {
    return "Tu API key no tiene permisos para Gemini. Revisa proyecto y facturación."
  }

  if (normalized.includes("not found") || normalized.includes("is not found") || normalized.includes("404")) {
    return "El modelo de Gemini no está disponible en tu proyecto. Ajusta GEMINI_MODEL."
  }

  if (normalized.includes("mime") || normalized.includes("unsupported")) {
    return "Formato de audio no soportado por Gemini. Usa webm/mp3/mp4."
  }

  return "Gemini no pudo procesar el audio en este intento."
}

export async function extractTaskFromAudioWithGemini(input: {
  audioBuffer: Buffer
  mimeType: string
}): Promise<AiTaskResult> {
  const genAI = new GoogleGenerativeAI(getGeminiApiKey())

  const prompt = `
Eres un analista técnico que convierte notas de voz en tickets para desarrollo.

Devuelve SOLO JSON válido con este formato:
{
  "title": "string",
  "description": "string markdown",
  "priority": "LOW|MEDIUM|HIGH|URGENT",
  "category": "Bug|Feature|Refactor|Task",
  "transcription": "string"
}

Reglas:
- title: breve, claro y accionable.
- description: markdown técnico, con contexto y criterios de aceptación si aplica.
- priority: usa URGENT solo cuando sea crítico/bloqueante.
- category: escoger una sola.
- transcription: transcripción fiel del audio.
- No agregues texto fuera del JSON.
  `.trim()

  const candidateModels = getCandidateModels()
  let lastError: unknown = null

  for (const modelName of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      })

      const result = await model.generateContent([
        {
          text: prompt,
        },
        {
          inlineData: {
            mimeType: input.mimeType,
            data: input.audioBuffer.toString("base64"),
          },
        },
      ])

      const raw = result.response.text()
      const jsonText = extractJson(raw)
      const parsed = JSON.parse(jsonText)
      return aiResultSchema.parse(parsed)
    } catch (error) {
      lastError = error
      if (!isRetryableAcrossModelsError(error)) {
        throw error
      }
    }
  }

  const detail = lastError instanceof Error ? lastError.message : String(lastError)
  throw new Error(`No se encontró un modelo Gemini compatible. Probados: ${candidateModels.join(", ")}. Detalle: ${detail}`)
}
