import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { headers } from "next/headers"

type RateLimitConfig = {
  bucket: string
  limit: number
  window: `${number} ${"s" | "m" | "h" | "d"}`
  identifier: string
}

type RateLimitResult = {
  success: boolean
  limit: number
  remaining: number
  reset: number
  pending: Promise<unknown>
}

const redisUrl = process.env.UPSTASH_REDIS_REST_URL?.trim()
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
const rateLimitPrefix = process.env.RATE_LIMIT_PREFIX?.trim() || "echotask"

const redis =
  redisUrl && redisToken
    ? new Redis({
        url: redisUrl,
        token: redisToken,
      })
    : null

const limiters = new Map<string, Ratelimit>()

function getLimiter(limit: number, window: `${number} ${"s" | "m" | "h" | "d"}`) {
  const key = `${limit}:${window}`
  const existing = limiters.get(key)

  if (existing) {
    return existing
  }

  const limiter = new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(limit, window),
    analytics: true,
    prefix: `${rateLimitPrefix}:rl`,
  })

  limiters.set(key, limiter)
  return limiter
}

function createAllowedResult(limit: number): RateLimitResult {
  return {
    success: true,
    limit,
    remaining: limit,
    reset: Date.now(),
    pending: Promise.resolve(),
  }
}

export async function checkRateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
  if (!redis) {
    return createAllowedResult(config.limit)
  }

  try {
    const limiter = getLimiter(config.limit, config.window)
    return await limiter.limit(`${config.bucket}:${config.identifier}`)
  } catch {
    // Fail-open para no romper autenticación/creación de tasks por caída temporal de Redis
    return createAllowedResult(config.limit)
  }
}

export async function getRequestIp() {
  const headerList = await headers()
  const forwardedFor = headerList.get("x-forwarded-for")

  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim()
    if (firstIp) {
      return firstIp
    }
  }

  return (
    headerList.get("cf-connecting-ip") ||
    headerList.get("x-real-ip") ||
    headerList.get("x-vercel-forwarded-for") ||
    "unknown-ip"
  )
}

export function getRateLimitErrorMessage(resetAtMs: number) {
  const secondsLeft = Math.max(1, Math.ceil((resetAtMs - Date.now()) / 1000))

  if (secondsLeft < 60) {
    return `Demasiadas solicitudes. Intenta de nuevo en ${secondsLeft}s.`
  }

  const minutesLeft = Math.ceil(secondsLeft / 60)
  return `Demasiadas solicitudes. Intenta de nuevo en ${minutesLeft} min.`
}
