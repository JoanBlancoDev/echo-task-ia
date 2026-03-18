/**
 * Límites globales para los audios aceptados por EchoTask AI.
 * Modifica estos valores aquí; el resto del código los importa.
 */

/** Tamaño máximo permitido de un archivo de audio (en bytes). Default: 10 MB */
export const AUDIO_MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

/** Duración máxima de un audio (en segundos). Default: 120 s */
export const AUDIO_MAX_DURATION_SECONDS = 120

/** Mensaje de error legible cuando el audio supera el tamaño máximo */
export const AUDIO_SIZE_ERROR = `El audio supera el límite permitido de ${AUDIO_MAX_SIZE_BYTES / (1024 * 1024)} MB. Graba una nota más corta.`

/** Mensaje de error legible cuando el audio supera la duración máxima */
export const AUDIO_DURATION_ERROR = `El audio supera el límite de ${AUDIO_MAX_DURATION_SECONDS} segundos (${AUDIO_MAX_DURATION_SECONDS / 60} min). Graba una nota más corta.`

/**
 * Valida que un archivo de audio cumpla los límites de tamaño y duración.
 * Retorna `null` si es válido, o un string con el mensaje de error.
 */
export function validateAudioLimits(file: File, durationSeconds: number): string | null {
  if (file.size > AUDIO_MAX_SIZE_BYTES) {
    return AUDIO_SIZE_ERROR
  }

  if (Number.isFinite(durationSeconds) && durationSeconds > AUDIO_MAX_DURATION_SECONDS) {
    return AUDIO_DURATION_ERROR
  }

  return null
}
