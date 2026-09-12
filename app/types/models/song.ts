export interface Song {
  id: number
  title: string
  author: string
  lyrics: string
  key: string | null
  bpm: number | null
  category_id: number | null
  created_at: string
  updated_at: string
  is_active: boolean
}

export interface CreateSong {
  title: string
  author: string
  lyrics: string
  key?: string
  bpm?: number
  category_id?: number
  is_active?: boolean
}

export interface UpdateSong {
  title?: string
  author?: string
  lyrics?: string
  key?: string
  bpm?: number
  category_id?: number
  is_active?: boolean
}

export interface SongListResponse extends PaginatedResponse<Song> {
  data: Song[]
}
