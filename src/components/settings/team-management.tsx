'use client'

import * as React from "react"
import { User, Shield, UserPlus, Mail, Phone, MoreHorizontal, Trash2, ShieldCheck, ShieldAlert } from "lucide-react"
import { useToast, ToastContainer } from "@/components/ui/toast"

export function TeamManagement({ initialUsers, tenantId }: { initialUsers: any[], tenantId: string }) {
  const { toasts, showToast, hideToast } = useToast()
  const [users, setUsers] = React.useState(initialUsers)
  const [isInviteModalOpen, setIsInviteModalOpen] = React.useState(false)

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'superadmin':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest"><ShieldAlert className="h-3 w-3" /> Super Admin</span>
      case 'admin':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest border border-blue-100"><ShieldCheck className="h-3 w-3" /> Admin</span>
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-600 text-[10px] font-black uppercase tracking-widest border border-zinc-200"><User className="h-3 w-3" /> Counselor</span>
    }
  }

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} hideToast={hideToast} />
      
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight">Team Members</h3>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Manage staff and permissions</p>
        </div>
        <button 
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--brand-primary)] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-[var(--brand-primary-muted)] transition-all active:scale-95 hover:opacity-90"
        >
          <UserPlus className="h-4 w-4" />
          Add Member
        </button>
      </div>

      <div className="bg-white rounded-[32px] border border-zinc-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-50/50 border-b border-zinc-100">
            <tr>
              <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Name & Role</th>
              <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Contact</th>
              <th className="px-8 py-4 text-right text-[10px] font-black text-zinc-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {users.map((user) => (
              <tr key={user.id} className="group hover:bg-zinc-50/30 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 border border-zinc-200 group-hover:bg-[var(--brand-primary)] group-hover:text-white group-hover:border-[var(--brand-primary)] transition-all">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-zinc-900">{user.first_name} {user.last_name}</div>
                      <div className="mt-1.5">{getRoleBadge(user.role)}</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-600">
                      <Mail className="h-3 w-3 opacity-50" />
                      {user.email}
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400">
                        <Phone className="h-3 w-3 opacity-50" />
                        {user.phone}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <button className="p-2 text-zinc-300 hover:text-zinc-600 rounded-lg hover:bg-white border border-transparent hover:border-zinc-100 transition-all">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="flex items-center justify-between p-6 border-b border-zinc-100 bg-zinc-50/50">
              <h3 className="font-extrabold text-zinc-900 tracking-tight flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-[var(--brand-primary)] text-white">
                  <UserPlus className="h-5 w-5" />
                </div>
                Add Team Member
              </h3>
              <button onClick={() => setIsInviteModalOpen(false)} className="p-2 rounded-xl hover:bg-white text-zinc-400 transition-all border border-transparent hover:border-zinc-100">
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
            <form 
              onSubmit={async (e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                formData.append('tenant_id', tenantId)
                const { inviteUser } = await import("@/app/dashboard/settings/actions")
                const res = await inviteUser(formData)
                if (res.success) {
                  showToast("Team member added successfully!")
                  setIsInviteModalOpen(false)
                  // In a real app we'd refresh the list
                  window.location.reload()
                } else {
                  showToast(res.error || "Failed to add member", "error")
                }
              }} 
              className="p-8 space-y-6"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">First Name</label>
                  <input name="first_name" required className="w-full h-12 rounded-2xl border border-zinc-100 bg-zinc-50/50 px-4 text-sm font-bold focus:ring-4 outline-none transition-all" style={{'--tw-ring-color': 'var(--brand-primary)', '--tw-ring-opacity': '0.1'} as any} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Last Name</label>
                  <input name="last_name" required className="w-full h-12 rounded-2xl border border-zinc-100 bg-zinc-50/50 px-4 text-sm font-bold focus:ring-4 outline-none transition-all" style={{'--tw-ring-color': 'var(--brand-primary)', '--tw-ring-opacity': '0.1'} as any} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Email Address</label>
                <input name="email" type="email" required className="w-full h-12 rounded-2xl border border-zinc-100 bg-zinc-50/50 px-4 text-sm font-bold focus:ring-4 outline-none transition-all" style={{'--tw-ring-color': 'var(--brand-primary)', '--tw-ring-opacity': '0.1'} as any} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Role</label>
                <select name="role" className="w-full h-12 rounded-2xl border border-zinc-100 bg-zinc-50/50 px-4 text-sm font-bold focus:ring-4 outline-none transition-all appearance-none" style={{'--tw-ring-color': 'var(--brand-primary)', '--tw-ring-opacity': '0.1'} as any}>
                  <option value="counselor">Counselor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button 
                type="submit" 
                className="w-full h-14 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95"
                style={{ backgroundColor: 'var(--brand-primary)', boxShadow: '0 20px 40px -10px var(--brand-primary-muted)' }}
              >
                Create Member Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
