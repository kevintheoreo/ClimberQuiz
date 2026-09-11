import type { Dimension } from '../types/archetype'

type AnswerWeights = Partial<Record<Dimension, number>>

/**
 * Answer -> dimension-delta weights (Q# -> answer id -> partial 6-dim contribution).
 * Values are deliberately small per-answer (-3..+3) so no single answer telegraphs a result.
 */
export const ANSWER_WEIGHTS: Record<string, Record<string, AnswerWeights>> = {
  q1: {
    a: { COMMITMENT: 2, CHAOS: 2, ANALYSIS: -1 },
    b: { ANALYSIS: 3, TECHNIQUE: 1 },
    c: { POWER: 2, GRADE_EGO: 2 },
    d: { ANALYSIS: 2, TECHNIQUE: 1, CHAOS: -1 },
  },
  q2: {
    a: { COMMITMENT: 3, CHAOS: 1 },
    b: { TECHNIQUE: 2, ANALYSIS: 2 },
    c: { TECHNIQUE: 1, ANALYSIS: 1, CHAOS: -1 },
    d: { GRADE_EGO: 3, COMMITMENT: -2 },
  },
  q3: {
    a: { POWER: 2, TECHNIQUE: -1, GRADE_EGO: 1 },
    b: { TECHNIQUE: 2, ANALYSIS: 1 },
    c: { POWER: 2, GRADE_EGO: 1 },
    d: { TECHNIQUE: 2, CHAOS: 1 },
  },
  q4: {
    a: { TECHNIQUE: 2, CHAOS: 1 },
    b: { GRADE_EGO: 3, ANALYSIS: -1 },
    c: { ANALYSIS: 3 },
    d: { CHAOS: 2, GRADE_EGO: -2 },
  },
  q5: {
    a: { POWER: 1, COMMITMENT: 2, CHAOS: 2 },
    b: { TECHNIQUE: 3, ANALYSIS: 1 },
    c: { ANALYSIS: 3 },
    d: { COMMITMENT: -2, CHAOS: -1, GRADE_EGO: -1 },
  },
  q6: {
    a: { GRADE_EGO: 3, POWER: 1 },
    b: { COMMITMENT: 3, GRADE_EGO: 1 },
    c: { TECHNIQUE: 2, ANALYSIS: 1 },
    d: { CHAOS: 1, GRADE_EGO: -2, COMMITMENT: -1 },
  },
  q7: {
    a: { POWER: 3, COMMITMENT: 1, TECHNIQUE: -1 },
    b: { TECHNIQUE: 3, ANALYSIS: 2, POWER: -1 },
    c: { CHAOS: 3, POWER: 2 },
    d: { CHAOS: 3, COMMITMENT: 2, ANALYSIS: -2 },
  },
  q8: {
    a: { POWER: 2, TECHNIQUE: -1, GRADE_EGO: 1 },
    b: { TECHNIQUE: 3, ANALYSIS: 1 },
    c: { POWER: 3, TECHNIQUE: -1 },
    d: { COMMITMENT: -2, CHAOS: 1, ANALYSIS: -1 },
  },
  q9: {
    a: { GRADE_EGO: 3, POWER: 1 },
    b: { GRADE_EGO: -3, TECHNIQUE: 1, POWER: 1 },
    c: { ANALYSIS: 3 },
    d: { CHAOS: 1, GRADE_EGO: -1, COMMITMENT: -1 },
  },
  q10: {
    a: { POWER: 3, TECHNIQUE: -1 },
    b: { ANALYSIS: 3, COMMITMENT: -1 },
    c: { COMMITMENT: 2, CHAOS: 1, ANALYSIS: -1 },
    d: { GRADE_EGO: 3 },
  },
}
