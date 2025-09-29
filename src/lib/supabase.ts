import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gvrprnahgivocthdzrny.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2cnBybmFoZ2l2b2N0aGR6cm55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwODY1OTMsImV4cCI6MjA3NDY2MjU5M30.-hZxFiWT7qk_3z8kejiMjSY8zcPg3KnTaet0LOhEzk4'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types matching your Supabase table structure
export interface Database {
  public: {
    tables: {
      challenges: {
        Row: {
          id: string
          level: 'soft' | 'mild' | 'hot' | 'spicy' | 'kinky'
          kind: 'truth' | 'dare'
          text: string
          gender_for: string[]
          gender_target: string[]
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          level: 'soft' | 'mild' | 'hot' | 'spicy' | 'kinky'
          kind: 'truth' | 'dare'
          text: string
          gender_for?: string[]
          gender_target?: string[]
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          level?: 'soft' | 'mild' | 'hot' | 'spicy' | 'kinky'
          kind?: 'truth' | 'dare'
          text?: string
          gender_for?: string[]
          gender_target?: string[]
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Typed Supabase client
export const supabaseTyped = createClient<Database>(supabaseUrl, supabaseAnonKey)
