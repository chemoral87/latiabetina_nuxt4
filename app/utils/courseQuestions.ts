export interface RawAnswer {
  childId?: string | number
  isCorrect: boolean
  text: string | Record<string, string>
}

export interface RawQuestion {
  id: string | number
  level: string
  question: string | Record<string, string>
  answers: RawAnswer[]
}

/**
 * Normalizes raw quiz JSON (where `question`/`text` are `{ en, es }` objects)
 * into plain strings for a given language, used by the course quiz pages to
 * build the `questionsEn` / `questionsEs` props for `CoursesQuizQuizPage`.
 */
export function normalizeQuestions(questions: RawQuestion[], lang: "en" | "es") {
  return questions.map((question) => ({
    ...question,
    question: (question.question as Record<string, string>)?.[lang] || question.question,
    answers: question.answers.map((answer) => ({
      ...answer,
      text: (answer.text as Record<string, string>)?.[lang] || answer.text,
    })),
  }))
}
