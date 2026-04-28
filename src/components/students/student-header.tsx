'use client'

import * as React from "react"
import { Student, updateStudent } from "@/app/dashboard/students/actions"
import { ArrowLeft, Mail, Phone, MapPin, Edit2, Share2, X, Check, Loader2 } from "lucide-react"
import Link from "next/link"
import { useToast, ToastContainer } from "@/components/ui/toast"

export function StudentHeader({ student, onActivity }: { student: Student, onActivity?: () => void }) {
  const { toasts, showToast, hideToast } = useToast()
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
  const [isUpdating, setIsUpdating] = React.useState(false)

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    showToast("Profile link copied to clipboard!")
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsUpdating(true)
    const formData = new FormData(e.currentTarget)
    const data = {
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      nationality: formData.get('nationality'),
    }

    const res = await updateStudent(student.id, data)
    if (res.success) {
      showToast("Profile updated successfully")
      setIsEditModalOpen(false)
      if (onActivity) onActivity()
    } else {
      showToast(res.error || "Update failed", "error")
    }
    setIsUpdating(false)
  }

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} hideToast={hideToast} />
      
      <Link 
        href="/dashboard/students" 
        className="flex items-center gap-2 text-xs font-black text-zinc-400 hover:text-[var(--brand-primary)] transition-colors uppercase tracking-[0.2em]"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to Students
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div 
            className="h-20 w-20 rounded-3xl text-white flex items-center justify-center text-3xl font-black border-4 border-white animate-in zoom-in-50 duration-500"
            style={{ backgroundColor: 'var(--brand-primary)', boxShadow: '0 20px 40px -10px var(--brand-primary-muted)' }}
          >
            {student.first_name?.[0]}{student.last_name?.[0]}
          </div>
          <div className="space-y-1.5">
            <h1 className="text-4xl font-black text-zinc-900 tracking-tight">
              {student.first_name} {student.last_name}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-zinc-400 uppercase tracking-widest">
              <span className="flex items-center gap-2 hover:text-zinc-600 transition-colors cursor-pointer">
                <Mail className="h-4 w-4 opacity-70" style={{ color: 'var(--brand-primary)' }} /> {student.email}
              </span>
              <span className="flex items-center gap-2 hover:text-zinc-600 transition-colors cursor-pointer">
                <Phone className="h-4 w-4 opacity-70" style={{ color: 'var(--brand-primary)' }} /> {student.phone}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 opacity-70" style={{ color: 'var(--brand-primary)' }} /> {student.nationality || 'Nationality not set'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleShare}
            className="px-6 py-3 rounded-2xl border-2 border-zinc-100 bg-white text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-all active:scale-95 shadow-sm"
          >
            <Share2 className="h-3.5 w-3.5 inline mr-2" /> Share Profile
          </button>
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="px-6 py-3 rounded-2xl bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-95 shadow-2xl shadow-zinc-900/20"
          >
            <Edit2 className="h-3.5 w-3.5 inline mr-2" /> Edit Profile
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-900/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="flex items-center justify-between p-8 border-b border-zinc-100 bg-zinc-50/50">
              <h3 className="font-black text-zinc-900 tracking-tight text-xl uppercase tracking-tighter">Edit Student Profile</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 rounded-xl hover:bg-white text-zinc-400 transition-all border border-transparent hover:border-zinc-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">First Name</label>
                  <input 
                    name="first_name" 
                    defaultValue={student.first_name} 
                    className="w-full h-12 rounded-2xl border border-zinc-200 bg-zinc-50/50 px-4 text-sm font-bold focus:ring-4 outline-none transition-all" 
                    style={{'--tw-ring-color': 'var(--brand-primary)', '--tw-ring-opacity': '0.1'} as any}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Last Name</label>
                  <input 
                    name="last_name" 
                    defaultValue={student.last_name} 
                    className="w-full h-12 rounded-2xl border border-zinc-200 bg-zinc-50/50 px-4 text-sm font-bold focus:ring-4 outline-none transition-all" 
                    style={{'--tw-ring-color': 'var(--brand-primary)', '--tw-ring-opacity': '0.1'} as any}
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Email Address</label>
                <input 
                  name="email" 
                  defaultValue={student.email} 
                  className="w-full h-12 rounded-2xl border border-zinc-200 bg-zinc-50/50 px-4 text-sm font-bold focus:ring-4 outline-none transition-all" 
                  style={{'--tw-ring-color': 'var(--brand-primary)', '--tw-ring-opacity': '0.1'} as any}
                  type="email" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Phone Number</label>
                <input 
                  name="phone" 
                  defaultValue={student.phone} 
                  className="w-full h-12 rounded-2xl border border-zinc-200 bg-zinc-50/50 px-4 text-sm font-bold focus:ring-4 outline-none transition-all" 
                  style={{'--tw-ring-color': 'var(--brand-primary)', '--tw-ring-opacity': '0.1'} as any}
                  type="tel" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Nationality</label>
                <input 
                  name="nationality" 
                  defaultValue={student.nationality} 
                  className="w-full h-12 rounded-2xl border border-zinc-200 bg-zinc-50/50 px-4 text-sm font-bold focus:ring-4 outline-none transition-all" 
                  style={{'--tw-ring-color': 'var(--brand-primary)', '--tw-ring-opacity': '0.1'} as any}
                />
              </div>
              
              <button 
                disabled={isUpdating} 
                type="submit" 
                className="w-full h-14 rounded-2xl text-white text-sm font-black transition-all active:scale-[0.98] uppercase tracking-widest flex items-center justify-center gap-2 shadow-2xl"
                style={{ backgroundColor: 'var(--brand-primary)', boxShadow: '0 20px 40px -10px var(--brand-primary-muted)' }}
              >
                {isUpdating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
