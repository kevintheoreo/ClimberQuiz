import { describe, expect, it } from 'vitest'
import { ARCHETYPES } from '../types/archetypes'
import { MASCOT_MANIFEST } from './mascotManifest'

describe('MASCOT_MANIFEST', () => {
  it('has an entry for every archetype', () => {
    for (const archetype of ARCHETYPES) {
      expect(MASCOT_MANIFEST[archetype.id]).toBeTruthy()
    }
  })

  it('has no entries for unknown archetype ids', () => {
    const knownIds = new Set(ARCHETYPES.map((archetype) => archetype.id))
    for (const id of Object.keys(MASCOT_MANIFEST)) {
      expect(knownIds.has(id)).toBe(true)
    }
  })
})
