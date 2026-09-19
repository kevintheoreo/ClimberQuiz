# Analytics

ClimberType uses [PostHog](https://posthog.com) (free tier, cloud-hosted) for
client-side event tracking. No backend or database is involved — see
[PRD.md](PRD.md) §14 for the original metrics spec this satisfies.

## Setup

1. Create a free PostHog account and project at posthog.com.
2. Copy your project's API key (Project Settings → Project API Key).
3. Copy [.env.example](.env.example) to `.env.local` and fill in:
   ```
   VITE_POSTHOG_KEY=phc_...
   VITE_POSTHOG_HOST=https://us.i.posthog.com
   ```
   (Use `https://eu.i.posthog.com` for `VITE_POSTHOG_HOST` if your project is
   in PostHog's EU region.)
4. Restart the dev server. Without a key set, analytics is a no-op (you'll
   see `[analytics] VITE_POSTHOG_KEY not set — analytics disabled` logged
   once) — the app never breaks or throws because a key is missing.

For a deployed build, set the same two env vars in your hosting provider's
environment configuration (Vercel/Netlify/Cloudflare Pages project settings,
etc.) — `.env.local` is git-ignored and never committed.

## How it's wired

All tracking goes through one module, `src/analytics/analytics.ts`:

- `initAnalytics()` — called once in `src/main.tsx` at startup. Initializes
  `posthog-js` with `capture_pageview: false` (this is a small SPA; page
  views aren't tracked automatically, only the explicit events below),
  `disable_session_recording: true`, and `respect_dnt: true`.
- `trackEvent(name, properties?)` — called from page components at the
  moment something happens. No-ops silently if `initAnalytics()` never
  enabled a real key.

Nothing else in the app imports `posthog-js` directly — if you ever swap
providers, `analytics.ts` is the only file that needs to change.

## Events

| Event | Fires when | Properties | Source |
|---|---|---|---|
| `quiz_started` | The quiz mounts — covers every entry point (landing page, a challenge link, a direct `/quiz` visit) | — | `src/quiz/useQuiz.ts` |
| `quiz_completed` | The last question is answered and "See Results" is clicked | — | `src/pages/QuizPage.tsx` |
| `result_viewed` | The result page renders with a real result | `archetype_id`, `archetype_name`, `rarity`, `aura` | `src/pages/ResultPage.tsx` |
| `share_image_clicked` | "Share Image" is clicked (before the PNG export runs) | `archetype_id` | `src/pages/ResultPage.tsx` |
| `challenge_link_copied` | "Copy Link" is clicked | `archetype_id`, `has_name` | `src/pages/ResultPage.tsx` |
| `retake_quiz_clicked` | "Retake Quiz" is clicked | `archetype_id` | `src/pages/ResultPage.tsx` |
| `accuracy_feedback_submitted` | 🔥 / 😐 / 🤨 is clicked | `archetype_id`, `feedback` (`accurate` \| `kinda` \| `not-me`) | `src/pages/ResultPage.tsx` |
| `challenge_viewed` | Someone opens a `/challenge/:code` link | `archetype_id`, `has_name` | `src/pages/ChallengePage.tsx` |

This set maps directly onto the PRD's metrics: quiz starts (`quiz_started`),
completion rate (`quiz_completed` ÷ `quiz_started`), result-type distribution
(`result_viewed` grouped by `archetype_id`), share/download clicks
(`share_image_clicked`), referral-loop effectiveness (`challenge_viewed`),
repeat-attempt rate (`retake_quiz_clicked`), and accuracy-feedback
distribution (`accuracy_feedback_submitted` grouped by `feedback`).

## Next steps

- **Verify events are actually arriving.** Set a real key, run through the
  app once, and check PostHog's "Activity" tab live-tails the events above
  before trusting any dashboard built on top of them.
- **Build the funnel.** PostHog's Funnels feature maps directly onto the
  PRD's core loop: `quiz_started` → `quiz_completed` → `result_viewed` →
  (`share_image_clicked` or `challenge_link_copied`). That funnel is the
  single most useful view for judging whether the viral loop works at all.
- **Break down `result_viewed` by `archetype_id`.** This is the "is the
  scoring distribution reasonably balanced across archetypes" check called
  for in the PRD — if one or two archetypes dominate, that's a scoring
  rebalance, not a marketing problem.
- **Per-question drop-off isn't tracked yet.** Right now there's no signal
  for *where* someone abandons the quiz if they leave before finishing —
  only `quiz_started` vs `quiz_completed` as a whole. If completion rate
  turns out low, add a `question_answered` event with a `question_index`
  property in `useQuiz.ts`'s `selectAnswer` to see which question loses
  people.
- **Cookie/consent banner.** PostHog sets a `distinct_id` in local storage
  to link events from the same visitor. `respect_dnt: true` honors a
  browser's Do Not Track signal, but if EU/UK traffic matters and you want
  to be strict about consent, you'd add a cookie-consent gate before
  calling `initAnalytics()` — not implemented, since the app has no such
  gate anywhere else today.
- **Bundle size.** `posthog-js` roughly doubled the app's JS bundle
  (~96 KB → ~192 KB gzipped). Fine for now; if it ever becomes a real
  concern, the `analytics.ts` wrapper is the only file that would need to
  change to swap in something lighter (e.g. GoatCounter), since no other
  file talks to PostHog directly.
