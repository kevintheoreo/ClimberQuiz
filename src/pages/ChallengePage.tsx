import { Link, useNavigate, useParams } from 'react-router-dom'
import { decodeChallenge } from '../sharing/challengeLink'
import { ARCHETYPES_BY_ID } from '../types/archetypes'

function ChallengePage() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const payload = code ? decodeChallenge(code) : null
  const archetype = payload ? ARCHETYPES_BY_ID[payload.archetypeId] : undefined

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
      <span className="result-icon">{archetype.icon}</span>
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
