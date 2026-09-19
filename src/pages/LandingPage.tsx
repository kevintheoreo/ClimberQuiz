import { Link } from 'react-router-dom'

function LandingPage() {
  return (
    <section className="page page-landing">
      <p className="landing-eyebrow">The Climbing Personality Quiz</p>
      <h1>What Kind of Climber Are You?</h1>
      <p className="landing-pitch deckle-edge">
        Chalk up. Ten questions stand between you and which of 12 climbing
        archetypes you truly are — then go flex the result on your friends.
      </p>
      <Link to="/quiz" className="btn btn-primary">
        Start Quiz
      </Link>
    </section>
  )
}

export default LandingPage
