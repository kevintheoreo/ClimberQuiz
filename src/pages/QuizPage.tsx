import { useNavigate } from 'react-router-dom'

function QuizPage() {
  const navigate = useNavigate()

  return (
    <section className="page page-quiz">
      <h1>Quiz</h1>
      <p>Question 1 of 10 (placeholder)</p>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => navigate('/result')}
      >
        Finish Quiz (stub)
      </button>
    </section>
  )
}

export default QuizPage
