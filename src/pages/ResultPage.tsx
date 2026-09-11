import { Link } from 'react-router-dom'

function ResultPage() {
  return (
    <section className="page page-result">
      <h1>Your Result</h1>
      <p>Archetype result placeholder — scoring engine lands in Phase 2.</p>
      <Link to="/" className="btn btn-primary">
        Retake Quiz
      </Link>
    </section>
  )
}

export default ResultPage
