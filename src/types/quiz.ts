export interface AnswerOption {
  id: string
  text: string
}

export interface QuizQuestion {
  id: string
  prompt: string
  answers: AnswerOption[]
}

/** Maps question id -> selected answer id. */
export type QuizAnswers = Record<string, string>
