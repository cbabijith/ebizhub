export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'admin' | 'user'
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role?: 'admin' | 'user'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'admin' | 'user'
          created_at?: string
        }
      }
      clubs: {
        Row: {
          id: string
          name: string
          description: string
          location: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          location: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          location?: string
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string
          date: string
          location: string
          club_id: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          date: string
          location: string
          club_id: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          date?: string
          location?: string
          club_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
