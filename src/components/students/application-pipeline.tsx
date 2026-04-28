'use client'

import * as React from "react"
import { Application, updateApplicationStatus, createApplication } from "@/app/dashboard/students/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Building2, Globe2, BookOpen, Clock, CheckCircle2, ChevronRight, Loader2, X, Check, MessageCircle } from "lucide-react"
import { useToast, ToastContainer } from "@/components/ui/toast"

export function ApplicationPipeline({ studentId, studentPhone, initialApplications, onActivity }: { studentId: string, studentPhone?: string, initialApplications: Application[], onActivity?: () => void }) {
  const { toasts, showToast, hideToast } = useToast()
  const [applications, setApplications] = React.useState<Application[]>(initialApplications || [])
  const [isAdding, setIsAdding] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleWhatsAppShare = (app: Application) => {
    const status = app.status.replace('_', ' ').toUpperCase()
    const message = `*UNIVERSITY UPDATE* \n\n` +
      `Hello! Here is the latest update on your application:\n\n` +
      `*University:* ${app.university_name}\n` +
      `*Course:* ${app.course_name}\n` +
      `*Intake:* ${app.intake}\n` +
      `*Current Status:* ${status}\n\n` +
      `We will keep you posted on the next steps!\n\n` +
      `Thank You\n\n` +
      `_The Eccho Team_`

    const encodedMessage = encodeURIComponent(message)
    let cleanPhone = studentPhone?.replace(/\D/g, '') || ''

    // If it's a 10-digit number, prepend the default Indian country code (91)
    if (cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`
    }

    // Adding &lang=en to force the WhatsApp landing page into English
    window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}&lang=en`, '_blank')
    showToast("Opening WhatsApp...")
  }

  const handleStatusChange = async (appId: string, newStatus: string) => {
    setIsLoading(appId)
    const res = await updateApplicationStatus(appId, studentId, newStatus)
    if (res.success) {
      const app = applications.find(a => a.id === appId)
      setApplications(apps => apps.map(a => a.id === appId ? { ...a, status: newStatus as any } : a))

      showToast(
        `Status updated successfully`,
        'success',
        {
          duration: 10000,
          action: {
            label: "Share update with student via WhatsApp",
            onClick: () => app && handleWhatsAppShare({ ...app, status: newStatus as any })
          }
        }
      )

      if (onActivity) onActivity()
    } else {
      showToast(res.error || "Update failed", "error")
    }
    setIsLoading(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const res = await createApplication(formData)
    if (res.success) {
      showToast("University application submitted successfully!")
      setIsAdding(false)
      if (onActivity) onActivity()
      // Reload is still good to sync the whole state if needed, 
      // but the onActivity will refresh the log immediately.
      window.location.reload()
    } else {
      showToast(res.error || "Submission failed", "error")
    }
    setIsSubmitting(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return "bg-blue-50 text-blue-700 border-blue-200"
      case 'documents_pending': return "bg-zinc-100 text-zinc-700 border-zinc-200"
      case 'offer_received': return "bg-purple-50 text-purple-700 border-purple-200"
      case 'visa_processing': return "bg-orange-50 text-orange-700 border-orange-200"
      case 'visa_granted': return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case 'visa_rejected': return "bg-red-50 text-red-700 border-red-200"
      case 'enrolled': return "bg-emerald-600 text-white border-emerald-700 shadow-sm"
      default: return "bg-zinc-100 text-zinc-700 border-zinc-200"
    }
  }

  return (
    <Card className="rounded-[32px] border-zinc-100 shadow-sm overflow-hidden bg-white">
      <ToastContainer toasts={toasts} hideToast={hideToast} />

      <CardHeader className="flex flex-row items-center justify-between p-8">
        <div>
          <CardTitle className="text-xl font-black tracking-tight uppercase tracking-tighter">University Applications</CardTitle>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Track admissions and visa progress for each university.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg ${isAdding
            ? 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 shadow-none'
            : 'text-white'
            }`}
          style={!isAdding ? { backgroundColor: 'var(--brand-primary)', boxShadow: '0 10px 20px -5px var(--brand-primary-muted)' } : {}}
        >
          {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {isAdding ? 'Cancel' : 'Add Application'}
        </button>
      </CardHeader>

      <CardContent className="p-0">
        {isAdding && (
          <div className="px-8 pb-8 animate-in slide-in-from-top-4 duration-300">
            <form
              onSubmit={handleSubmit}
              className="p-8 bg-zinc-50/50 rounded-[24px] border-2 border-dashed border-zinc-200 space-y-6"
            >
              <input type="hidden" name="student_id" value={studentId} />
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">University Name</label>
                  <input
                    name="university_name"
                    placeholder="e.g. University of Toronto"
                    className="w-full h-12 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-bold focus:ring-4 outline-none transition-all"
                    style={{ '--tw-ring-color': 'var(--brand-primary)', '--tw-ring-opacity': '0.1' } as any}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Course Name</label>
                  <input
                    name="course_name"
                    placeholder="e.g. MBA"
                    className="w-full h-12 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-bold focus:ring-4 outline-none transition-all"
                    style={{ '--tw-ring-color': 'var(--brand-primary)', '--tw-ring-opacity': '0.1' } as any}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Country</label>
                  <input
                    name="country"
                    placeholder="Canada"
                    className="w-full h-12 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-bold focus:ring-4 outline-none transition-all"
                    style={{ '--tw-ring-color': 'var(--brand-primary)', '--tw-ring-opacity': '0.1' } as any}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Intake</label>
                  <input
                    name="intake"
                    placeholder="Fall 2024"
                    className="w-full h-12 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-bold focus:ring-4 outline-none transition-all"
                    style={{ '--tw-ring-color': 'var(--brand-primary)', '--tw-ring-opacity': '0.1' } as any}
                    required
                  />
                </div>
                <div className="flex items-end">
                  <button
                    disabled={isSubmitting}
                    type="submit"
                    className="w-full h-12 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                    style={{ backgroundColor: 'var(--brand-primary)', boxShadow: '0 10px 20px -5px var(--brand-primary-muted)' }}
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Submit Application
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        <div className="divide-y divide-zinc-50 px-8 pb-8">
          {applications.length === 0 ? (
            <div className="py-20 text-center text-zinc-300">
              <Building2 className="h-12 w-12 mx-auto opacity-10 mb-4" />
              <p className="text-xs font-black uppercase tracking-widest opacity-40">No applications added yet</p>
            </div>
          ) : (
            applications.map((app) => (
              <div key={app.id} className="py-8 group">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex gap-6">
                    <div
                      className="h-16 w-16 rounded-[24px] bg-white border border-zinc-100 shadow-sm flex items-center justify-center shrink-0 transition-all duration-300 group-hover:bg-white"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--brand-primary-muted)'
                        e.currentTarget.style.backgroundColor = 'var(--brand-primary-light)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = ''
                        e.currentTarget.style.backgroundColor = ''
                      }}
                    >
                      <Building2 className="h-8 w-8 text-zinc-300 transition-colors" onMouseEnter={(e) => e.currentTarget.style.color = 'var(--brand-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = ''} />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-lg font-black text-zinc-900 transition-colors" onMouseEnter={(e) => e.currentTarget.style.color = 'var(--brand-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = ''}>{app.university_name}</h4>
                      <div className="flex flex-wrap items-center gap-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5 opacity-60" style={{ color: 'var(--brand-primary)' }} /> {app.course_name}</span>
                        <span className="flex items-center gap-1.5"><Globe2 className="h-3.5 w-3.5 opacity-60" style={{ color: 'var(--brand-primary)' }} /> {app.country}</span>
                        <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 opacity-60" style={{ color: 'var(--brand-primary)' }} /> {app.intake}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleWhatsAppShare(app)}
                      className="p-2.5 rounded-xl text-zinc-400 hover:text-[#25D366] hover:bg-[#25D366]/10 transition-all active:scale-90 border border-zinc-100 hover:border-[#25D366]/20 shadow-sm"
                      title="Share via WhatsApp"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </button>
                    <div className="relative">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        disabled={isLoading === app.id}
                        className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border-2 cursor-pointer appearance-none outline-none transition-all shadow-sm ${getStatusColor(app.status)}`}
                      >
                        <option value="applied">Applied</option>
                        <option value="documents_pending">Documents Pending</option>
                        <option value="offer_received">Offer Received</option>
                        <option value="visa_processing">Visa Application Processing</option>
                        <option value="visa_granted">Visa Granted</option>
                        <option value="visa_rejected">Visa Rejected</option>
                        <option value="enrolled">Enrolled</option>
                      </select>
                      {isLoading === app.id && <div className="absolute -right-8 top-2"><Loader2 className="h-4 w-4 animate-spin" style={{ color: 'var(--brand-primary)' }} /></div>}
                    </div>
                  </div>
                </div>

                {/* Visual Progress Bar */}
                <div className="mt-8 flex items-center gap-2">
                  {['applied', 'documents_pending', 'offer_received', 'visa_processing', 'visa_granted', 'visa_rejected', 'enrolled'].map((step, idx) => {
                    const isDone = ['applied', 'documents_pending', 'offer_received', 'visa_processing', 'visa_granted', 'visa_rejected', 'enrolled'].indexOf(app.status) >= ['applied', 'documents_pending', 'offer_received', 'visa_processing', 'visa_granted', 'visa_rejected', 'enrolled'].indexOf(step)
                    return (
                      <React.Fragment key={step}>
                        <div
                          className={`h-2 flex-1 rounded-full transition-all duration-700 ${isDone ? 'shadow-sm' : 'bg-zinc-100'}`}
                          style={isDone ? { backgroundColor: 'var(--brand-primary)', boxShadow: `0 0 10px var(--brand-primary-muted)` } : {}}
                        />
                      </React.Fragment>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
