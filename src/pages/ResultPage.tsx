import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { scoreQuiz } from '../scoring/scoreQuiz'
import { ARCHETYPES_BY_ID } from '../types/archetypes'
import { DIMENSIONS, DIMENSION_LABELS } from '../types/archetype'
import type { QuizAnswers } from '../types/quiz'
import { buildChallengeUrl } from '../sharing/challengeLink'
import { buildShareFilename, captureShareCardPng, shareOrDownloadPng } from '../sharing/exportShareCard'
import { trackEvent } from '../analytics/analytics'
import StatBar from '../components/StatBar'
import Mascot from '../components/Mascot'
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
  const result = useMemo(() => (answers ? scoreQuiz(answers) : null), [answers])

  useEffect(() => {
    if (!result) return
    trackEvent('result_viewed', {
      archetype_id: result.archetype.id,
      archetype_name: result.archetype.name,
      aura: result.aura,
    })
    // Fire once per landed result, not on every recompute of the memo.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [result?.archetype.id])

  if (!answers || !result) {
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

  const { archetype, aura, dimensionScores } = result
  const rival = ARCHETYPES_BY_ID[archetype.rivalArchetypeId]
  const partner = ARCHETYPES_BY_ID[archetype.partnerArchetypeId]

  function handleAccuracyFeedback(id: string) {
    setAccuracyFeedback(id)
    trackEvent('accuracy_feedback_submitted', { archetype_id: archetype.id, feedback: id })
  }

  async function handleCopyLink() {
    const url = buildChallengeUrl({ archetypeId: archetype.id, name: name.trim() || undefined })
    trackEvent('challenge_link_copied', { archetype_id: archetype.id, has_name: Boolean(name.trim()) })
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
    trackEvent('share_image_clicked', { archetype_id: archetype.id })
    try {
      const blob = await captureShareCardPng(shareCardRef.current)
      await shareOrDownloadPng(blob, buildShareFilename(archetype.name))
    } catch (err) {
      console.error('[share-card] failed to export', err)
    } finally {
      setShareStatus('idle')
    }
  }

  function handleRetakeClick() {
    trackEvent('retake_quiz_clicked', { archetype_id: archetype.id })
  }

  function handleSupportLinkClick() {
    trackEvent('support_link_clicked', { archetype_id: archetype.id })
  }

  return (
    <section className="page page-result">
      <Mascot archetypeId={archetype.id} name={archetype.name} size={200} />
      <h1>You're a {archetype.name}</h1>
      <p className="result-tagline">&ldquo;{archetype.tagline}&rdquo;</p>
      <p className="result-aura">Climbing Aura: {aura}</p>
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

      {(rival || partner) && (
        <div className="result-block callout-grid">
          {rival && (
            <div className="callout callout-villain">
              <h3>
                {rival.icon} Your Climbing Villain: {rival.name}
              </h3>
              <p>{archetype.villainLine}</p>
            </div>
          )}
          {partner && (
            <div className="callout callout-partner">
              <h3>
                {partner.icon} Your Climbing Partner: {partner.name}
              </h3>
              <p>{archetype.partnerLine}</p>
            </div>
          )}
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
        <Link to="/quiz" className="btn btn-primary" onClick={handleRetakeClick}>
          Retake Quiz
        </Link>
      </div>

      <a
        href="https://buymeacoffee.com/crampingapey"
        target="_blank"
        rel="noopener noreferrer"
        className="support-link"
        onClick={handleSupportLinkClick}
      >
        🪣 <strong>Buy me a chalkbag</strong>
      </a>

      <div className="share-card-offscreen">
        <ShareCard ref={shareCardRef} archetype={archetype} dimensionScores={dimensionScores} />
      </div>
    </section>
  )
}

export default ResultPage
