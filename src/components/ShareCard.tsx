import { forwardRef } from 'react'
import Mascot from './Mascot'
import type { ArchetypeContent, DimensionVector } from '../types/archetype'

interface ShareCardProps {
  archetype: ArchetypeContent
  dimensionScores: DimensionVector
}

/**
 * The four share-card stats intentionally aren't a 1:1 dump of the six scoring
 * dimensions — Vibes reuses the same "100 - GRADE_EGO" formula pickAura() uses
 * for its VIBES score (see src/scoring/match.ts), so the number shown here
 * matches what the rest of the app already computes.
 */
function buildShareStats(scores: DimensionVector) {
  return [
    { label: 'Power', value: scores.POWER },
    { label: 'Grit', value: scores.COMMITMENT },
    { label: 'Technique', value: scores.TECHNIQUE },
    { label: 'Vibes', value: 100 - scores.GRADE_EGO },
  ]
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(function ShareCard(
  { archetype, dimensionScores },
  ref,
) {
  const stats = buildShareStats(dimensionScores)

  return (
    <div ref={ref} className="share-card deckle-edge">
      <div className="share-card-texture" />
      <p className="share-card-eyebrow">What kind of climber are you?</p>
      <div className="share-card-mascot-wrap">
        <Mascot archetypeId={archetype.id} name={archetype.name} size={380} static />
      </div>
      <h2 className="share-card-name">{archetype.name}</h2>
      <p className="share-card-tagline">&ldquo;{archetype.tagline}&rdquo;</p>

      <div className="share-card-stats">
        {stats.map((stat) => (
          <div key={stat.label} className="share-card-stat-row">
            <span className="share-card-stat-label">{stat.label}</span>
            <div className="share-card-stat-track">
              <div
                className="share-card-stat-fill"
                style={{ width: `${Math.round(stat.value)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="share-card-chips">
        <span className="share-card-chip">{archetype.favouriteHold}</span>
        <span className="share-card-chip">{archetype.naturalHabitat}</span>
      </div>

      <p className="share-card-footer">climbertype.app</p>
    </div>
  )
})

export default ShareCard
