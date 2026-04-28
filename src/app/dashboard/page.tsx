import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, GraduationCap, FileText, PlaneTakeoff, ChevronDown, CheckCircle2, Circle, MoreVertical, Calendar, Bell, ArrowUpRight } from "lucide-react"
import { getDashboardStats } from "./actions"
import { format } from "date-fns"
import Link from "next/link"
import { CreateTaskModal } from "@/components/dashboard/create-task-modal"
import { TaskItem } from "@/components/dashboard/task-item"

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  return (
    <div className="flex-1 space-y-8 p-8 max-w-7xl mx-auto bg-[#fafafa]">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-zinc-900">
            Dashboard Overview
          </h2>
          <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mt-1">
            Real-time insights into your CRM pipeline
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white border border-zinc-200 px-4 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-zinc-500 shadow-sm flex items-center gap-2">
            <Calendar className="h-4 w-4 text-emerald-600" />
            {format(new Date(), 'MMMM dd, yyyy')}
          </div>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          title="Total Leads" 
          value={stats.leadsCount} 
          icon={<Users className="h-6 w-6" />} 
          trend="+12%" 
        />
        <MetricCard 
          title="Active Students" 
          value={stats.studentsCount} 
          icon={<GraduationCap className="h-6 w-6" />} 
          trend="+5%" 
        />
        <MetricCard 
          title="Applications" 
          value={stats.applicationsCount} 
          icon={<FileText className="h-6 w-6" />} 
          trend="+8%" 
        />
        <MetricCard 
          title="Offers Received" 
          value={stats.offersCount} 
          icon={<CheckCircle2 className="h-6 w-6" />} 
          trend="+22%" 
        />
      </div>

      <div className="grid gap-8 md:grid-cols-12">
        {/* Recent Applications */}
        <Card className="md:col-span-8 rounded-[32px] border-zinc-100 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between p-8 pb-4">
            <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2 uppercase tracking-tighter">
              Recent Applications
              <span className="h-6 px-2 rounded-full bg-zinc-100 text-[10px] font-black text-zinc-500 flex items-center justify-center">Live</span>
            </CardTitle>
            <Link 
              href="/dashboard/students" 
              className="text-xs font-black uppercase tracking-widest flex items-center gap-1 transition-colors"
              style={{ color: 'var(--brand-primary)' }}
            >
              View All <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] text-zinc-400 bg-zinc-50/50 uppercase tracking-widest font-black">
                  <tr>
                    <th className="px-8 py-4">Student</th>
                    <th className="px-8 py-4">University</th>
                    <th className="px-8 py-4">Course</th>
                    <th className="px-8 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {stats.recentApplications.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-12 text-center text-zinc-400 font-bold uppercase text-[10px] tracking-widest">No recent applications</td>
                    </tr>
                  ) : (
                    stats.recentApplications.map((app: any) => (
                      <tr key={app.id} className="hover:bg-zinc-50/50 transition-colors group cursor-pointer">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-zinc-100 flex items-center justify-center text-xs font-black text-zinc-500 group-hover:bg-[var(--brand-primary)] group-hover:text-white transition-all">
                              {app.students?.first_name?.[0]}{app.students?.last_name?.[0]}
                            </div>
                            <div className="font-bold text-zinc-900 group-hover:text-[var(--brand-primary)] transition-colors">{app.students?.first_name} {app.students?.last_name}</div>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-zinc-500 font-bold text-xs">{app.university_name}</td>
                        <td className="px-8 py-5 text-zinc-500 font-bold text-xs">{app.course_name}</td>
                        <td className="px-8 py-5">
                          {/* Application Status Badge - Meaningful Color Preserved */}
                          <span className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-100">
                            {app.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Tasks/Reminders */}
        <Card className="md:col-span-4 rounded-[32px] border-zinc-100 shadow-sm overflow-hidden flex flex-col bg-white">
          <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-black tracking-tight flex items-center gap-3 uppercase tracking-tighter">
              <div 
                className="h-10 w-10 rounded-2xl flex items-center justify-center text-white"
                style={{ backgroundColor: 'var(--brand-primary)' }}
              >
                <Bell className="h-5 w-5" />
              </div>
              Reminders
            </CardTitle>
            <CreateTaskModal />
          </CardHeader>
          <CardContent className="p-8 pt-4 flex-1">
            <div className="space-y-6">
              {stats.tasks.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-zinc-300 gap-2">
                  <CheckCircle2 className="h-8 w-8 opacity-20" />
                  <p className="text-[10px] font-black uppercase tracking-widest">All caught up!</p>
                </div>
              ) : (
                stats.tasks.map((task: any) => (
                  <TaskItem key={task.id} task={task} />
                ))
              )}
            </div>
            <Link 
              href="/dashboard/tasks" 
              className="mt-12 block w-full py-4 rounded-2xl border-2 border-zinc-100 text-center text-[10px] font-black uppercase tracking-widest text-zinc-500 transition-all hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
            >
              View Full Calendar
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid gap-8 md:grid-cols-12">
        {/* Recent Enquiries */}
        <Card className="md:col-span-12 rounded-[32px] border-zinc-100 shadow-sm overflow-hidden bg-white">
           <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-black tracking-tight uppercase tracking-tighter">Recent Enquiries</CardTitle>
              <Link 
                href="/dashboard/leads" 
                className="text-xs font-black uppercase tracking-widest transition-colors"
                style={{ color: 'var(--brand-primary)' }}
              >Manage All</Link>
           </CardHeader>
           <CardContent className="p-8 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                 {stats.recentLeads.map((lead: any) => (
                   <div 
                     key={lead.id} 
                     className="p-5 rounded-3xl border border-zinc-100 transition-all group cursor-pointer hover:border-[var(--brand-primary-muted)] hover:bg-[var(--brand-primary-light)]"
                   >
                      <div className="flex items-center justify-between mb-4">
                        <div className="h-10 w-10 rounded-2xl bg-zinc-50 flex items-center justify-center font-black text-zinc-400 group-hover:bg-[var(--brand-primary)] group-hover:text-white transition-all">
                          {lead.first_name?.[0]}{lead.last_name?.[0]}
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                          {format(new Date(lead.created_at), 'MMM dd')}
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-zinc-900 group-hover:text-[var(--brand-primary)] transition-colors">{lead.first_name} {lead.last_name}</h4>
                      <p className="text-[10px] font-bold text-zinc-500 mt-1 truncate">{lead.email || 'No email'}</p>
                      <div className="mt-4 flex items-center gap-2">
                         <span className="px-2 py-1 rounded-lg bg-zinc-100 text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:bg-white group-hover:shadow-sm">
                           {lead.source || 'Direct'}
                         </span>
                      </div>
                   </div>
                 ))}
              </div>
           </CardContent>
        </Card>
      </div>
    </div>
  )
}

function MetricCard({ title, value, icon, trend }: { title: string, value: number, icon: React.ReactNode, trend: string }) {
  return (
    <Card className="rounded-[32px] border-zinc-100 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <CardContent className="p-8">
        <div className="flex items-start justify-between">
          <div 
            className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg text-white"
            style={{ backgroundColor: 'var(--brand-primary)', boxShadow: '0 10px 20px -5px var(--brand-primary-muted)' }}
          >
            {icon}
          </div>
          <span 
            className="text-[10px] font-black px-2 py-1 rounded-lg"
            style={{ color: 'var(--brand-primary)', backgroundColor: 'var(--brand-primary-light)' }}
          >
            {trend}
          </span>
        </div>
        <div className="mt-6">
          <p className="text-xs font-black text-zinc-400 uppercase tracking-[0.1em]">{title}</p>
          <div className="text-4xl font-black text-zinc-900 mt-2">{value}</div>
        </div>
      </CardContent>
    </Card>
  )
}
