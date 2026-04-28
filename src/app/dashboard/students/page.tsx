import { getStudents } from './actions'
import { StudentsTable } from '@/components/students/students-table'
import { GraduationCap } from 'lucide-react'

export default async function StudentsPage() {
  const students = await getStudents()

  return (
    <div className="flex-1 space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
            <GraduationCap className="h-6 w-6" style={{ color: 'var(--brand-primary)' }} />
            Student Directory
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            Manage enrolled students and track their global university applications.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <StudentsTable initialStudents={students} />
      </div>
    </div>
  )
}
