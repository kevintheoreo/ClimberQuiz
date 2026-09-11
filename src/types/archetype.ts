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
