'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // White-label tenant fields
  const consultancyName = formData.get('consultancyName') as string
  const subdomain = formData.get('subdomain') as string

  // User fields
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Sign up the user and pass the tenant metadata
  // We will rely on a Supabase Postgres Trigger to create the tenant and profile automatically
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        is_new_tenant: true,
        tenant_name: consultancyName,
        tenant_subdomain: subdomain,
        role: 'superadmin'
      }
    }
  })

  if (error) {
    return { error: error.message }
  }

  // Usually we'd redirect to an email confirmation page or dashboard
  redirect('/dashboard')
}
