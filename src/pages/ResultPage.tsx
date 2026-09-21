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
  const [shareStatus, setShareStatus] = useState<'idle' | 'working' | 'error'>('idle')
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
      setShareStatus('idle')
    } catch (err) {
      console.error('[share-card] failed to export', err)
      setShareStatus('error')
      window.setTimeout(() => setShareStatus((s) => (s === 'error' ? 'idle' : s)), 4000)
    }
  }

  function handleRetakeClick() {
    trackEvent('retake_quiz_clicked', { archetype_id: archetype.id })
  }

  function handleSupportLinkClick() {
    trackEvent('support_link_clicked', { archetype_id: archetype.id })
  }

  function handleInstagramLinkClick() {
    trackEvent('instagram_link_clicked', { archetype_id: archetype.id })
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
              <div className="callout-header">
                <Mascot archetypeId={rival.id} name={rival.name} size={40} static />
                <h3>Your Climbing Villain: {rival.name}</h3>
              </div>
              <p>{archetype.villainLine}</p>
            </div>
          )}
          {partner && (
            <div className="callout callout-partner">
              <div className="callout-header">
                <Mascot archetypeId={partner.id} name={partner.name} size={40} static />
                <h3>Your Climbing Partner: {partner.name}</h3>
              </div>
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
          {shareStatus === 'working'
            ? 'Preparing…'
            : shareStatus === 'error'
              ? 'Failed — Tap to Retry'
              : 'Share Image'}
        </button>
        <Link to="/quiz" className="btn btn-primary" onClick={handleRetakeClick}>
          Retake Quiz
        </Link>
      </div>

      <div className="page-credit">
        <div className="page-credit-actions">
          <a
            href="https://buymeacoffee.com/crampingapey"
            target="_blank"
            rel="noopener noreferrer"
            className="chalkbag-button"
            onClick={handleSupportLinkClick}
          >
            🪣 Buy me chalk
          </a>
          <a
            href="https://instagram.com/crampingapey"
            target="_blank"
            rel="noopener noreferrer"
            className="icon-button"
            aria-label="@crampingapey on Instagram"
            onClick={handleInstagramLinkClick}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </a>
        </div>
        <p className="page-credit-line">Developed by @crampingapey</p>
      </div>

      <div className="share-card-offscreen">
        <ShareCard ref={shareCardRef} archetype={archetype} dimensionScores={dimensionScores} />
      </div>
    </section>
  )
}

export default ResultPage
