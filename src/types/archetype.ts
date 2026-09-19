export const DIMENSIONS = [
  'POWER',
  'TECHNIQUE',
  'ANALYSIS',
  'COMMITMENT',
  'CHAOS',
  'GRADE_EGO',
] as const

export type Dimension = (typeof DIMENSIONS)[number]

export type DimensionVector = Record<Dimension, number>

export const AURAS = ['POWER', 'TECHNIQUE', 'CHAOS', 'BRAIN', 'GRIT', 'VIBES'] as const

export type Aura = (typeof AURAS)[number]

export type Rarity = 'common' | 'uncommon' | 'rare' | 'very-rare'

export const RARITY_LABELS: Record<Rarity, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  'very-rare': 'Very Rare',
}

/** Rarity reframed as print-edition size, matching the Gig Poster identity's print-culture conceit. */
export const EDITION_LABELS: Record<Rarity, string> = {
  common: 'Open Edition',
  uncommon: 'Ed. — / 500',
  rare: 'Ed. — / 100',
  'very-rare': 'Ed. 1 / 1',
}

export const DIMENSION_LABELS: Record<Dimension, string> = {
  POWER: 'Power',
  TECHNIQUE: 'Technique',
  ANALYSIS: 'Beta Brain',
  COMMITMENT: 'Grit',
  CHAOS: 'Chaos',
  GRADE_EGO: 'Grade Ego',
}

export interface ArchetypeContent {
  id: string
  icon: string
  name: string
  tagline: string
  flavorText: string
  favouriteHold: string
  naturalHabitat: string
  superpower: string
  weakness: string
  rarity: Rarity
  /** Villain and partner are always the same archetype (see PRD decisions log). */
  rivalArchetypeId: string
  villainLine: string
  partnerLine: string
  idealVector: DimensionVector
}
