import { createClient } from '@supabase/supabase-js'

// Default ke localhost jika belum ada konfigurasi ENV
// Masukkan URL dan ANON KEY dari dashboard Supabase Anda ke file .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xyzcompany.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'public-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Autentikasi Login tersinkronisasi dengan Supabase
 * Saat ini aplikasi menggunakan Go Gateway. Fungsi ini dapat diaktifkan 
 * untuk migrasi penuh ke Supabase Authentication.
 */
export const supabaseLogin = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  })
  return { data, error }
}

export const supabaseLogout = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getSupabaseSession = async () => {
  const { data, error } = await supabase.auth.getSession()
  return { data, error }
}
