import posthog from 'posthog-js'

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined
const POSTHOG_HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? 'https://us.i.posthog.com'

// Only the real production domain should ever send events — local dev,
// PR preview deploys, and any other host stay silent even if a PostHog key
// happens to be present in that environment, so testing never pollutes
// production metrics.
const PRODUCTION_HOSTNAMES = ['climbertype.vercel.app']

let enabled = false

function isProductionHost(): boolean {
  return typeof window !== 'undefined' && PRODUCTION_HOSTNAMES.includes(window.location.hostname)
}

/**
 * No-ops when VITE_POSTHOG_KEY isn't set (local dev without a key, or a fork
 * that hasn't configured analytics), or when running on any hostname other
 * than the production domain, instead of throwing or silently sending data
 * to nowhere — or worse, mixing test traffic into real metrics.
 */
export function initAnalytics(): void {
  if (!POSTHOG_KEY) {
    console.info('[analytics] VITE_POSTHOG_KEY not set — analytics disabled')
    return
  }

  if (!isProductionHost()) {
    console.info('[analytics] non-production host — analytics disabled')
    return
  }

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: 'identified_only',
    capture_pageview: false,
    disable_session_recording: true,
    respect_dnt: true,
  })
  enabled = true
}

export function trackEvent(name: string, properties?: Record<string, unknown>): void {
  if (!enabled) return
  posthog.capture(name, properties)
}
