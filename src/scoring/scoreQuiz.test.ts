import { describe, expect, it } from 'vitest'
import { scoreQuiz } from './scoreQuiz'
import { QUESTIONS } from '../quiz/questions'
import { ARCHETYPES } from '../types/archetypes'
import { DIMENSIONS } from '../types/archetype'
import type { QuizAnswers } from '../types/quiz'

const ANSWER_IDS = ['a', 'b', 'c', 'd']

function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function answersFromPattern(answerId: string): QuizAnswers {
  return Object.fromEntries(QUESTIONS.map((q) => [q.id, answerId]))
}

function randomAnswers(random: () => number): QuizAnswers {
  return Object.fromEntries(
    QUESTIONS.map((q) => [q.id, ANSWER_IDS[Math.floor(random() * ANSWER_IDS.length)]]),
  )
}

describe('scoreQuiz', () => {
  it('is deterministic for identical answers', () => {
    const answers = answersFromPattern('a')
    const first = scoreQuiz(answers)
    const second = scoreQuiz(answers)

    expect(second.archetype.id).toBe(first.archetype.id)
    expect(second.aura).toBe(first.aura)
    expect(second.dimensionScores).toEqual(first.dimensionScores)
  })

  it('returns a valid archetype and in-range dimension scores for every all-same-letter pattern', () => {
    for (const answerId of ANSWER_IDS) {
      const result = scoreQuiz(answersFromPattern(answerId))

      expect(ARCHETYPES.some((a) => a.id === result.archetype.id)).toBe(true)
      for (const dim of DIMENSIONS) {
        expect(result.dimensionScores[dim]).toBeGreaterThanOrEqual(0)
        expect(result.dimensionScores[dim]).toBeLessThanOrEqual(100)
      }
    }
  })

  it('produces a reasonably spread distribution of archetypes across random answer sets', () => {
    const random = mulberry32(42)
    const seen = new Set<string>()
    const auras = new Set<string>()

    for (let i = 0; i < 300; i++) {
      const result = scoreQuiz(randomAnswers(random))
      seen.add(result.archetype.id)
      auras.add(result.aura)
    }

    // With 300 varied samples across 12 archetypes, expect decent coverage (not a single dominant result).
    expect(seen.size).toBeGreaterThanOrEqual(6)
    expect(auras.size).toBeGreaterThanOrEqual(3)
  })

  it('never returns a dominant archetype for over 70% of random samples', () => {
    const random = mulberry32(7)
    const counts = new Map<string, number>()
    const total = 300

    for (let i = 0; i < total; i++) {
      const result = scoreQuiz(randomAnswers(random))
      counts.set(result.archetype.id, (counts.get(result.archetype.id) ?? 0) + 1)
    }

    for (const count of counts.values()) {
      expect(count / total).toBeLessThan(0.7)
    }
  })
})
