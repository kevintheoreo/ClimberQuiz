import { DIMENSIONS } from '../types/archetype'
import type { Dimension, DimensionVector } from '../types/archetype'
import { ANSWER_WEIGHTS } from './weights'

/** Theoretical min/max attainable total per dimension, derived from the weight table. */
function computeDimensionBounds(): Record<Dimension, { min: number; max: number }> {
  const bounds = Object.fromEntries(
    DIMENSIONS.map((dim) => [dim, { min: 0, max: 0 }]),
  ) as Record<Dimension, { min: number; max: number }>

  for (const answerWeights of Object.values(ANSWER_WEIGHTS)) {
    for (const dim of DIMENSIONS) {
      const deltas = Object.values(answerWeights).map((weights) => weights[dim] ?? 0)
      bounds[dim].min += Math.min(0, ...deltas)
      bounds[dim].max += Math.max(0, ...deltas)
    }
  }

  return bounds
}

export const DIMENSION_BOUNDS = computeDimensionBounds()

/** Sums raw answer-weight deltas for every dimension across all answered questions. */
export function computeRawVector(answers: Record<string, string>): DimensionVector {
  const raw = Object.fromEntries(DIMENSIONS.map((dim) => [dim, 0])) as DimensionVector

  for (const [questionId, answerId] of Object.entries(answers)) {
    const weights = ANSWER_WEIGHTS[questionId]?.[answerId]
    if (!weights) continue
    for (const dim of DIMENSIONS) {
      raw[dim] += weights[dim] ?? 0
    }
  }

  return raw
}

/** Normalizes a raw dimension vector onto a 0-100 scale using the weight table's theoretical bounds. */
export function normalizeVector(raw: DimensionVector): DimensionVector {
  const normalized = Object.fromEntries(DIMENSIONS.map((dim) => [dim, 0])) as DimensionVector

  for (const dim of DIMENSIONS) {
    const { min, max } = DIMENSION_BOUNDS[dim]
    const range = max - min
    const value = range === 0 ? 50 : ((raw[dim] - min) / range) * 100
    normalized[dim] = Math.min(100, Math.max(0, value))
  }

  return normalized
}
