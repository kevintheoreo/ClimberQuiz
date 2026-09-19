import { useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { scoreQuiz } from '../scoring/scoreQuiz'
import { ARCHETYPES_BY_ID } from '../types/archetypes'
import { DIMENSIONS, DIMENSION_LABELS } from '../types/archetype'
import type { QuizAnswers } from '../types/quiz'
import { buildChallengeUrl } from '../sharing/challengeLink'
import { buildShareFilename, captureShareCardPng, shareOrDownloadPng } from '../sharing/exportShareCard'
import StatBar from '../components/StatBar'
import Mascot from '../components/Mascot'
import EditionStamp from '../components/EditionStamp'
import ShareCard from '../components/ShareCard'

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
  const [name, setName] = useState('')
  const [shareStatus, setShareStatus] = useState<'idle' | 'working'>('idle')
  const shareCardRef = useRef<HTMLDivElement>(null)

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
    const url = buildChallengeUrl({ archetypeId: archetype.id, name: name.trim() || undefined })
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable')
      await navigator.clipboard.writeText(url)
      setLinkCopied(true)
      window.setTimeout(() => setLinkCopied(false), 2000)
    } catch {
      window.prompt('Copy your challenge link:', url)
    }
  }

  async function handleShareImage() {
    if (!shareCardRef.current || shareStatus === 'working') return
    setShareStatus('working')
    try {
      const blob = await captureShareCardPng(shareCardRef.current)
      await shareOrDownloadPng(blob, buildShareFilename(archetype.name))
    } catch (err) {
      console.error('[share-card] failed to export', err)
    } finally {
      setShareStatus('idle')
    }
  }

  return (
    <section className="page page-result">
      <Mascot archetypeId={archetype.id} name={archetype.name} size={200} />
      <h1>You're a {archetype.name}</h1>
      <p className="result-tagline">&ldquo;{archetype.tagline}&rdquo;</p>
      <p className="result-aura">Climbing Aura: {aura}</p>
      <EditionStamp rarity={archetype.rarity} />
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

      <div className="name-input-row">
        <label className="name-input-label" htmlFor="challenge-name">
          Your name (for the challenge link)
        </label>
        <input
          id="challenge-name"
          className="name-input"
          type="text"
          placeholder="Optional"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={40}
        />
      </div>

      <div className="result-actions">
        <button type="button" className="btn btn-secondary" onClick={handleCopyLink}>
          {linkCopied ? 'Link Copied!' : 'Copy Link'}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleShareImage}
          disabled={shareStatus === 'working'}
        >
          {shareStatus === 'working' ? 'Preparing…' : 'Share Image'}
        </button>
        <Link to="/quiz" className="btn btn-primary">
          Retake Quiz
        </Link>
      </div>

      <div className="share-card-offscreen">
        <ShareCard ref={shareCardRef} archetype={archetype} dimensionScores={dimensionScores} />
      </div>
    </section>
  )
}

export default ResultPage
