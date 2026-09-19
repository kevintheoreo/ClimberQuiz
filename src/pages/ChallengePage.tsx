import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { decodeChallenge } from '../sharing/challengeLink'
import { ARCHETYPES_BY_ID } from '../types/archetypes'
import Mascot from '../components/Mascot'
import { trackEvent } from '../analytics/analytics'

function ChallengePage() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const payload = code ? decodeChallenge(code) : null
  const archetype = payload ? ARCHETYPES_BY_ID[payload.archetypeId] : undefined

  useEffect(() => {
    if (payload && archetype) {
      trackEvent('challenge_viewed', {
        archetype_id: archetype.id,
        has_name: Boolean(payload.name),
      })
    }
    // payload is a freshly-decoded object every render; keying on the id avoids refiring on every render.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [payload?.archetypeId, archetype])

  if (!payload || !archetype) {
    return (
      <section className="page page-challenge">
        <h1>Chalk Bag's Empty</h1>
        <p>This link snapped like a bad crimp. Take the quiz and find your own climbing archetype.</p>
        <Link to="/quiz" className="btn btn-primary">
          Start Quiz
        </Link>
      </section>
    )
  }

  const challenger = payload.name || 'Your friend'

  return (
    <section className="page page-challenge">
      <Mascot archetypeId={archetype.id} name={archetype.name} size={180} />
      <h1>
        {challenger} is a {archetype.name}
      </h1>
      <p className="result-tagline">Think you're different? Take the quiz →</p>
      <button type="button" className="btn btn-primary" onClick={() => navigate('/quiz')}>
        Take the Quiz
      </button>
    </section>
  )
}

export default ChallengePage
