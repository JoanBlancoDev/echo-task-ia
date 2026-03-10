import { supabaseAdmin } from "@/lib/supabase/admin"

export function parseSbStorageUrl(storageUrl: string) {
  if (!storageUrl.startsWith("sb://")) {
    return null
  }

  const withoutScheme = storageUrl.replace("sb://", "")
  const [bucket, ...rest] = withoutScheme.split("/")
  const path = rest.join("/")

  if (!bucket || !path) {
    return null
  }

  return { bucket, path }
}

export async function createSignedStorageUrl(storageUrl: string, expiresInSeconds = 3600) {
  const parsed = parseSbStorageUrl(storageUrl)
  if (!parsed) {
    return null
  }

  const { data, error } = await supabaseAdmin.storage
    .from(parsed.bucket)
    .createSignedUrl(parsed.path, expiresInSeconds)

  if (error || !data?.signedUrl) {
    return null
  }

  return data.signedUrl
}
