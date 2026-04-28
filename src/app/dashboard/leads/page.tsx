import { getLeads } from './actions'
import { LeadsTable } from '@/components/leads/leads-table'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function LeadsPage() {
  const leads = await getLeads()

  return (
    <div className="flex-1 space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Leads Management</h2>
          <p className="text-sm text-zinc-500 mt-1">
            Track and manage your prospective students.
          </p>
        </div>
        
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <LeadsTable initialLeads={leads} />
      </div>
    </div>
  )
}
