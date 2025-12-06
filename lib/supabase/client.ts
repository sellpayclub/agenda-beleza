import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars:', { 
      hasUrl: !!supabaseUrl, 
      hasKey: !!supabaseKey 
    })
    throw new Error('Supabase URL and Key são obrigatórios. Verifique as variáveis de ambiente.')
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseKey)
}

