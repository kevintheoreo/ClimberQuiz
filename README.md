# ClimberType

"What kind of climber are you?" — a shareable climbing-culture personality quiz. See [PRD.md](PRD.md), [mechanics.md](mechanics.md), and [phased-plan.md](phased-plan.md) for full product context, and [analytics.md](analytics.md) for how event tracking is wired up.

## Stack

React + Vite + TypeScript, client-side only (no backend).

## Getting started

```bash
npm install
npm run dev
```

## Project structure

- `src/pages` — top-level routed views (landing, quiz, result)
- `src/quiz` — quiz engine (question flow, answer state)
- `src/scoring` — scoring engine (answers → dimension vector → archetype)
- `src/types` — archetype content (static JSON) and shared TypeScript types
- `src/components` — shared UI components

