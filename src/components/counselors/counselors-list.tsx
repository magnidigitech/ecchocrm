'use client'

import * as React from "react"
import { Users, GraduationCap, CheckSquare, TrendingUp, MoreVertical, Trash2, Mail, Shield, ShieldCheck, Clock, MessageSquare } from "lucide-react"
import { format } from "date-fns"
import { deleteTeamMember } from "@/app/dashboard/counselors/actions"
import { useToast } from "@/components/ui/toast"

export function CounselorsList({ initialCounselors }: { initialCounselors: any[] }) {
  const [counselors, setCounselors] = React.useState(initialCounselors)
  const { showToast } = useToast()
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null)

  const handleDelete = async (userId: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from the team?`)) return
    
    setIsDeleting(userId)
    const res = await deleteTeamMember(userId)
    if (res.success) {
      showToast("Team member removed")
      setCounselors(counselors.filter(c => c.id !== userId))
    } else {
      showToast(res.error || "Delete failed", "error")
    }
    setIsDeleting(null)
  }

  if (!counselors || counselors.length === 0) {
    return (
      <div className="p-20 text-center flex flex-col items-center gap-4">
        <div className="h-16 w-16 rounded-[24px] bg-zinc-50 flex items-center justify-center text-zinc-300">
          <Shield className="h-8 w-8" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">No counselors invited yet</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-50/50 border-b border-zinc-100">
          <tr>
            <th className="px-8 py-5">Counselor</th>
            <th className="px-8 py-5">Workload</th>
            <th className="px-8 py-5">Status</th>
            <th className="px-8 py-5">Joined</th>
            <th className="px-8 py-5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {counselors.map((c) => (
            <tr key={c.id} className="group hover:bg-[var(--brand-primary-light)] transition-colors cursor-pointer">
              <td className="px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-zinc-100 text-zinc-600 font-black text-xs flex items-center justify-center border border-zinc-200 group-hover:bg-[var(--brand-primary)] group-hover:text-white transition-all shadow-sm">
                    {c.first_name?.[0]}{c.last_name?.[0]}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-zinc-900 group-hover:text-[var(--brand-primary)] transition-colors leading-tight">
                      {c.first_name} {c.last_name}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight flex items-center gap-1.5 mt-1">
                       <Mail className="h-3 w-3" /> {c.email}
                    </span>
                  </div>
                </div>
              </td>
              <td className="px-8 py-6">
                <div className="flex flex-col gap-2">
                   <div className="flex items-center gap-2">
                      <GraduationCap className="h-3.5 w-3.5 text-zinc-400" />
                      <span className="text-xs font-black text-zinc-700">{c.studentCount} Students</span>
                   </div>
                   <div className="w-32 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ 
                          width: `${Math.min(c.studentCount * 5, 100)}%`,
                          backgroundColor: 'var(--brand-primary)' 
                        }} 
                      />
                   </div>
                </div>
              </td>
              <td className="px-8 py-6">
                 <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                    <span className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">Active</span>
                 </div>
              </td>
              <td className="px-8 py-6">
                 <span className="text-xs font-bold text-zinc-500 flex items-center gap-2 tabular-nums">
                    <Clock className="h-3.5 w-3.5 opacity-40" />
                    {format(new Date(c.created_at), 'MMM dd, yyyy')}
                 </span>
              </td>
              <td className="px-8 py-6 text-right">
                <div className="flex items-center justify-end gap-4">
                  <div className="flex items-center gap-2">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                      c.role === 'admin' ? 'bg-zinc-900 text-white' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {c.role === 'admin' ? <ShieldCheck className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{c.role}</p>
                  </div>
                  <div className="w-px h-4 bg-zinc-100 mx-2" />
                  <button 
                    onClick={() => handleDelete(c.id, `${c.first_name} ${c.last_name}`)}
                    className="p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    disabled={isDeleting === c.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
