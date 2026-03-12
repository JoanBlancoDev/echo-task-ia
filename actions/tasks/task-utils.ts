import { mapGeminiErrorToUserMessage } from "@/lib/ai/task-from-audio"
import { db } from "@/lib/db"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export function parseStorageUrl(audioUrl: string) {
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

export async function getCurrentLocalUserId() {
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

export function toUserFriendlyError(error: unknown) {
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
