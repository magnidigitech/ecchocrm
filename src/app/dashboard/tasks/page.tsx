import { getTasks } from './actions'
import { CalendarView } from '@/components/tasks/calendar-view'
import { Bell } from 'lucide-react'

export default async function TasksPage() {
  const tasks = await getTasks()

  return (
    <div className="flex-1 space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
            <Bell className="h-6 w-6" style={{ color: 'var(--brand-primary)' }} />
            Reminders & Follow-ups
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            Stay on top of your lead and student follow-ups with a consolidated schedule.
          </p>
        </div>
      </div>

      <CalendarView initialTasks={tasks} />
    </div>
  )
}
