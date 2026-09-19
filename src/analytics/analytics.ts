import posthog from 'posthog-js'

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined
const POSTHOG_HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? 'https://us.i.posthog.com'

let enabled = false

/**
 * No-ops when VITE_POSTHOG_KEY isn't set (local dev without a key, or a fork
 * that hasn't configured analytics) instead of throwing or silently sending
 * data to nowhere.
 */
export function initAnalytics(): void {
  if (!POSTHOG_KEY) {
    console.info('[analytics] VITE_POSTHOG_KEY not set — analytics disabled')
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
