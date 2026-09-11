import { Link, useLocation } from 'react-router-dom'
import { QUESTIONS } from '../quiz/questions'
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
        <p>Take the quiz first to see your raw answers here.</p>
        <Link to="/quiz" className="btn btn-primary">
          Start Quiz
        </Link>
      </section>
    )
  }

  return (
    <section className="page page-result">
      <h1>Your Answers</h1>
      <p>Archetype matching lands in Phase 2 — here's what you picked:</p>
      <ul className="raw-answers">
        {QUESTIONS.map((question) => {
          const answerId = answers[question.id]
          const answer = question.answers.find((a) => a.id === answerId)
          return (
            <li key={question.id}>
              <strong>{question.prompt}</strong>
              <span>{answer ? answer.text : 'No answer'}</span>
            </li>
          )
        })}
      </ul>
      <Link to="/quiz" className="btn btn-primary">
        Retake Quiz
      </Link>
    </section>
  )
}

export default ResultPage
