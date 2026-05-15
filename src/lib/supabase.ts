import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Profile = {
  id: string
  email: string
  display_name: string
  avatar_url: string
  tirages_restants: number
  total_tirages: number
  referral_code: string
  created_at: string
}

export type Theme = {
  id: string
  slug: string
  name: string
  emoji: string
  description: string
  designs_count: number
  tag: string
}

export type Design = {
  id: string
  theme_id: string
  name: string
  emoji: string
  image_url?: string
  rarity: 'common' | 'legendary'
  probability: number
}

export type Payment = {
  id: string
  user_id: string
  amount: number
  currency: string
  method: 'wave' | 'orange_money'
  status: 'pending' | 'confirmed' | 'failed'
  tirages_added: number
  created_at: string
}

export type Review = {
  id: string
  user_id: string
  rating: number
  comment: string
  created_at: string
  profiles?: { display_name: string; avatar_url: string }
}
