'use client'

import * as React from "react"
import { UserPlus, X, Shield, Mail, Check, Loader2 } from "lucide-react"
import { useToast, ToastContainer } from "@/components/ui/toast"
import { inviteTeamMember } from "@/app/dashboard/counselors/actions"

export function InviteCounselor({ tenantId }: { tenantId: string }) {
  const { toasts, showToast, hideToast } = useToast()
  const [isOpen, setIsOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    formData.append('tenant_id', tenantId)
    formData.append('role', 'counselor') // Default to counselor for this view

    const res = await inviteUser(formData)
    if (res.success) {
      showToast("Counselor added successfully!")
      setIsOpen(false)
      window.location.reload()
    } else {
      showToast(res.error || "Failed to add counselor", "error")
    }
    setIsSubmitting(false)
  }

  return (
    <>
      <ToastContainer toasts={toasts} hideToast={hideToast} />
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-6 py-3 bg-[var(--brand-primary)] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-[var(--brand-primary-muted)] transition-all active:scale-95 hover:opacity-90"
      >
        <UserPlus className="h-4 w-4" />
        Add New Counselor
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-900/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="flex items-center justify-between p-6 border-b border-zinc-100 bg-zinc-50/50">
              <h3 className="font-extrabold text-zinc-900 tracking-tight flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-[var(--brand-primary)] text-white">
                  <UserPlus className="h-5 w-5" />
                </div>
                Invite Counselor
              </h3>
              <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl hover:bg-white text-zinc-400 transition-all border border-transparent hover:border-zinc-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">First Name</label>
                    <input 
                      name="first_name" 
                      required 
                      placeholder="John"
                      className="w-full h-14 bg-zinc-50 border-none rounded-2xl px-5 text-sm font-bold focus:ring-4 outline-none transition-all"
                      style={{'--tw-ring-color': 'var(--brand-primary)', '--tw-ring-opacity': '0.1'} as any}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Last Name</label>
                    <input 
                      name="last_name" 
                      required 
                      placeholder="Doe"
                      className="w-full h-14 bg-zinc-50 border-none rounded-2xl px-5 text-sm font-bold focus:ring-4 outline-none transition-all"
                      style={{'--tw-ring-color': 'var(--brand-primary)', '--tw-ring-opacity': '0.1'} as any}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Email Address</label>
                  <input 
                    name="email" 
                    type="email" 
                    required 
                    placeholder="counselor@agency.com"
                    className="w-full h-14 bg-zinc-50 border-none rounded-2xl px-5 text-sm font-bold focus:ring-4 outline-none transition-all"
                    style={{'--tw-ring-color': 'var(--brand-primary)', '--tw-ring-opacity': '0.1'} as any}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Set Password</label>
                  <input 
                    name="password" 
                    type="password" 
                    required 
                    placeholder="••••••••"
                    minLength={6}
                    className="w-full h-14 bg-zinc-50 border-none rounded-2xl px-5 text-sm font-bold focus:ring-4 outline-none transition-all"
                    style={{'--tw-ring-color': 'var(--brand-primary)', '--tw-ring-opacity': '0.1'} as any}
                  />
                  <p className="text-[9px] font-bold text-zinc-400 px-1 italic">* Team members can change this after their first login</p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-start gap-3">
                   <Shield className="h-4 w-4 text-zinc-400 mt-0.5" />
                   <p className="text-[10px] font-bold text-zinc-500 leading-relaxed uppercase tracking-wider">
                     New counselors will have access to manage their assigned students, leads, and tasks.
                   </p>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-14 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
                style={{ backgroundColor: 'var(--brand-primary)', boxShadow: '0 20px 40px -10px var(--brand-primary-muted)' }}
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                Send Invitation
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
