import { describe, expect, it } from 'vitest'
import { buildShareFilename } from './exportShareCard'

describe('buildShareFilename', () => {
  it('slugifies a simple name', () => {
    expect(buildShareFilename('Crimp Goblin')).toBe('climbertype-crimp-goblin.png')
  })

  it('strips punctuation and collapses separators', () => {
    expect(buildShareFilename('Sandbagger  Supreme!')).toBe(
      'climbertype-sandbagger-supreme.png',
    )
  })

  it('handles names that are already lowercase/hyphenated', () => {
    expect(buildShareFilename('rest-day-warrior')).toBe('climbertype-rest-day-warrior.png')
  })
})
