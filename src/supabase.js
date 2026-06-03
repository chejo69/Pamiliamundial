import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://itjfpiijdkoemvmghnqz.supabase.co'  // ⚠️ Reemplazá con tu Project URL
const supabaseAnonKey = 'sb_publishable_sKXKY2si6wV5BcZYJLbhBA_GmB8b-qa'              // ⚠️ Reemplazá con tu anon public key

export const supabase = createClient(supabaseUrl, supabaseAnonKey)