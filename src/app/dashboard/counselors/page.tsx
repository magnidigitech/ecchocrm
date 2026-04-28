import { createClient } from "@/utils/supabase/server"
import { Users, UserPlus, GraduationCap, CheckSquare, TrendingUp } from "lucide-react"
import { CounselorsList } from "@/components/counselors/counselors-list"
import { InviteCounselor } from "@/components/counselors/invite-counselor"

export default async function CounselorsPage() {
  const supabase = await createClient()
  
  // Fetch current user and tenant
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('users')
    .select('tenant_id, role')
    .eq('id', currentUser?.id)
    .single()

  if (profile?.role !== 'admin' && profile?.role !== 'superadmin') {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <p className="text-zinc-500 font-black uppercase tracking-widest">Access Denied</p>
      </div>
    )
  }

  // Fetch all team members for this tenant
  const { data: teamMembers } = await supabase
    .from('users')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .in('role', ['admin', 'counselor'])
    .order('role', { ascending: true })
    .order('first_name', { ascending: true })

  // Fetch student counts per counselor
  const { data: studentCounts } = await supabase
    .from('students')
    .select('assigned_to')
    .eq('tenant_id', profile.tenant_id)

  const teamWithStats = (teamMembers || []).map(member => ({
    ...member,
    studentCount: studentCounts?.filter(s => s.assigned_to === member.id).length || 0
  }))

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
            <Users className="h-8 w-8" style={{ color: 'var(--brand-primary)' }} />
            Team Hub
          </h1>
          <p className="text-zinc-500 font-bold mt-1 uppercase text-[10px] tracking-widest">Manage your entire team & track performance</p>
        </div>
        <InviteCounselor tenantId={profile.tenant_id} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
            icon={Users} 
            label="Total Team" 
            value={teamMembers?.length || 0} 
            sub="Active Members" 
        />
        <StatCard 
            icon={GraduationCap} 
            label="Total Students" 
            value={studentCounts?.length || 0} 
            sub="Across all team" 
        />
        <StatCard 
            icon={TrendingUp} 
            label="Avg. Conversion" 
            value="24%" 
            sub="+5% this month" 
        />
        <StatCard 
            icon={CheckSquare} 
            label="Tasks Pending" 
            value="42" 
            sub="Due this week" 
        />
      </div>

      <div className="bg-white rounded-[32px] border border-zinc-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/30">
          <div className="flex items-center gap-4">
             <div className="h-10 w-10 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-400">
               <Users className="h-5 w-5" />
             </div>
             <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight">Team Directory</h3>
          </div>
        </div>
        <CounselorsList initialCounselors={teamWithStats} />
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub }: any) {
  return (
    <div className="bg-white p-8 rounded-[32px] border border-zinc-100 shadow-sm space-y-4 hover:scale-[1.02] transition-all cursor-default group">
      <div className="flex items-center justify-between">
        <div className="p-3.5 rounded-2xl bg-zinc-50 text-zinc-400 group-hover:bg-[var(--brand-primary-light)] group-hover:text-[var(--brand-primary)] transition-colors">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div>
        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{label}</p>
        <div className="flex items-end gap-2 mt-1">
          <h2 className="text-2xl font-black text-zinc-900">{value}</h2>
        </div>
        <p className="text-[9px] font-bold text-zinc-400 mt-1">{sub}</p>
      </div>
    </div>
  )
}
