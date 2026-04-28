'use server'

import { createClient } from '@/utils/supabase/server'
import { Application } from '../students/actions'

export interface ExtendedApplication extends Application {
  students: {
    first_name: string
    last_name: string
    email: string
  }
}

export async function getAllApplications() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('applications')
    .select('*, students(first_name, last_name, email)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all applications:', error)
    return []
  }

  return data as ExtendedApplication[]
}
