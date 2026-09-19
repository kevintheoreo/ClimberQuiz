import { useNavigate } from 'react-router-dom'
import ProgressBar from '../components/ProgressBar'
import { useQuiz } from '../quiz/useQuiz'
import { trackEvent } from '../analytics/analytics'

function QuizPage() {
  const navigate = useNavigate()
  const {
    total,
    currentIndex,
    currentQuestion,
    selectedAnswerId,
    isFirst,
    isLast,
    progress,
    answers,
    selectAnswer,
    goNext,
    goBack,
  } = useQuiz()

  function handleNext() {
    if (isLast) {
      trackEvent('quiz_completed')
      navigate('/result', { state: { answers } })
    } else {
      goNext()
    }
  }

  return (
    <section className="page page-quiz">
      <ProgressBar
        progress={progress}
        label={`Question ${currentIndex + 1} of ${total}`}
      />
      <h1>{currentQuestion.prompt}</h1>
      <div className="answer-list">
        {currentQuestion.answers.map((answer) => (
          <button
            key={answer.id}
            type="button"
            className={
              'answer-option' +
              (selectedAnswerId === answer.id ? ' answer-option-selected' : '')
            }
            aria-pressed={selectedAnswerId === answer.id}
            onClick={() => selectAnswer(answer.id)}
          >
            {answer.text}
          </button>
        ))}
      </div>
      <div className="quiz-nav">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={goBack}
          disabled={isFirst}
        >
          Back
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleNext}
          disabled={!selectedAnswerId}
        >
          {isLast ? 'See Results' : 'Next'}
        </button>
      </div>
    </section>
  )
}

export default QuizPage
