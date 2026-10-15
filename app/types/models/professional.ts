import type { PaginatedList } from './common'

export type ProfessionalStatus = 'unemployed' | 'selfemployed' | 'employed' | 'student' | 'retired'

export interface Professional {
  id: number
  name: string
  last_name: string
  phone_number: string
  title: string
  description?: string | null
  status: ProfessionalStatus
  created_at: string
}

export interface CreateProfessional {
  name: string
  last_name: string
  phone_number: string
  title: string
  description?: string | null
  status: ProfessionalStatus
}

export interface ProfessionalListResponse extends PaginatedList<Professional> {
  data: Professional[]
}
