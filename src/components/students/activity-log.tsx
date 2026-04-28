'use client'

import * as React from "react"
import { Clock, CheckCircle2, FileText, Send, User, MessageSquare, ArrowRight, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { getActivityLogs, logActivity, ActivityLogEntry } from "@/app/dashboard/students/actions"

export function ActivityLog({ studentId }: { studentId: string }) {
  const [logs, setLogs] = React.useState<ActivityLogEntry[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [note, setNote] = React.useState("")

  const loadLogs = React.useCallback(async () => {
    const data = await getActivityLogs(studentId)
    setLogs(data)
    setIsLoading(false)
  }, [studentId])

  React.useEffect(() => {
    loadLogs()
  }, [loadLogs])

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!note.trim() || isSubmitting) return

    setIsSubmitting(true)
    await logActivity(studentId, 'Internal Note', note)
    setNote("")
    await loadLogs()
    setIsSubmitting(false)
  }

  const getIcon = (action: string) => {
    const a = action.toLowerCase()
    if (a.includes('application')) return <Send className="h-4 w-4" />
    if (a.includes('document')) return <FileText className="h-4 w-4" />
    if (a.includes('status')) return <CheckCircle2 className="h-4 w-4" />
    if (a.includes('note')) return <MessageSquare className="h-4 w-4" />
    return <Clock className="h-4 w-4" />
  }

  return (
    <div className="bg-white rounded-[32px] border border-zinc-100 shadow-sm overflow-hidden flex flex-col h-[500px]">
      <div className="p-8 border-b border-zinc-50 bg-zinc-50/30 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight">Activity Log</h3>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Audit trail & history</p>
        </div>
        <div className="h-10 w-10 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-400">
          <Clock className="h-5 w-5" />
        </div>
      </div>

      <div className="flex-1 p-8 overflow-auto">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-300" />
          </div>
        ) : logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-300 gap-4">
             <Clock className="h-10 w-10 opacity-20" />
             <p className="text-[10px] font-black uppercase tracking-widest opacity-40">No activity yet</p>
          </div>
        ) : (
          <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-zinc-100 before:via-zinc-100 before:to-transparent">
            {logs.map((log) => (
              <div key={log.id} className="relative flex items-start gap-6 group">
                <div 
                  className="absolute left-0 mt-1 h-10 w-10 rounded-2xl border-4 border-white flex items-center justify-center transition-all duration-500 z-10"
                  style={{ backgroundColor: 'var(--brand-primary)', color: 'white', boxShadow: '0 10px 20px -5px var(--brand-primary-muted)' }}
                >
                  {getIcon(log.action)}
                </div>
                <div className="pl-14 flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black text-zinc-900 group-hover:text-[var(--brand-primary)] transition-colors">{log.action}</p>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{format(new Date(log.created_at), 'MMM dd, HH:mm')}</span>
                  </div>
                  <p className="text-[11px] font-bold text-zinc-500 leading-relaxed">{log.details}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <div className="h-4 w-4 rounded-full bg-zinc-100 flex items-center justify-center">
                      <User className="h-2 w-2 text-zinc-400" />
                    </div>
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                      {log.users ? `${log.users.first_name} ${log.users.last_name}` : 'System'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-6 bg-zinc-50/50 border-t border-zinc-100">
        <form onSubmit={handleAddNote} className="relative">
          <input 
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={isSubmitting}
            placeholder="Add a internal note..." 
            className="w-full h-12 rounded-2xl border border-zinc-200 bg-white px-4 pr-12 text-xs font-bold focus:ring-4 outline-none transition-all disabled:opacity-50"
            style={{ '--tw-ring-color': 'var(--brand-primary)', '--tw-ring-opacity': '0.1' } as any}
          />
          <button 
            type="submit"
            disabled={isSubmitting || !note.trim()}
            className="absolute right-2 top-2 h-8 w-8 rounded-xl flex items-center justify-center text-white transition-all active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: 'var(--brand-primary)' }}
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          </button>
        </form>
      </div>
    </div>
  )
}
