'use client'

import * as React from "react"
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from "date-fns"
import { ChevronLeft, ChevronRight, Bell, Clock, MoreHorizontal, CheckCircle2, Circle, Plus, X, Loader2, Check, ArrowUpRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { Task, toggleTaskCompletion, createTask } from "@/app/dashboard/tasks/actions"
import { useToast, ToastContainer } from "@/components/ui/toast"

export function CalendarView({ initialTasks }: { initialTasks: any[] }) {
  const router = useRouter()
  const [currentDate, setCurrentDate] = React.useState(new Date())
  const [tasks, setTasks] = React.useState(initialTasks)
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(new Date())
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const { toasts, showToast, hideToast } = useToast()

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  })

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

  const tasksOnSelectedDate = tasks.filter(task => 
    isSameDay(new Date(task.due_date), selectedDate || new Date())
  )

  const handleToggle = async (taskId: string, currentStatus: boolean) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, is_completed: !currentStatus } : t))
    await toggleTaskCompletion(taskId, currentStatus)
  }

  const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const res = await createTask(formData)
    if (res.success) {
      showToast("Reminder scheduled!")
      setIsCreateModalOpen(false)
    } else {
      showToast(res.error || "Failed to create task", "error")
    }
    setIsSubmitting(false)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm relative">
      <ToastContainer toasts={toasts} hideToast={hideToast} />
      
      {/* Calendar Section */}
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-zinc-900 tracking-tight">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Follow-up Schedule</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-2 hover:bg-zinc-100 rounded-lg transition-colors border border-zinc-200 shadow-sm"><ChevronLeft className="h-4 w-4 text-zinc-600" /></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 text-xs font-bold bg-white hover:bg-zinc-50 rounded-lg border border-zinc-200 transition-colors shadow-sm">Today</button>
            <button onClick={nextMonth} className="p-2 hover:bg-zinc-100 rounded-lg transition-colors border border-zinc-200 shadow-sm"><ChevronRight className="h-4 w-4 text-zinc-600" /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 border-t border-l border-zinc-100 rounded-lg overflow-hidden">
          {calendarDays.map((day, idx) => {
            const dayTasks = tasks.filter(t => isSameDay(new Date(t.due_date), day))
            const isCurrentMonth = isSameMonth(day, monthStart)
            const isSelected = isSameDay(day, selectedDate || new Date())
            const today = isToday(day)

            return (
              <div 
                key={idx}
                onClick={() => setSelectedDate(day)}
                className={`min-h-[100px] p-2 border-r border-b border-zinc-100 cursor-pointer transition-all relative ${
                  !isCurrentMonth ? 'bg-zinc-50/50 opacity-40' : 'bg-white hover:bg-[var(--brand-primary-light)]'
                } ${isSelected ? 'bg-[var(--brand-primary-light)]' : ''}`}
              >
                <div 
                  className={`text-xs font-bold h-6 w-6 flex items-center justify-center rounded-full mb-1 transition-all ${
                    today ? 'text-white shadow-lg' : isSelected ? 'text-zinc-900 font-black' : 'text-zinc-600'
                  }`}
                  style={today ? { backgroundColor: 'var(--brand-primary)', boxShadow: '0 5px 15px -5px var(--brand-primary-muted)' } : isSelected ? { color: 'var(--brand-primary)' } : {}}
                >
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1 overflow-hidden">
                  {dayTasks.slice(0, 2).map((task, tidx) => (
                    <div 
                      key={tidx} 
                      className={`text-[9px] px-1.5 py-0.5 rounded border truncate font-bold uppercase tracking-tighter ${
                        task.is_completed ? 'bg-zinc-100 text-zinc-400 border-zinc-200 line-through' : 'bg-white shadow-sm'
                      }`}
                      style={!task.is_completed ? { color: 'var(--brand-primary)', borderColor: 'var(--brand-primary-muted)' } : {}}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 2 && (
                    <div className="text-[9px] font-bold" style={{ color: 'var(--brand-primary)' }}>
                      + {dayTasks.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Reminders Panel */}
      <div className="w-full lg:w-80 bg-zinc-50/50 border-l border-zinc-100 p-6 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" style={{ color: 'var(--brand-primary)' }} />
            <h3 className="font-bold text-zinc-900 text-sm">Reminders</h3>
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="p-1.5 text-white rounded-lg transition-all active:scale-95 shadow-lg"
            style={{ backgroundColor: 'var(--brand-primary)', boxShadow: '0 10px 20px -5px var(--brand-primary-muted)' }}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-1">Schedule for</p>
          <p className="text-sm font-bold text-zinc-900">{format(selectedDate || new Date(), 'EEEE, MMMM do')}</p>
        </div>

        <div className="flex-1 space-y-3 overflow-auto hide-scrollbar">
          {tasksOnSelectedDate.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
              <div className="h-12 w-12 rounded-full bg-white border border-zinc-200 flex items-center justify-center shadow-sm">
                 <Clock className="h-6 w-6 text-zinc-300" />
              </div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">No follow-ups set</p>
            </div>
          ) : (
            tasksOnSelectedDate.map(task => (
              <div 
                key={task.id} 
                className={`p-4 rounded-xl border transition-all group ${
                  task.is_completed ? 'bg-zinc-100 border-zinc-200 opacity-60' : 'bg-white border-zinc-200 shadow-sm hover:border-emerald-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button 
                    onClick={() => handleToggle(task.id, task.is_completed)}
                    className="mt-0.5 shrink-0"
                  >
                    {task.is_completed 
                      ? <CheckCircle2 className="h-5 w-5" style={{ color: 'var(--brand-primary)' }} /> 
                      : <Circle className="h-5 w-5 text-zinc-300 transition-colors" />
                    }
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold leading-tight ${task.is_completed ? 'text-zinc-500 line-through' : 'text-zinc-900'}`}>{task.title}</p>
                    <p className="text-[10px] text-zinc-500 mt-1 whitespace-pre-line leading-relaxed">{task.description || 'No description'}</p>
                    
                    {(task.student_id || task.lead_id) && (
                      <button 
                        onClick={() => router.push(task.student_id ? `/dashboard/students/${task.student_id}` : '/dashboard/leads')}
                        className="mt-3 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all hover:gap-2 active:scale-95"
                        style={{ color: 'var(--brand-primary)' }}
                      >
                        {task.student_id ? 'View Student Profile' : 'Manage Lead'}
                        <ArrowUpRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Creation Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
           <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 border border-zinc-100">
              <div className="p-8 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/30">
                 <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[var(--brand-primary)]">
                       <Plus className="h-6 w-6" />
                    </div>
                    <div>
                       <h3 className="text-lg font-black text-zinc-900 tracking-tight uppercase tracking-tighter">Schedule Reminder</h3>
                       <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">For {format(selectedDate || new Date(), 'MMM dd')}</p>
                    </div>
                 </div>
                 <button onClick={() => setIsCreateModalOpen(false)} className="p-3 rounded-full hover:bg-zinc-100 text-zinc-400 transition-all active:scale-95 border border-zinc-100 shadow-sm"><X className="h-6 w-6" /></button>
              </div>

              <form onSubmit={handleCreateTask} className="p-8 space-y-6">
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Task Title</label>
                       <input name="title" required placeholder="e.g., Follow up on visa application" className="w-full h-14 bg-zinc-50 border-none rounded-2xl px-5 text-sm font-bold focus:ring-4 outline-none transition-all" style={{'--tw-ring-color': 'var(--brand-primary)', '--tw-ring-opacity': '0.1'} as any} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Due Time</label>
                       <input name="due_date" type="datetime-local" required defaultValue={new Date((selectedDate || new Date()).setHours(10,0)).toISOString().slice(0, 16)} className="w-full h-14 bg-zinc-50 border-none rounded-2xl px-5 text-sm font-bold focus:ring-4 outline-none transition-all" style={{'--tw-ring-color': 'var(--brand-primary)', '--tw-ring-opacity': '0.1'} as any} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Description</label>
                       <textarea name="description" placeholder="Any specific notes..." className="w-full h-24 bg-zinc-50 border-none rounded-2xl p-5 text-sm font-bold focus:ring-4 outline-none transition-all resize-none" style={{'--tw-ring-color': 'var(--brand-primary)', '--tw-ring-opacity': '0.1'} as any} />
                    </div>
                 </div>

                 <button type="submit" disabled={isSubmitting} className="w-full h-16 rounded-[24px] bg-[var(--brand-primary)] text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-[var(--brand-primary-muted)] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3">
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                    Confirm Reminder
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  )
}
