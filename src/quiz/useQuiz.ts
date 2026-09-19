import { useEffect, useMemo, useState } from 'react'
import { QUESTIONS } from './questions'
import type { QuizAnswers } from '../types/quiz'
import { trackEvent } from '../analytics/analytics'

export function useQuiz() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<QuizAnswers>({})

  // Fires once per mount, covering every entry point into /quiz (landing page, challenge page, direct link).
  useEffect(() => {
    trackEvent('quiz_started')
  }, [])

  const total = QUESTIONS.length
  const currentQuestion = QUESTIONS[currentIndex]
  const selectedAnswerId = answers[currentQuestion.id]

  const isFirst = currentIndex === 0
  const isLast = currentIndex === total - 1
  const progress = useMemo(() => (currentIndex + 1) / total, [currentIndex, total])

  function selectAnswer(answerId: string) {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: answerId }))
  }

  function goNext() {
    if (!isLast) setCurrentIndex((i) => i + 1)
  }

  function goBack() {
    if (!isFirst) setCurrentIndex((i) => i - 1)
  }

  return {
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
  }
}
