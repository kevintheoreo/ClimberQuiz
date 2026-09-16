export interface ChallengePayload {
  archetypeId: string
  name?: string
}

/** Unlikely to appear in an archetype id or a display name. */
const SEPARATOR = '~'

/** Encodes a challenge payload into a URL-safe, unpadded base64 string. */
export function encodeChallenge(payload: ChallengePayload): string {
  const name = payload.name?.trim().replace(new RegExp(SEPARATOR, 'g'), '')
  const raw = name ? `${payload.archetypeId}${SEPARATOR}${name}` : payload.archetypeId
  return toBase64Url(raw)
}

/** Inverse of encodeChallenge. Returns null for malformed/undecodable codes. */
export function decodeChallenge(code: string): ChallengePayload | null {
  try {
    const raw = fromBase64Url(code)
    const [archetypeId, name] = raw.split(SEPARATOR)
    if (!archetypeId) return null
    return name ? { archetypeId, name } : { archetypeId }
  } catch {
    return null
  }
}

export function buildChallengeUrl(payload: ChallengePayload, origin = window.location.origin): string {
  return `${origin}/challenge/${encodeChallenge(payload)}`
}

function toBase64Url(value: string): string {
  const utf8Bytes = encodeURIComponent(value).replace(/%([0-9A-F]{2})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16)),
  )
  return btoa(utf8Bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(value: string): string {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/')
  const base64 = padded + '='.repeat((4 - (padded.length % 4)) % 4)
  const binary = atob(base64)
  const percentEncoded = Array.from(binary, (char) => '%' + char.charCodeAt(0).toString(16).padStart(2, '0')).join('')
  return decodeURIComponent(percentEncoded)
}
