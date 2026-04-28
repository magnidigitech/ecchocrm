import { createClient } from '@/utils/supabase/server'
import { SettingsForm } from '@/components/settings/settings-form'
import { Settings, Shield, User } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function SettingsPage() {
  const supabase = await createClient()

  // 1. Get current user
  const { data: { user } } = await supabase.auth.getUser()

  // 2. Fetch the tenant data
  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .maybeSingle()

  return (
    <div className="flex-1 space-y-8 p-8 max-w-7xl mx-auto bg-[#fafafa]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-zinc-900 flex items-center gap-3">
             <div className="h-10 w-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center">
               <Settings className="h-5 w-5" />
             </div>
             Settings
          </h2>
          <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mt-2">
            Configure your whitelabel agency workspace
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Main Configuration */}
        <div className="lg:col-span-8 space-y-12">
           <SettingsForm tenant={tenant} />
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white rounded-[32px] border border-zinc-100 shadow-sm p-8 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-zinc-50">
                <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                   <User className="h-5 w-5" />
                </div>
                <h3 className="font-black text-zinc-900 text-sm uppercase tracking-tight">Your Profile</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Email Address</p>
                  <p className="text-sm font-bold text-zinc-900">{user?.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Account Role</p>
                  <span className="inline-flex px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                    {user?.user_metadata?.role || 'Administrator'}
                  </span>
                </div>
              </div>
           </div>

           <div className="bg-zinc-900 rounded-[32px] p-8 text-white space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-black tracking-tight">Security First</h3>
              <p className="text-xs font-medium text-zinc-400 leading-relaxed">
                All tenant data is isolated using Row Level Security (RLS). Your agency's data is never shared with other instances.
              </p>
           </div>
        </div>
      </div>
    </div>
  )
}
