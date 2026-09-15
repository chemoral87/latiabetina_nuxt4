import type { PaginatedResponse } from './common'

export interface Assistance {
  id: number
  org_id: number
  assistance_date: string
  service_time: '09:45' | '12:00' | '20:00'
  adults: number
  teens: number
  kids: number
  babies: number
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface CreateAssistance {
  org_id: number
  assistance_date: string
  service_time: '09:45' | '12:00' | '20:00'
  adults: number
  teens: number
  kids: number
  babies: number
  notes?: string | null
}

export interface UpdateAssistance {
  org_id?: number
  assistance_date?: string
  service_time?: '09:45' | '12:00' | '20:00'
  adults?: number
  teens?: number
  kids?: number
  babies?: number
  notes?: string | null
}

export interface AssistanceListResponse extends PaginatedResponse<Assistance> {
  data: Assistance[]
}
