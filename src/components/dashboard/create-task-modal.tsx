'use client'

import * as React from "react"
import { Plus, X, Calendar, Type, AlignLeft, User, Loader2, Check } from "lucide-react"
import { createTask } from "@/app/dashboard/tasks/actions"
import { useToast, ToastContainer } from "@/components/ui/toast"

export function CreateTaskModal() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const { toasts, showToast, hideToast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    const res = await createTask(formData)
    
    if (res.success) {
      showToast("Reminder scheduled!")
      setIsOpen(false)
    } else {
      showToast(res.error || "Failed to create task", "error")
    }
    setIsLoading(false)
  }

  return (
    <>
      <ToastContainer toasts={toasts} hideToast={hideToast} />
      <button 
        onClick={() => setIsOpen(true)}
        className="h-10 w-10 rounded-2xl bg-[var(--brand-primary)] text-white flex items-center justify-center shadow-lg shadow-[var(--brand-primary-muted)] transition-all active:scale-95"
      >
        <Plus className="h-6 w-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
           <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 border border-zinc-100">
              <div className="p-8 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/30">
                 <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[var(--brand-primary)]">
                       <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                       <h3 className="text-lg font-black text-zinc-900 tracking-tight uppercase tracking-tighter">Schedule Reminder</h3>
                       <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Set a follow-up for your team</p>
                    </div>
                 </div>
                 <button 
                   onClick={() => setIsOpen(false)}
                   className="p-3 rounded-full hover:bg-zinc-100 text-zinc-400 transition-all active:scale-95 border border-zinc-100 shadow-sm"
                 >
                    <X className="h-6 w-6" />
                 </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1 flex items-center gap-2">
                          <Type className="h-3 w-3" /> Task Title
                       </label>
                       <input 
                         name="title" 
                         required 
                         placeholder="e.g., Call student about visa"
                         className="w-full h-14 bg-zinc-50 border-none rounded-2xl px-5 text-sm font-bold focus:ring-4 outline-none transition-all"
                         style={{'--tw-ring-color': 'var(--brand-primary)', '--tw-ring-opacity': '0.1'} as any}
                       />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1 flex items-center gap-2">
                             <Calendar className="h-3 w-3" /> Due Date
                          </label>
                          <input 
                            name="due_date" 
                            type="datetime-local"
                            required 
                            defaultValue={new Date(Date.now() + 86400000).toISOString().slice(0, 16)}
                            className="w-full h-14 bg-zinc-50 border-none rounded-2xl px-5 text-sm font-bold focus:ring-4 outline-none transition-all"
                            style={{'--tw-ring-color': 'var(--brand-primary)', '--tw-ring-opacity': '0.1'} as any}
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1 flex items-center gap-2">
                             <AlignLeft className="h-3 w-3" /> Priority
                          </label>
                          <select 
                            className="w-full h-14 bg-zinc-50 border-none rounded-2xl px-5 text-sm font-bold focus:ring-4 outline-none transition-all appearance-none"
                            style={{'--tw-ring-color': 'var(--brand-primary)', '--tw-ring-opacity': '0.1'} as any}
                          >
                             <option>Normal</option>
                             <option>High</option>
                             <option>Urgent</option>
                          </select>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1 flex items-center gap-2">
                          <AlignLeft className="h-3 w-3" /> Description
                       </label>
                       <textarea 
                         name="description" 
                         placeholder="Add any specific notes here..."
                         className="w-full h-28 bg-zinc-50 border-none rounded-2xl p-5 text-sm font-bold focus:ring-4 outline-none transition-all resize-none"
                         style={{'--tw-ring-color': 'var(--brand-primary)', '--tw-ring-opacity': '0.1'} as any}
                       />
                    </div>
                 </div>

                 <button 
                   type="submit"
                   disabled={isLoading}
                   className="w-full h-16 rounded-[24px] bg-[var(--brand-primary)] text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-[var(--brand-primary-muted)] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                 >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                    Confirm Schedule
                 </button>
              </form>
           </div>
        </div>
      )}
    </>
  )
}
