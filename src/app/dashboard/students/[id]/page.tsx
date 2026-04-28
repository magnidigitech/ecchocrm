'use client'

import * as React from "react"
import { getStudentDetails } from '../actions'
import { notFound } from 'next/navigation'
import { StudentHeader } from '@/components/students/student-header'
import { ApplicationPipeline } from '@/components/students/application-pipeline'
import { StudentDocuments } from '@/components/students/student-documents'
import { AcademicDetails } from '@/components/students/academic-details'
import { ActivityLog } from '@/components/students/activity-log'
import { Loader2 } from 'lucide-react'

export default function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const [student, setStudent] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [refreshKey, setRefreshKey] = React.useState(0)

  const studentId = React.use(params).id

  const loadData = React.useCallback(async () => {
    const data = await getStudentDetails(studentId)
    if (!data) notFound()
    setStudent(data)
    setIsLoading(false)
  }, [studentId])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const triggerRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  if (isLoading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-zinc-200" />
    </div>
  )

  return (
    <div className="flex-1 space-y-6 p-6 max-w-7xl mx-auto">
      {/* Student Header & Quick Actions */}
      <StudentHeader student={student} onActivity={triggerRefresh} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Details & Academic */}
        <div className="lg:col-span-1 space-y-6">
          <AcademicDetails student={student} onActivity={triggerRefresh} />
          <StudentDocuments studentId={student.id} onActivity={triggerRefresh} />
        </div>

        {/* Right Column: Applications Pipeline & Activity Log */}
        <div className="lg:col-span-2 space-y-6">
          <ApplicationPipeline 
            studentId={student.id} 
            studentPhone={student.phone}
            initialApplications={student.applications} 
            onActivity={triggerRefresh}
          />
          <ActivityLog studentId={student.id} key={refreshKey} />
        </div>
      </div>
    </div>
  )
}
