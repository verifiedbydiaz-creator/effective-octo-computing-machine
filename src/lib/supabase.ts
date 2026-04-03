import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Untyped client — we use explicit TypeScript types on query results instead.
// This avoids GenericSchema compatibility issues with the Supabase JS v2 generics.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
