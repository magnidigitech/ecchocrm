'use client'

import * as React from "react"
import { Student } from "@/app/dashboard/students/actions"
import { format } from "date-fns"
import { Search, ChevronDown, MoreHorizontal, User, Mail, Phone, ExternalLink, Bell, X, Trash2, Check, Clock, Calendar } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast, ToastContainer } from "@/components/ui/toast"

export function StudentsTable({ initialStudents }: { initialStudents: Student[] }) {
  const router = useRouter()
  const { toasts, showToast, hideToast } = useToast()
  const [search, setSearch] = React.useState("")
  const [openActionId, setOpenActionId] = React.useState<string | null>(null)
  const [openUpwards, setOpenUpwards] = React.useState(false)
  const [followUpStudent, setFollowUpStudent] = React.useState<Student | null>(null)
  const actionRef = React.useRef<HTMLTableCellElement>(null)

  const handleActionClick = (event: React.MouseEvent, studentId: string) => {
    event.stopPropagation()
    if (openActionId === studentId) {
      setOpenActionId(null)
      return
    }
    
    const rect = event.currentTarget.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const dropdownHeight = 150 // Estimated height
    
    setOpenUpwards(spaceBelow < dropdownHeight)
    setOpenActionId(studentId)
  }

  // Handle outside clicks
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (actionRef.current && !actionRef.current.contains(event.target as Node)) {
        setOpenActionId(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredStudents = initialStudents.filter((student) => {
    const query = search.toLowerCase()
    const fullName = `${student.first_name} ${student.last_name}`.toLowerCase()
    return (
      fullName.includes(query) || 
      (student.email && student.email.toLowerCase().includes(query)) ||
      (student.phone && student.phone.toLowerCase().includes(query))
    )
  })

  return (
    <div className="w-full">
      <ToastContainer toasts={toasts} hideToast={hideToast} />
      
      {/* Table Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-100 bg-white">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="search"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-1 text-sm font-bold shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:border-[var(--brand-primary)] pl-10 transition-all"
            style={{ '--tw-ring-color': 'var(--brand-primary)', '--tw-ring-opacity': '0.1' } as any}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-sm text-left">
          <thead className="text-[10px] text-zinc-400 bg-zinc-50/50 border-b border-zinc-100 uppercase tracking-[0.1em] font-extrabold">
            <tr>
              <th className="px-6 py-4">Student</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Education</th>
              <th className="px-6 py-4">Nationality</th>
              <th className="px-6 py-4">Enrolled On</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center text-zinc-400">
                  <div className="flex flex-col items-center gap-3">
                     <User className="h-10 w-10 opacity-20" />
                     <p className="text-xs font-black uppercase tracking-widest">No students found</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr 
                  key={student.id} 
                  onClick={() => router.push(`/dashboard/students/${student.id}`)}
                  className="bg-white hover:bg-[var(--brand-primary-light)] transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-zinc-100 text-zinc-600 font-black text-xs shrink-0 border border-zinc-200 group-hover:bg-[var(--brand-primary)] group-hover:text-white transition-all duration-300 shadow-sm">
                        {student.first_name?.[0]}{student.last_name?.[0]}
                      </div>
                      <div className="font-bold text-zinc-900 group-hover:text-[var(--brand-primary)] transition-colors leading-tight">
                        {student.first_name} {student.last_name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-900 font-bold text-xs">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3 w-3 opacity-70" style={{ color: 'var(--brand-primary)' }} />
                        <span>{student.email || '—'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-zinc-500 font-bold text-[10px] tracking-tight">
                        <Phone className="h-3 w-3 opacity-50" />
                        <span>{student.phone || '—'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-zinc-600 text-xs font-bold bg-zinc-100 px-2 py-1 rounded-lg border border-zinc-200 uppercase tracking-tighter">
                      {student.current_education || 'Not specified'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-zinc-500 text-xs font-bold flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 opacity-50" />
                      {student.nationality || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500 tabular-nums text-xs font-bold">
                    {format(new Date(student.created_at), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 text-right relative" ref={openActionId === student.id ? actionRef : null}>
                    <div className="flex items-center justify-end gap-1">
                       <button 
                        onClick={(e) => { e.stopPropagation(); setFollowUpStudent(student); }}
                        className="text-zinc-400 hover:text-[var(--brand-primary)] p-2.5 rounded-xl hover:bg-[var(--brand-primary-light)] transition-all active:scale-90"
                        title="Add Follow-up"
                      >
                        <Bell className="h-4 w-4" />
                      </button>
                       <Link 
                         href={`/dashboard/students/${student.id}`}
                         onClick={(e) => e.stopPropagation()}
                         className="p-2.5 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-[var(--brand-primary)] transition-all active:scale-90"
                         title="View Profile"
                       >
                         <ExternalLink className="h-4 w-4" />
                       </Link>
                       <button 
                        onClick={(e) => handleActionClick(e, student.id)}
                        className="text-zinc-400 hover:text-zinc-900 p-2.5 rounded-xl hover:bg-zinc-100 transition-all active:scale-90"
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </div>

                    {openActionId === student.id && (
                      <div 
                        className={`absolute right-6 ${openUpwards ? 'bottom-12' : 'top-12'} mt-1 w-48 rounded-2xl border border-zinc-200 bg-white p-2 shadow-2xl z-20 text-left animate-in fade-in slide-in-from-${openUpwards ? 'bottom' : 'top'}-2 duration-300 overflow-hidden`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link 
                          href={`/dashboard/students/${student.id}`}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold hover:bg-zinc-50 text-zinc-700 transition-all"
                        >
                          <User className="h-4 w-4 opacity-70" /> View Profile
                        </Link>
                        <div className="h-px bg-zinc-50 my-1 mx-2" />
                        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold hover:bg-red-50 text-red-600 transition-all">
                          <Trash2 className="h-4 w-4 opacity-70" /> Archive Student
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Follow-up Modal */}
      {followUpStudent && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-zinc-900/70 backdrop-blur-md animate-in fade-in duration-300 p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="flex items-center justify-between p-6 border-b border-zinc-100 bg-zinc-50/50">
              <h3 className="font-extrabold text-zinc-900 tracking-tight flex items-center gap-2.5">
                <div 
                  className="h-9 w-9 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: 'var(--brand-primary)' }}
                >
                  <Bell className="h-5 w-5" />
                </div>
                Schedule Follow-up
              </h3>
              <button onClick={() => setFollowUpStudent(null)} className="p-2 rounded-xl hover:bg-white text-zinc-400 transition-all border border-transparent hover:border-zinc-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form 
              onSubmit={async (e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const { createTask } = await import("@/app/dashboard/tasks/actions")
                const res = await createTask(formData)
                if (res.success) {
                  showToast("Follow-up reminder set successfully!")
                  setFollowUpStudent(null)
                } else {
                  showToast(res.error || "Failed to set reminder", "error")
                }
              }} 
              className="p-8 space-y-6"
            >
              <input type="hidden" name="student_id" value={followUpStudent.id} />
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em]">Follow-up for</label>
                <div className="text-base font-extrabold text-zinc-900">{followUpStudent.first_name} {followUpStudent.last_name}</div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em]">Task Title</label>
                <input 
                  name="title" 
                  placeholder="e.g. Discuss visa documents" 
                  className="w-full h-12 rounded-2xl border border-zinc-200 bg-zinc-50/50 px-4 text-sm font-bold focus:ring-4 outline-none transition-all"
                  style={{ '--tw-ring-color': 'var(--brand-primary)', '--tw-ring-opacity': '0.1' } as any}
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em]">Due Date & Time</label>
                <input 
                  name="due_date" 
                  type="datetime-local" 
                  className="w-full h-12 rounded-2xl border border-zinc-200 bg-zinc-50/50 px-4 text-sm font-bold focus:ring-4 outline-none transition-all tabular-nums"
                  style={{ '--tw-ring-color': 'var(--brand-primary)', '--tw-ring-opacity': '0.1' } as any}
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em]">Description & Context</label>
                <textarea 
                  name="description" 
                  defaultValue={`Student: ${followUpStudent.first_name} ${followUpStudent.last_name}\nPhone: ${followUpStudent.phone || 'N/A'}\nEmail: ${followUpStudent.email || 'N/A'}\nNationality: ${followUpStudent.nationality || 'N/A'}`}
                  className="w-full h-32 rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4 text-sm font-bold focus:ring-4 outline-none transition-all resize-none" 
                  style={{ '--tw-ring-color': 'var(--brand-primary)', '--tw-ring-opacity': '0.1' } as any}
                />
              </div>

              <button 
                type="submit" 
                className="w-full h-14 rounded-2xl text-white text-sm font-black shadow-2xl transition-all active:scale-[0.98] uppercase tracking-widest flex items-center justify-center gap-2"
                style={{ backgroundColor: 'var(--brand-primary)', boxShadow: '0 20px 40px -10px var(--brand-primary-muted)' }}
              >
                <Check className="h-5 w-5" />
                Set Reminder
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
