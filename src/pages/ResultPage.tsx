import { Link, useLocation } from 'react-router-dom'
import { scoreQuiz } from '../scoring/scoreQuiz'
import type { QuizAnswers } from '../types/quiz'

interface ResultLocationState {
  answers?: QuizAnswers
}

function ResultPage() {
  const location = useLocation()
  const answers = (location.state as ResultLocationState | null)?.answers

  if (!answers) {
    return (
      <section className="page page-result">
        <h1>No Result Yet</h1>
        <p>Take the quiz first to see your archetype here.</p>
        <Link to="/quiz" className="btn btn-primary">
          Start Quiz
        </Link>
      </section>
    )
  }

  const { archetype, aura } = scoreQuiz(answers)

  return (
    <section className="page page-result">
      <span className="result-icon">{archetype.icon}</span>
      <h1>You're a {archetype.name}</h1>
      <p className="result-tagline">&ldquo;{archetype.tagline}&rdquo;</p>
      <p className="result-aura">Climbing Aura: {aura}</p>
      <p>{archetype.flavorText}</p>
      <Link to="/quiz" className="btn btn-primary">
        Retake Quiz
      </Link>
    </section>
  )
}

export default ResultPage
