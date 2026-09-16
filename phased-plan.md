# Phased Plan: ClimberType

Implementation phases derived from [PRD.md](PRD.md). Each phase should be independently shippable/demoable and builds on the previous one.

## Phase 0 — Project Setup

- Scaffold React + Vite project.
- Set up folder structure: `src/components`, `src/quiz`, `src/types` (archetype JSON), `src/scoring`, `src/pages`.
- Set up basic routing (landing / quiz / result).
- Establish base styling approach (CSS framework or custom, per §11 visual direction).

**Done when:** Blank app runs locally with landing → quiz → result page stubs navigable.

## Phase 1 — Quiz Engine (Content-Agnostic)

- Build static config for 10 questions × 4 answers (placeholder copy OK).
- Build quiz UI: one question per screen, progress indicator, back/next.
- Store user answers in state through to completion.

**Done when:** User can click through all 10 questions and land on a bare result screen showing raw selected answers.

## Phase 2 — Archetype Content & Scoring Engine

- Author final copy for all 12 archetypes as static JSON (icon, name, tagline, favourite hold, habitat, superpower, weakness, rarity tier, villain/partner pairing, ideal 6-dimension vector).
- Author final answer-weight table (40 answers → 6 dimensions).
- Implement scoring engine: answers → dimension vector → nearest-archetype match → climbing aura.
- Unit-test scoring engine with sample answer sets to confirm sane distribution across archetypes.

**Done when:** Completing the quiz deterministically returns a matched archetype + aura from real content.

## Phase 3 — Result Page ✅

- Build full result page per §8: stat bars, climbing profile, rarity badge, climbing villain, climbing partner, flavor text.
- Wire "Retake Quiz" action.
- Add "How accurate was this?" feedback control (local event only for now).

**Done when:** Result page fully reflects the matched archetype with real content and styling.

## Phase 4 — Share Card Generation

- Build 1080×1920 share card layout (per §9) as a component.
- Implement image export (canvas/HTML-to-image) to downloadable PNG.
- Add "Save Image" action; add "Share" action using Web Share API with save-image fallback.

**Done when:** User can download or share a correctly rendered result image from the result page.

## Phase 5 — Referral / Challenge Links ✅

- Implement URL-encoding of result state (archetype id, optional name) per §10.
- Build the "challenge" landing view: "{Name} is a CRIMP GOBLIN — think you're different?" entry point that routes into the quiz.
- Add "Copy Link" action on the result page.

**Done when:** A shared link opens directly into the challenge view and funnels a new user into the quiz.

## Phase 6 — Visual Polish & Mascots

- Apply full visual identity (§11): textured backgrounds, chunky typography, chalk-particle details.
- Add/commission illustrated mascot per archetype for result page + share card.
- Pass over all copy for tone consistency (climbing-insider humor, not survey language).

**Done when:** App looks and reads like the intended "Japanese climbing gym × retro arcade × sticker collection" identity end-to-end.

## Phase 7 — Analytics

- Add lightweight client-side analytics (privacy-respecting) for: quiz starts, completions, result-type distribution, share/download clicks, referral-link visits, repeat attempts, accuracy-feedback responses.
- Verify events fire correctly across the funnel.

**Done when:** All metrics in §14 are observable in the analytics dashboard.

## Phase 8 — Launch

- Cross-browser/device pass, especially share/download behavior on iOS Safari vs Android/desktop.
- Final QA of full funnel: landing → quiz → result → share/link → challenge view → quiz.
- Pick hosting/domain (open item from §17) and deploy.
- Soft-launch to a small climbing circle for real-world share-loop validation before wider posting.

**Done when:** Site is live on its final domain and has been completed end-to-end by real users outside the dev team.

## Phase 9 — Post-Launch (Conditional)

Only pursue if Phase 8 shows healthy share/referral metrics:
- Optional paid "full climbing report" unlock (§13).
- Expanded content (more archetypes, alternate card designs, wallpapers).
- Any iteration on rarity/scoring balance based on observed result-type distribution.
