'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

// Interface based on our SQL schema
export interface Lead {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  status: 'new' | 'contacted' | 'in_progress' | 'converted' | 'lost'
  source: string
  created_at: string
}

export async function getLeads() {
  const supabase = await createClient()

  // 1. Get current user and their role
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user?.id)
    .single()

  const query = supabase.from('leads').select('*')

  // 2. Apply Role-Based Filtering
  // Only admins/superadmins see everything. Counselors only see assigned leads.
  if (profile?.role === 'counselor') {
    query.eq('assigned_to', user?.id)
  }

  const { data: leads, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching leads:', error)
    return []
  }

  return leads as Lead[]
}

export async function createLead(formData: FormData) {
  const supabase = await createClient()

  const firstName = formData.get('first_name') as string
  const lastName = formData.get('last_name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const source = formData.get('source') as string

  // We don't need to specify tenant_id because RLS handles the constraint, 
  // wait, our RLS policy enforces tenant_id matches the user's tenant_id, 
  // BUT we must supply it during INSERT. Let's fetch it first via auth metadata.
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // Actually, we can fetch the tenant_id via the SQL function we created, 
  // or look it up from the users table.
  const { data: userProfile } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', user?.id)
    .single()

  if (!userProfile?.tenant_id) {
    return { error: 'User is not associated with a tenant' }
  }

  const { error } = await supabase
    .from('leads')
    .insert({
      tenant_id: userProfile.tenant_id,
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      source,
      status: 'new'
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/leads')
  return { success: true }
}

export async function updateLeadStatus(leadId: string, newStatus: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('leads')
    .update({ status: newStatus })
    .eq('id', leadId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/leads')
  return { success: true }
}

export async function updateLead(leadId: string, data: any) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('leads')
    .update(data)
    .eq('id', leadId)
    
  if (error) return { error: error.message }
  
  revalidatePath('/dashboard/leads')
  return { success: true }
}

export async function bulkCreateLeads(leadsData: any[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: userProfile } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', user?.id)
    .single()

  if (!userProfile?.tenant_id) return { error: 'No tenant found' }

  const formattedLeads = leadsData.map(lead => ({
    tenant_id: userProfile.tenant_id,
    first_name: lead.first_name || lead.firstName || lead.Name?.split(' ')[0] || 'Unknown',
    last_name: lead.last_name || lead.lastName || lead.Name?.split(' ').slice(1).join(' ') || '',
    email: lead.email || lead.Email || null,
    phone: lead.phone || lead.Phone?.toString() || null,
    source: lead.source || lead.Source || 'direct_walkin',
    status: 'new'
  }))

  const { error } = await supabase.from('leads').insert(formattedLeads)
  if (error) return { error: error.message }
  
  revalidatePath('/dashboard/leads')
  return { success: true }
}

export async function processStaleLeads() {
  const supabase = await createClient()
  
  // 1. Get tenant threshold
  const { data: tenant } = await supabase.from('tenants').select('id, lead_followup_threshold').maybeSingle()
  if (!tenant) return { count: 0 }
  
  const thresholdHours = tenant.lead_followup_threshold || 48
  const cutoff = new Date()
  cutoff.setHours(cutoff.getHours() - thresholdHours)
  
  // 2. Find "new" leads older than cutoff
  const { data: staleLeads } = await supabase
    .from('leads')
    .select('id, first_name, last_name, tenant_id')
    .eq('status', 'new')
    .lt('created_at', cutoff.toISOString())
    
  if (!staleLeads || staleLeads.length === 0) return { count: 0 }
  
  // 3. For each stale lead, check if they already have a pending follow-up task
  let createdCount = 0
  for (const lead of staleLeads) {
    const { data: existingTask } = await supabase
      .from('tasks')
      .select('id')
      .eq('lead_id', lead.id)
      .eq('status', 'pending')
      .ilike('title', '%Stale Lead%')
      .maybeSingle()
      
    if (!existingTask) {
      const today = new Date()
      await supabase.from('tasks').insert({
        tenant_id: lead.tenant_id,
        lead_id: lead.id,
        title: `🚨 Stale Lead: ${lead.first_name} ${lead.last_name}`,
        description: `This lead has been in "New" status for over ${thresholdHours} hours. High priority follow-up required.`,
        due_date: today.toISOString(),
        status: 'pending'
      })
      createdCount++
    }
  }
  
  if (createdCount > 0) {
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/tasks')
  }
  
  return { count: createdCount }
}
