import { forwardRef } from 'react'
import Mascot from './Mascot'
import { DIMENSIONS, DIMENSION_LABELS } from '../types/archetype'
import type { ArchetypeContent, DimensionVector } from '../types/archetype'

interface ShareCardProps {
  archetype: ArchetypeContent
  dimensionScores: DimensionVector
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(function ShareCard(
  { archetype, dimensionScores },
  ref,
) {
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
        {DIMENSIONS.map((dim) => (
          <div key={dim} className="share-card-stat-row">
            <span className="share-card-stat-label">{DIMENSION_LABELS[dim]}</span>
            <div className="share-card-stat-track">
              <div
                className="share-card-stat-fill"
                style={{ width: `${Math.round(dimensionScores[dim])}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="share-card-chips">
        <span className="share-card-chip">{archetype.favouriteHold}</span>
        <span className="share-card-chip">{archetype.naturalHabitat}</span>
      </div>

      <p className="share-card-footer">climbertype.com</p>
    </div>
  )
})

export default ShareCard
