import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { scoreQuiz } from '../scoring/scoreQuiz'
import { ARCHETYPES_BY_ID } from '../types/archetypes'
import { DIMENSIONS, DIMENSION_LABELS, RARITY_LABELS } from '../types/archetype'
import type { QuizAnswers } from '../types/quiz'
import { buildChallengeUrl } from '../sharing/challengeLink'
import StatBar from '../components/StatBar'

interface ResultLocationState {
  answers?: QuizAnswers
}

const ACCURACY_OPTIONS = [
  { id: 'accurate', emoji: '🔥', label: '100% me' },
  { id: 'kinda', emoji: '😐', label: 'Kinda' },
  { id: 'not-me', emoji: '🤨', label: 'Not me' },
] as const

function ResultPage() {
  const location = useLocation()
  const answers = (location.state as ResultLocationState | null)?.answers
  const [accuracyFeedback, setAccuracyFeedback] = useState<string | null>(null)
  const [linkCopied, setLinkCopied] = useState(false)

  if (!answers) {
    return (
      <section className="page page-result">
        <h1>No Send Yet</h1>
        <p>You haven't climbed this route yet — take the quiz to find your archetype.</p>
        <Link to="/quiz" className="btn btn-primary">
          Start Quiz
        </Link>
      </section>
    )
  }

  const { archetype, aura, dimensionScores } = scoreQuiz(answers)
  const rival = ARCHETYPES_BY_ID[archetype.rivalArchetypeId]

  function handleAccuracyFeedback(id: string) {
    setAccuracyFeedback(id)
    // Local-only for now; wired to real analytics in Phase 7.
    console.info('[accuracy-feedback]', { archetypeId: archetype.id, feedback: id })
  }

  async function handleCopyLink() {
    const url = buildChallengeUrl({ archetypeId: archetype.id })
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable')
      await navigator.clipboard.writeText(url)
      setLinkCopied(true)
      window.setTimeout(() => setLinkCopied(false), 2000)
    } catch {
      window.prompt('Copy your challenge link:', url)
    }
  }

  return (
    <section className="page page-result">
      <span className="result-icon">{archetype.icon}</span>
      <h1>You're a {archetype.name}</h1>
      <p className="result-tagline">&ldquo;{archetype.tagline}&rdquo;</p>
      <p className="result-aura">Climbing Aura: {aura}</p>
      <span className={`rarity-badge rarity-${archetype.rarity}`}>
        {RARITY_LABELS[archetype.rarity]}
      </span>
      <p>{archetype.flavorText}</p>

      <div className="result-block stat-bars">
        {DIMENSIONS.map((dim) => (
          <StatBar key={dim} label={DIMENSION_LABELS[dim]} value={dimensionScores[dim]} />
        ))}
      </div>

      <div className="result-block climbing-profile">
        <h2>Climbing Profile</h2>
        <dl className="profile-list">
          <div className="profile-row">
            <dt>Favourite Hold</dt>
            <dd>{archetype.favouriteHold}</dd>
          </div>
          <div className="profile-row">
            <dt>Natural Habitat</dt>
            <dd>{archetype.naturalHabitat}</dd>
          </div>
          <div className="profile-row">
            <dt>Superpower</dt>
            <dd>{archetype.superpower}</dd>
          </div>
          <div className="profile-row">
            <dt>Weakness</dt>
            <dd>{archetype.weakness}</dd>
          </div>
        </dl>
      </div>

      {rival && (
        <div className="result-block callout-grid">
          <div className="callout callout-villain">
            <h3>
              {rival.icon} Your Climbing Villain: {rival.name}
            </h3>
            <p>{archetype.villainLine}</p>
          </div>
          <div className="callout callout-partner">
            <h3>
              {rival.icon} Your Climbing Partner: {rival.name}
            </h3>
            <p>{archetype.partnerLine}</p>
          </div>
        </div>
      )}

      <div className="result-block accuracy-feedback">
        <p className="accuracy-feedback-prompt">How accurate was this?</p>
        <div className="accuracy-feedback-options">
          {ACCURACY_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={
                'accuracy-feedback-option' +
                (accuracyFeedback === option.id ? ' accuracy-feedback-option-selected' : '')
              }
              aria-pressed={accuracyFeedback === option.id}
              onClick={() => handleAccuracyFeedback(option.id)}
            >
              <span aria-hidden="true">{option.emoji}</span> {option.label}
            </button>
          ))}
        </div>
        {accuracyFeedback && <p className="accuracy-feedback-thanks">Thanks for the feedback!</p>}
      </div>

      <div className="result-actions">
        <button type="button" className="btn btn-secondary" onClick={handleCopyLink}>
          {linkCopied ? 'Link Copied!' : 'Copy Link'}
        </button>
        <Link to="/quiz" className="btn btn-primary">
          Retake Quiz
        </Link>
      </div>
    </section>
  )
}

export default ResultPage
