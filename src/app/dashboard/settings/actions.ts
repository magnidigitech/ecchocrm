'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function updateTenantSettings(formData: FormData) {
  const supabase = await createClient()

  const id = formData.get('tenantId') as string
  const name = formData.get('name') as string
  const custom_domain = formData.get('customDomain') as string
  const logo_url = formData.get('logoUrl') as string
  const brandColor = formData.get('brandColor') as string
  const leadFollowupThreshold = formData.get('leadFollowupThreshold') as string

  // We are relying on RLS. If the user doesn't belong to this tenant, this update will fail/do nothing.
  const { error } = await supabase
    .from('tenants')
    .update({
      name,
      custom_domain: custom_domain || null,
      logo_url: logo_url || null,
      brand_colors: { primary: brandColor },
      lead_followup_threshold: parseInt(leadFollowupThreshold) || 48,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function inviteUser(formData: FormData) {
  const supabase = await createClient()

  const firstName = formData.get('first_name') as string
  const lastName = formData.get('last_name') as string
  const email = formData.get('email') as string
  const role = formData.get('role') as any
  const tenant_id = formData.get('tenant_id') as string

  // Note: For a real app, you would use supabase.auth.admin.inviteUserByEmail
  // But that requires a service_role key. For this demo, we'll assume the user
  // is already in auth.users or we're just creating the profile.
  // We'll insert into public.users.
  
  const { error } = await supabase
    .from('users')
    .insert({
      id: crypto.randomUUID(), // Placeholder ID for demo
      tenant_id,
      email,
      first_name: firstName,
      last_name: lastName,
      role: role || 'counselor'
    })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/settings')
  return { success: true }
}
