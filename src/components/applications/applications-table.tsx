'use client'

import * as React from "react"
import { ExtendedApplication } from "@/app/dashboard/applications/actions"
import { updateApplicationStatus } from "@/app/dashboard/students/actions"
import { format } from "date-fns"
import { Search, ChevronDown, Building2, Globe2, BookOpen, Clock, Loader2, Filter, ExternalLink, GraduationCap } from "lucide-react"
import Link from "next/link"
import { useToast, ToastContainer } from "@/components/ui/toast"

export function ApplicationsTable({ initialApplications }: { initialApplications: ExtendedApplication[] }) {
  const { toasts, showToast, hideToast } = useToast()
  const [applications, setApplications] = React.useState<ExtendedApplication[]>(initialApplications)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [isLoading, setIsLoading] = React.useState<string | null>(null)

  const filteredApplications = applications.filter((app) => {
    const query = search.toLowerCase()
    const studentName = `${app.students?.first_name} ${app.students?.last_name}`.toLowerCase()
    const matchesSearch = studentName.includes(query) || app.university_name.toLowerCase().includes(query)
    const matchesStatus = statusFilter === "all" || app.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleStatusChange = async (appId: string, studentId: string, newStatus: string) => {
    setIsLoading(appId)
    const res = await updateApplicationStatus(appId, studentId, newStatus)
    if (res.success) {
      setApplications(apps => apps.map(app => app.id === appId ? { ...app, status: newStatus as any } : app))
      showToast(`Status updated to ${newStatus.replace('_', ' ')}`)
    } else {
      showToast(res.error || "Update failed", "error")
    }
    setIsLoading(null)
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
    <div className="w-full">
      <ToastContainer toasts={toasts} hideToast={hideToast} />
      
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between p-6 border-b border-zinc-100 bg-white gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="search"
            placeholder="Search student or university..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-12 w-full rounded-2xl border border-zinc-100 bg-zinc-50/50 px-4 py-2 text-sm font-bold shadow-sm focus:ring-4 outline-none pl-11 transition-all"
            style={{ '--tw-ring-color': 'var(--brand-primary)', '--tw-ring-opacity': '0.1' } as any}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 pl-9 pr-8 rounded-xl border border-zinc-100 bg-white text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 transition-all appearance-none min-w-[160px]"
              style={{ '--tw-ring-color': 'var(--brand-primary)', '--tw-ring-opacity': '0.1' } as any}
            >
              <option value="all">All Statuses</option>
              <option value="applied">Applied</option>
              <option value="documents_pending">Documents Pending</option>
              <option value="offer_received">Offer Received</option>
              <option value="visa_processing">Visa Processing</option>
              <option value="visa_granted">Visa Granted</option>
              <option value="visa_rejected">Visa Rejected</option>
              <option value="enrolled">Enrolled</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-sm text-left">
          <thead className="text-[10px] text-zinc-400 bg-zinc-50/50 border-b border-zinc-100 uppercase tracking-widest font-black">
            <tr>
              <th className="px-8 py-5">Student</th>
              <th className="px-8 py-5">University & Course</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5">Last Updated</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {filteredApplications.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-24 text-center">
                   <div className="flex flex-col items-center gap-4 text-zinc-300">
                     <Building2 className="h-12 w-12 opacity-10" />
                     <p className="text-xs font-black uppercase tracking-[0.2em]">No applications match your criteria</p>
                   </div>
                </td>
              </tr>
            ) : (
              filteredApplications.map((app) => (
                <tr 
                  key={app.id} 
                  className="bg-white hover:bg-[var(--brand-primary-light)] transition-colors group cursor-pointer"
                >
                  <td className="px-8 py-6">
                    <Link href={`/dashboard/students/${app.student_id}`} className="flex items-center gap-4">
                      <div className="h-11 w-11 rounded-2xl bg-zinc-100 flex items-center justify-center text-xs font-black text-zinc-500 transition-all shadow-sm group-hover:bg-[var(--brand-primary)] group-hover:text-white">
                        {app.students?.first_name?.[0]}{app.students?.last_name?.[0]}
                      </div>
                      <div>
                        <div className="font-bold text-zinc-900 group-hover:text-[var(--brand-primary)] transition-colors leading-tight">
                          {app.students?.first_name} {app.students?.last_name}
                        </div>
                        <div className="text-[10px] font-bold text-zinc-400 mt-0.5">{app.students?.email}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm font-black text-zinc-800">
                        <Building2 className="h-3.5 w-3.5 opacity-60" style={{ color: 'var(--brand-primary)' }} />
                        {app.university_name}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><BookOpen className="h-3 w-3" /> {app.course_name}</span>
                        <span className="flex items-center gap-1.5"><Globe2 className="h-3 w-3" /> {app.country}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="relative inline-block">
                      <select 
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, app.student_id, e.target.value)}
                        disabled={isLoading === app.id}
                        className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border-2 cursor-pointer appearance-none outline-none transition-all shadow-sm ${getStatusColor(app.status)}`}
                      >
                        <option value="applied">Applied</option>
                        <option value="documents_pending">Documents Pending</option>
                        <option value="offer_received">Offer Received</option>
                        <option value="visa_processing">Visa Processing</option>
                        <option value="visa_granted">Visa Granted</option>
                        <option value="visa_rejected">Visa Rejected</option>
                        <option value="enrolled">Enrolled</option>
                      </select>
                      {isLoading === app.id && <div className="absolute -right-7 top-2"><Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--brand-primary)]" /></div>}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-zinc-400 tabular-nums font-bold text-xs">
                    {format(new Date(app.created_at), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/dashboard/students/${app.student_id}`}
                        className="p-2.5 rounded-xl border-2 border-zinc-100 text-zinc-400 hover:text-[var(--brand-primary)] hover:bg-[var(--brand-primary-light)] hover:border-[var(--brand-primary-muted)] transition-all active:scale-90"
                        title="View Student Profile"
                      >
                        <GraduationCap className="h-4 w-4" />
                      </Link>
                      <button className="p-2.5 rounded-xl border-2 border-zinc-100 text-zinc-400 hover:text-[var(--brand-primary)] hover:bg-[var(--brand-primary-light)] hover:border-[var(--brand-primary-muted)] transition-all active:scale-90">
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
