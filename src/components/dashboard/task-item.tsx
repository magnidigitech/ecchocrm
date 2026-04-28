'use client'

import * as React from "react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { User, Mail, Phone, Calendar, ArrowUpRight, X, Clock } from "lucide-react"

export function TaskItem({ task }: { task: any }) {
  const router = useRouter()
  const [isLeadModalOpen, setIsLeadModalOpen] = React.useState(false)

  const handleClick = () => {
    if (task.student_id) {
      router.push(`/dashboard/students/${task.student_id}`)
    } else if (task.lead_id) {
      setIsLeadModalOpen(true)
    }
  }

  const relatedName = task.students 
    ? `${task.students.first_name} ${task.students.last_name}`
    : task.leads
    ? `${task.leads.first_name} ${task.leads.last_name}`
    : null

  return (
    <>
      <div 
        onClick={handleClick}
        className="flex items-start gap-4 group cursor-pointer hover:bg-zinc-50 -mx-2 p-2 rounded-2xl transition-all"
      >
        <div className="h-6 w-6 rounded-lg border-2 border-zinc-200 mt-0.5 transition-all group-hover:border-[var(--brand-primary)] group-hover:bg-[var(--brand-primary-light)] flex items-center justify-center">
           {task.student_id ? <User className="h-3 w-3 text-zinc-400 group-hover:text-[var(--brand-primary)]" /> : null}
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-zinc-900 group-hover:text-[var(--brand-primary)] transition-colors">{task.title}</p>
          {task.description && (
            <p className="text-[10px] text-zinc-400 mt-1 whitespace-pre-line leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all">
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1">
              <Clock className="h-3 w-3" /> {format(new Date(task.due_date), 'MMM dd, HH:mm')}
            </p>
            {relatedName && (
              <>
                <span className="text-zinc-300">•</span>
                <p className="text-[10px] font-black text-[var(--brand-primary)] uppercase tracking-widest">{relatedName}</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Lead Quick View Modal */}
      {isLeadModalOpen && task.leads && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-zinc-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
           <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-zinc-100">
              <div className="p-8 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/30">
                 <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[var(--brand-primary)]">
                       <User className="h-6 w-6" />
                    </div>
                    <div>
                       <h3 className="text-lg font-black text-zinc-900 tracking-tight uppercase tracking-tighter">Lead Details</h3>
                       <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Enquiry Quick View</p>
                    </div>
                 </div>
                 <button 
                   onClick={() => setIsLeadModalOpen(false)}
                   className="p-3 rounded-full hover:bg-zinc-100 text-zinc-400 transition-all active:scale-95 border border-zinc-100 shadow-sm"
                 >
                    <X className="h-6 w-6" />
                 </button>
              </div>

              <div className="p-8 space-y-6">
                 <div className="space-y-4">
                    <div className="flex items-center gap-4">
                       <div className="h-14 w-14 rounded-2xl bg-zinc-50 flex items-center justify-center font-black text-lg text-zinc-400 uppercase">
                          {task.leads.first_name[0]}{task.leads.last_name[0]}
                       </div>
                       <div>
                          <h4 className="text-xl font-black text-zinc-900 tracking-tight">{task.leads.first_name} {task.leads.last_name}</h4>
                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-lg inline-block mt-1">Active Enquiry</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 pt-4">
                       <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center gap-3">
                          <Mail className="h-4 w-4 text-zinc-400" />
                          <span className="text-sm font-bold text-zinc-900">{task.leads.email || 'N/A'}</span>
                       </div>
                       <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center gap-3">
                          <Phone className="h-4 w-4 text-zinc-400" />
                          <span className="text-sm font-bold text-zinc-900">{task.leads.phone || 'N/A'}</span>
                       </div>
                    </div>
                 </div>

                 <button 
                   onClick={() => router.push('/dashboard/leads')}
                   className="w-full h-16 rounded-[24px] bg-zinc-900 text-white text-xs font-black uppercase tracking-widest shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                 >
                    Go to Leads Manager
                    <ArrowUpRight className="h-4 w-4" />
                 </button>
              </div>
           </div>
        </div>
      )}
    </>
  )
}
