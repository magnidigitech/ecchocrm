'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export interface Student {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  nationality: string
  current_education: string
  last_institution?: string
  gpa_percentage?: string
  academic_background?: any
  created_at: string
}

export interface ActivityLogEntry {
  id: string
  student_id: string
  action: string
  details: string
  user_id: string
  users?: {
    first_name: string
    last_name: string
  }
  created_at: string
  type?: string
}

export interface Application {
  id: string
  student_id: string
  university_name: string
  course_name: string
  country: string
  status: 'applied' | 'documents_pending' | 'offer_received' | 'visa_processing' | 'visa_granted' | 'visa_rejected' | 'enrolled'
  intake: string
  created_at: string
}

// Fetch all students for the tenant
export async function getStudents() {
  const supabase = await createClient()

  // 1. Get current user and their role
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user?.id)
    .single()

  const query = supabase.from('students').select('*')

  // 2. Apply Role-Based Filtering
  if (profile?.role === 'counselor') {
    query.eq('assigned_to', user?.id)
  }

  const { data: students, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching students:', error)
    return []
  }
  return students as Student[]
}

// Fetch a single student with their applications
export async function getStudentDetails(studentId: string) {
  const supabase = await createClient()
  
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('*, applications(*)')
    .eq('id', studentId)
    .single()

  if (studentError) {
    console.error('Error fetching student details:', {
      message: studentError.message,
      details: studentError.details,
      hint: studentError.hint,
      code: studentError.code
    })
    return null
  }
  return student
}

// Update student profile
export async function updateStudent(studentId: string, data: any) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('students')
    .update(data)
    .eq('id', studentId)

  if (error) return { error: error.message }

  // Detect specific changes for better logging
  let logMessage = 'Profile details or academic records were modified'
  if (data.phone) {
     // Fetch old phone to compare if needed, but for now we'll just check if phone was in the update data
     logMessage = 'Profile Update | Number Changed'
  } else if (data.current_education || data.last_institution) {
     logMessage = 'Academic records were updated'
  }

  // Log the activity
  await logActivity(studentId, data.phone ? 'Profile Update' : 'Profile Updated', logMessage)

  revalidatePath(`/dashboard/students/${studentId}`)
  revalidatePath('/dashboard/students')
  return { success: true }
}

// Promote a Lead to a Student
export async function convertLeadToStudent(leadId: string) {
  const supabase = await createClient()

  // 1. Get lead details
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single()

  if (leadError || !lead) return { error: 'Lead not found' }

  // 2. Check if student already exists by email or lead_id
  const { data: existingStudent } = await supabase
    .from('students')
    .select('id')
    .or(`email.eq.${lead.email},lead_id.eq.${lead.id}`)
    .maybeSingle()

  if (existingStudent) {
    return { error: 'Student is already in the list.' }
  }

  // 3. Insert into students table
  const { data: student, error: studentError } = await supabase
    .from('students')
    .insert({
      tenant_id: lead.tenant_id,
      lead_id: lead.id,
      first_name: lead.first_name,
      last_name: lead.last_name,
      email: lead.email,
      phone: lead.phone,
    })
    .select()
    .single()

  if (studentError) return { error: studentError.message }

  // 3. Update lead status to converted
  await supabase
    .from('leads')
    .update({ status: 'converted' })
    .eq('id', leadId)

  // 4. Log the activity
  await logActivity(student.id, 'Student Enrolled', `Lead was promoted to Student from Lead ID: ${leadId}`)

  revalidatePath('/dashboard/leads')
  revalidatePath('/dashboard/students')
  
  return { success: true, studentId: student.id }
}

// Create a new university application
export async function createApplication(formData: FormData) {
  const supabase = await createClient()
  
  const studentId = formData.get('student_id') as string
  const universityName = formData.get('university_name') as string
  const courseName = formData.get('course_name') as string
  const country = formData.get('country') as string
  const intake = formData.get('intake') as string

  const { data: { user } } = await supabase.auth.getUser()
  const { data: userProfile } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', user?.id)
    .single()

  const { error } = await supabase
    .from('applications')
    .insert({
      tenant_id: userProfile?.tenant_id,
      student_id: studentId,
      university_name: universityName,
      course_name: courseName,
      country,
      intake,
      status: 'applied'
    })

  if (error) return { error: error.message }

  // Log the activity
  await logActivity(studentId, 'Application Started', `New application for ${universityName} (${courseName})`)

  revalidatePath(`/dashboard/students/${studentId}`)
  return { success: true }
}

// Update application status
export async function updateApplicationStatus(applicationId: string, studentId: string, status: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('applications')
    .update({ status })
    .eq('id', applicationId)

  if (error) return { error: error.message }

  // Fetch application details for better logging
  const { data: app } = await supabase
    .from('applications')
    .select('university_name, course_name')
    .eq('id', applicationId)
    .single()

  // Log the activity with university and course info
  await logActivity(
    studentId, 
    'Status Changed', 
    `Application for ${app?.university_name || 'University'} (${app?.course_name || 'Course'}) updated to ${status.replace('_', ' ')}`
  )

  revalidatePath(`/dashboard/students/${studentId}`)
  return { success: true }
}

// --- DOCUMENT ACTIONS ---

export async function getStudentDocuments(studentId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

export async function uploadDocument(studentId: string, formData: FormData) {
  const supabase = await createClient()
  const file = formData.get('file') as File
  if (!file) return { error: 'No file provided' }

  // 1. Get user profile for tenant_id
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('users').select('tenant_id').eq('id', user?.id).single()

  // 2. Upload to Storage
  const fileExt = file.name.split('.').pop()
  const fileName = `${studentId}/${Math.random()}.${fileExt}`
  const filePath = `${fileName}`

  const { error: uploadError, data: uploadData } = await supabase.storage
    .from('documents')
    .upload(filePath, file)

  if (uploadError) return { error: uploadError.message }

  // 3. Get Public URL
  const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath)

  // 4. Create database record
  const { error: dbError } = await supabase
    .from('documents')
    .insert({
      tenant_id: profile?.tenant_id,
      student_id: studentId,
      name: file.name,
      file_url: publicUrl,
      document_type: file.type
    })

  if (dbError) return { error: dbError.message }

  // Log the activity
  await logActivity(studentId, 'Document Uploaded', `${file.name} was added to the vault`)

  revalidatePath(`/dashboard/students/${studentId}`)
  return { success: true }
}

export async function deleteDocument(docId: string, studentId: string, fileName?: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', docId)

  if (error) return { error: error.message }

  // Log the activity with the specific filename
  await logActivity(studentId, 'Document Deleted', `File removed from vault: ${fileName || 'Unnamed Document'}`)

  revalidatePath(`/dashboard/students/${studentId}`)
  return { success: true }
}

// --- ACTIVITY LOG ACTIONS ---

export async function logActivity(studentId: string, action: string, details?: string, leadId?: string) {
  const supabase = await createClient()
  
  // Get current user and tenant
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  
  const { data: profile } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  await supabase
    .from('activity_logs')
    .insert({
      tenant_id: profile?.tenant_id,
      student_id: studentId,
      lead_id: leadId,
      user_id: user.id,
      action,
      details
    })
}

export async function getActivityLogs(studentId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*, users(first_name, last_name)')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching activity logs:', error)
    return []
  }
  
  return data as ActivityLogEntry[]
}
