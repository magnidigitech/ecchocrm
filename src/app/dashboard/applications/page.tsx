import { getAllApplications } from "./actions"
import { ApplicationsTable } from "@/components/applications/applications-table"
import { Building2, Globe2, CheckCircle2, Clock } from "lucide-react"

export default async function ApplicationsPage() {
  const applications = await getAllApplications()

  // Simple stats for the header
  const totalApps = applications.length
  const offersReceived = applications.filter(a => a.status === 'offer_received').length
  const visasGranted = applications.filter(a => a.status === 'visa_granted').length

  return (
    <div className="flex-1 space-y-8 p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-zinc-900">
            University Applications
          </h2>
          <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mt-2">
            Centralized pipeline for all student admissions
          </p>
        </div>
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <StatMini label="Total" value={totalApps} icon={<Building2 className="h-4 w-4" />} />
          <StatMini label="Offers" value={offersReceived} icon={<CheckCircle2 className="h-4 w-4" />} />
          <StatMini label="Visas" value={visasGranted} icon={<Globe2 className="h-4 w-4" />} />
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-[32px] border border-zinc-100 shadow-sm overflow-hidden">
        <ApplicationsTable initialApplications={applications} />
      </div>
    </div>
  )
}

function StatMini({ label, value, icon }: { label: string, value: number, icon: React.ReactNode }) {
  return (
    <div 
      className="px-5 py-3 rounded-2xl border flex items-center gap-3 transition-all hover:scale-105"
      style={{ 
        backgroundColor: 'var(--brand-primary-light)', 
        borderColor: 'var(--brand-primary-muted)',
        color: 'var(--brand-primary)'
      }}
    >
      <div className="opacity-70">{icon}</div>
      <div>
        <div className="text-xl font-black leading-none text-zinc-900">{value}</div>
        <div className="text-[9px] font-black uppercase tracking-widest mt-1 opacity-60 text-zinc-500">{label}</div>
      </div>
    </div>
  )
}
