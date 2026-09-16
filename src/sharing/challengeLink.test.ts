import { describe, expect, it } from 'vitest'
import { decodeChallenge, encodeChallenge } from './challengeLink'

describe('challengeLink', () => {
  it('round-trips an archetype id with no name', () => {
    const code = encodeChallenge({ archetypeId: 'crimp-goblin' })
    expect(decodeChallenge(code)).toEqual({ archetypeId: 'crimp-goblin' })
  })

  it('round-trips an archetype id with a display name', () => {
    const code = encodeChallenge({ archetypeId: 'dyno-gremlin', name: 'Alex' })
    expect(decodeChallenge(code)).toEqual({ archetypeId: 'dyno-gremlin', name: 'Alex' })
  })

  it('produces a URL-safe string with no padding characters', () => {
    const code = encodeChallenge({ archetypeId: 'sandbagger-supreme', name: 'A very long climber name here' })
    expect(code).toMatch(/^[A-Za-z0-9\-_]+$/)
  })

  it('returns null for garbage input', () => {
    expect(decodeChallenge('not-valid-base64!!!')).toBeNull()
    expect(decodeChallenge('')).toBeNull()
  })

  it('strips separator characters out of names before encoding', () => {
    const code = encodeChallenge({ archetypeId: 'chill-climber', name: 'Al~ex' })
    expect(decodeChallenge(code)).toEqual({ archetypeId: 'chill-climber', name: 'Alex' })
  })
})
