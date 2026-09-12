export interface Course {
  id: number
  title: string
  description: string
  type: 'practical' | 'theoretical' | 'theological'
  day: number
  order: string
  content: string
  quiz_questions?: QuizQuestion[]
  created_at: string
  updated_at: string
}

export interface QuizQuestion {
  id: number
  question: string
  options: string[]
  correct_answer: number
  explanation: string
  language: 'es' | 'en'
  created_at: string
  updated_at: string
}

export interface CourseListResponse extends PaginatedResponse<Course> {
  data: Course[]
}

export interface QuizSubmission {
  answers: Record<number, number>
  time_spent: number
  language: 'es' | 'en'
}
