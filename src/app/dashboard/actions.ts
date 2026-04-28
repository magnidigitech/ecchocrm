'use server'

import { createClient } from '@/utils/supabase/server'

export async function getDashboardStats() {
  const supabase = await createClient()

  // 1. Get counts
  const { count: leadsCount } = await supabase.from('leads').select('*', { count: 'exact', head: true })
  const { count: studentsCount } = await supabase.from('students').select('*', { count: 'exact', head: true })
  const { count: applicationsCount } = await supabase.from('applications').select('*', { count: 'exact', head: true })
  const { count: offersCount } = await supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'offer_received')

  // 2. Get recent applications
  const { data: recentApplications } = await supabase
    .from('applications')
    .select('*, students(first_name, last_name)')
    .order('created_at', { ascending: false })
    .limit(5)

  // 3. Get recent leads (enquiries)
  const { data: recentLeads } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  // 4. Get today's tasks
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, students(first_name, last_name), leads(first_name, last_name)')
    .eq('is_completed', false)
    .order('due_date', { ascending: true })
    .limit(5)

  return {
    leadsCount: leadsCount || 0,
    studentsCount: studentsCount || 0,
    applicationsCount: applicationsCount || 0,
    offersCount: offersCount || 0,
    recentApplications: recentApplications || [],
    recentLeads: recentLeads || [],
    tasks: tasks || []
  }
}
