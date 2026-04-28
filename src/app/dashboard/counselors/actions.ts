'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function inviteTeamMember(formData: FormData) {
  const supabase = await createClient()
  const adminClient = createAdminClient()

  const firstName = formData.get('first_name') as string
  const lastName = formData.get('last_name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = formData.get('role') as any
  const tenantId = formData.get('tenant_id') as string

  // Check if service key is configured
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { error: "SUPABASE_SERVICE_ROLE_KEY is not configured in .env.local. Please add it to enable real account creation." }
  }

  // 1. Create real Auth user
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm so they can login immediately
    user_metadata: { first_name: firstName, last_name: lastName, role: role || 'counselor' }
  })

  if (authError) return { error: `Auth Error: ${authError.message}` }

  // 2. Create Profile in public.users
  const { error: profileError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      tenant_id: tenantId,
      email,
      first_name: firstName,
      last_name: lastName,
      role: role || 'counselor'
    })

  if (profileError) {
    // Cleanup auth user if profile creation fails
    await adminClient.auth.admin.deleteUser(authData.user.id)
    return { error: `Profile Error: ${profileError.message}` }
  }

  revalidatePath('/dashboard/counselors')
  return { success: true }
}

export async function deleteTeamMember(userId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/counselors')
  return { success: true }
}
