import type { QuizAnswers } from '../types/quiz'
import type { ArchetypeContent, Aura, DimensionVector } from '../types/archetype'
import { computeRawVector, normalizeVector } from './vector'
import { pickArchetype, pickAura } from './match'

export interface QuizResult {
  archetype: ArchetypeContent
  aura: Aura
  /** 0-100 scale, suitable for stat-bar display. */
  dimensionScores: DimensionVector
}

/** Pure function: quiz answers -> dimension vector -> matched archetype + aura. */
export function scoreQuiz(answers: QuizAnswers): QuizResult {
  const rawVector = computeRawVector(answers)
  const dimensionScores = normalizeVector(rawVector)
  const archetype = pickArchetype(dimensionScores)
  const aura = pickAura(dimensionScores)

  return { archetype, aura, dimensionScores }
}
