import { ARCHETYPES } from '../types/archetypes'
import { AURAS, DIMENSIONS } from '../types/archetype'
import type { ArchetypeContent, Aura, DimensionVector } from '../types/archetype'

function distance(a: DimensionVector, b: DimensionVector): number {
  return Math.sqrt(
    DIMENSIONS.reduce((sum, dim) => sum + (a[dim] - b[dim]) ** 2, 0),
  )
}

/** Picks the archetype whose ideal vector is closest to the user's; ties keep the earlier archetype in list order. */
export function pickArchetype(userVector: DimensionVector): ArchetypeContent {
  let best = ARCHETYPES[0]
  let bestDistance = distance(userVector, best.idealVector)

  for (const archetype of ARCHETYPES.slice(1)) {
    const d = distance(userVector, archetype.idealVector)

    if (d < bestDistance - 1e-9) {
      best = archetype
      bestDistance = d
    }
  }

  return best
}

/** Highest-scoring "aura" trait, distinct from the matched archetype (PRD §7.3). VIBES rewards a low grade ego. */
export function pickAura(normalizedVector: DimensionVector): Aura {
  const auraScores: Record<Aura, number> = {
    POWER: normalizedVector.POWER,
    TECHNIQUE: normalizedVector.TECHNIQUE,
    CHAOS: normalizedVector.CHAOS,
    BRAIN: normalizedVector.ANALYSIS,
    GRIT: normalizedVector.COMMITMENT,
    VIBES: 100 - normalizedVector.GRADE_EGO,
  }

  return AURAS.reduce((best, aura) => (auraScores[aura] > auraScores[best] ? aura : best))
}
