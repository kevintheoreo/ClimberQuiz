import { Route, Routes } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import LandingPage from './pages/LandingPage'
import QuizPage from './pages/QuizPage'
import ResultPage from './pages/ResultPage'
import ChallengePage from './pages/ChallengePage'
import './App.css'

function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/challenge/:code" element={<ChallengePage />} />
      </Routes>
      <Analytics />
    </div>
  )
}

export default App
