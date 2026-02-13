import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (client) return client
  if (!url || !anonKey) {
    throw new Error(
      'Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env. ' +
      'Obtenha em: Projeto Supabase → Settings → API.'
    )
  }
  client = createClient(url, anonKey)
  return client
}
