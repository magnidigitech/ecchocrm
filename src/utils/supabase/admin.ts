import { createClient } from '@supabase/supabase-js'

// This client uses the SERVICE_ROLE_KEY and should ONLY be used in Server Actions / Server Components.
// It bypasses Row Level Security (RLS) so it's very powerful.
export const createAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
