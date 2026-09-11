import { Link } from 'react-router-dom'

function LandingPage() {
  return (
    <section className="page page-landing">
      <h1>What Kind of Climber Are You?</h1>
      <p>
        Answer 10 questions and find out which of 12 climbing archetypes you
        are — then flex your result card on your friends.
      </p>
      <Link to="/quiz" className="btn btn-primary">
        Start Quiz
      </Link>
    </section>
  )
}

export default LandingPage
