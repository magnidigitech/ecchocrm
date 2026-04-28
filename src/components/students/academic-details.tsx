'use client'

import * as React from "react"
import { Student, updateStudent } from "@/app/dashboard/students/actions"
import { BookOpen, School, Award, Edit3, X, Check, Loader2 } from "lucide-react"
import { useToast, ToastContainer } from "@/components/ui/toast"

export function AcademicDetails({ student, onActivity }: { student: Student, onActivity?: () => void }) {
  const { toasts, showToast, hideToast } = useToast()
  const [isEditing, setIsEditing] = React.useState(false)
  const [isUpdating, setIsUpdating] = React.useState(false)

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsUpdating(true)
    const formData = new FormData(e.currentTarget)
    const data = {
      current_education: formData.get('current_education'),
      last_institution: formData.get('last_institution'),
      gpa_percentage: formData.get('gpa_percentage'),
    }

    const res = await updateStudent(student.id, data)
    if (res.success) {
      showToast("Academic records updated")
      setIsEditing(false)
      if (onActivity) onActivity()
    } else {
      showToast(res.error || "Update failed", "error")
    }
    setIsUpdating(false)
  }

  return (
    <div className="bg-white rounded-[32px] border border-zinc-100 shadow-sm overflow-hidden">
      <ToastContainer toasts={toasts} hideToast={hideToast} />
      
      <div className="p-8 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/30">
        <div>
          <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight">Academic Background</h3>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Educational Records</p>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="p-2.5 rounded-xl bg-white border border-zinc-200 text-zinc-400 hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary-muted)] transition-all shadow-sm active:scale-90"
        >
          {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
        </button>
      </div>

      <div className="p-8">
        {isEditing ? (
          <form onSubmit={handleUpdate} className="space-y-6 animate-in fade-in duration-300">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Current Education</label>
              <input 
                name="current_education" 
                defaultValue={student.current_education} 
                className="w-full h-12 rounded-2xl border border-zinc-200 bg-zinc-50/50 px-4 text-sm font-bold focus:ring-4 outline-none transition-all" 
                style={{'--tw-ring-color': 'var(--brand-primary)', '--tw-ring-opacity': '0.1'} as any}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Last Institution</label>
              <input 
                name="last_institution" 
                defaultValue={student.last_institution} 
                className="w-full h-12 rounded-2xl border border-zinc-200 bg-zinc-50/50 px-4 text-sm font-bold focus:ring-4 outline-none transition-all" 
                style={{'--tw-ring-color': 'var(--brand-primary)', '--tw-ring-opacity': '0.1'} as any}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">GPA / Percentage</label>
              <input 
                name="gpa_percentage" 
                defaultValue={student.gpa_percentage} 
                className="w-full h-12 rounded-2xl border border-zinc-200 bg-zinc-50/50 px-4 text-sm font-bold focus:ring-4 outline-none transition-all" 
                style={{'--tw-ring-color': 'var(--brand-primary)', '--tw-ring-opacity': '0.1'} as any}
              />
            </div>
            <button 
              disabled={isUpdating} 
              type="submit" 
              className="w-full h-12 rounded-2xl bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-zinc-900/10"
            >
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Update Records
            </button>
          </form>
        ) : (
          <div className="space-y-8">
            <AcademicItem 
              icon={<BookOpen className="h-5 w-5" />} 
              label="Current Education" 
              value={student.current_education || 'Not specified'} 
            />
            <AcademicItem 
              icon={<School className="h-5 w-5" />} 
              label="Last Institution" 
              value={student.last_institution || 'Not specified'} 
            />
            <AcademicItem 
              icon={<Award className="h-5 w-5" />} 
              label="GPA / Percentage" 
              value={student.gpa_percentage || 'Not specified'} 
            />
          </div>
        )}
      </div>
    </div>
  )
}

function AcademicItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-start gap-4 group">
      <div 
        className="h-12 w-12 rounded-2xl bg-zinc-50 text-zinc-400 flex items-center justify-center border border-zinc-100 group-hover:text-white group-hover:border-transparent transition-all duration-300 shadow-sm"
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--brand-primary)'
          e.currentTarget.style.color = 'white'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = ''
          e.currentTarget.style.color = ''
        }}
      >
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{label}</p>
        <p 
          className="text-sm font-bold text-zinc-900 mt-0.5 transition-colors"
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--brand-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = ''}
        >
          {value}
        </p>
      </div>
    </div>
  )
}
