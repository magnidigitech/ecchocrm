'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function getTasks() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, students(first_name, last_name), leads(first_name, last_name)')
    .eq('assigned_to', user?.id)
    .order('due_date', { ascending: true })

  return tasks || []
}

export async function createTask(formData: FormData) {
  const supabase = await createClient()

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const dueDate = formData.get('due_date') as string
  const studentId = formData.get('student_id') as string
  const leadId = formData.get('lead_id') as string

  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('tasks')
    .insert({
      title,
      description: description || null,
      due_date: new Date(dueDate).toISOString(),
      student_id: studentId || null,
      lead_id: leadId || null,
      assigned_to: user?.id,
      tenant_id: (await supabase.from('users').select('tenant_id').eq('id', user?.id).single()).data?.tenant_id
    })

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/tasks')
  return { success: true }
}

export async function toggleTaskCompletion(taskId: string, isCompleted: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('tasks')
    .update({ is_completed: isCompleted })
    .eq('id', taskId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/tasks')
  return { success: true }
}
