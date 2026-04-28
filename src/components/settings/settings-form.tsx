'use client'

import * as React from "react"
import { Loader2, Palette, Layout, Globe, Building2, Check, Save } from "lucide-react"
import { updateTenantSettings } from "@/app/dashboard/settings/actions"
import { useToast, ToastContainer } from "@/components/ui/toast"

export function SettingsForm({ tenant }: { tenant: any }) {
  const { toasts, showToast, hideToast } = useToast()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    if (tenant?.id) {
      formData.append('tenantId', tenant.id)
    }

    const result = await updateTenantSettings(formData)
    
    if (result?.error) {
      showToast(result.error, "error")
    } else {
      showToast("Agency settings updated successfully")
    }
    setIsLoading(false)
  }

  if (!tenant) return (
    <div className="bg-white rounded-[32px] border-2 border-dashed border-zinc-200 p-20 text-center space-y-6">
       <div className="h-20 w-20 rounded-3xl bg-zinc-50 text-zinc-300 flex items-center justify-center mx-auto">
         <Building2 className="h-10 w-10" />
       </div>
       <div className="space-y-2">
         <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Workspace Not Found</h3>
         <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest max-w-sm mx-auto leading-loose">
           We couldn't find a consultancy workspace linked to your account. Please contact your administrator to link your account to a tenant.
         </p>
       </div>
    </div>
  )

  return (
    <div className="space-y-8">
      <ToastContainer toasts={toasts} hideToast={hideToast} />
      
      <form onSubmit={onSubmit} className="space-y-8">
        {/* Branding Section */}
        <section className="bg-white rounded-[32px] border border-zinc-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-zinc-50 flex items-center gap-4 bg-zinc-50/30">
            <div className="h-10 w-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight">Agency Branding</h3>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Logo, Colors & Identity</p>
            </div>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Agency Name</label>
                <input
                  name="name"
                  defaultValue={tenant.name}
                  className="w-full h-12 rounded-2xl border border-zinc-200 bg-zinc-50/50 px-4 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Primary Brand Color</label>
                <div className="flex items-center gap-4">
                  <input
                    name="brandColor"
                    type="color"
                    defaultValue={tenant.brand_colors?.primary || '#10b981'}
                    className="h-12 w-24 rounded-2xl border border-zinc-200 bg-zinc-50/50 p-1 cursor-pointer"
                  />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Select hex code</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Logo URL</label>
              <input
                name="logoUrl"
                type="url"
                defaultValue={tenant.logo_url || ''}
                placeholder="https://your-agency.com/logo.png"
                className="w-full h-12 rounded-2xl border border-zinc-200 bg-zinc-50/50 px-4 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
              />
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Provide a direct link to your agency's logo (PNG or SVG recommended)</p>
            </div>
          </div>
        </section>

  
        {/* Automation Section */}
        <section className="bg-white rounded-[32px] border border-zinc-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-zinc-50 flex items-center gap-4 bg-zinc-50/30">
            <div className="h-10 w-10 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center">
              <Layout className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight">CRM Automation</h3>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Smart Reminders & Stale Lead Detection</p>
            </div>
          </div>
  
          <div className="p-8 space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Stale Lead Threshold (Hours)</label>
              <div className="flex items-center gap-4">
                <input
                  name="leadFollowupThreshold"
                  type="number"
                  defaultValue={tenant.lead_followup_threshold || 48}
                  className="h-12 w-32 rounded-2xl border border-zinc-200 bg-zinc-50/50 px-4 text-sm font-bold focus:ring-4 focus:ring-[var(--brand-primary)]/10 focus:border-[var(--brand-primary)] outline-none transition-all"
                />
                <div className="flex-1">
                   <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-relaxed">
                     Leads in "New" status will automatically generate a follow-up task if not contacted within this time window. 
                     Recommended: 24 to 48 hours.
                   </p>
                </div>
              </div>
            </div>
          </div>
        </section>
  
        {/* Domain Section */}
        <section className="bg-white rounded-[32px] border border-zinc-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-zinc-50 flex items-center gap-4 bg-zinc-50/30">
            <div className="h-10 w-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight">Domain & URL</h3>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Access your CRM</p>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Subdomain (Permanent)</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-12 rounded-2xl border border-zinc-100 bg-zinc-100/50 px-4 flex items-center text-sm font-bold text-zinc-500">
                  {tenant.subdomain}
                </div>
                <div className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">.ecchocrm.com</div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Custom Domain (Optional)</label>
              <input
                name="customDomain"
                defaultValue={tenant.custom_domain || ''}
                placeholder="crm.youragency.com"
                className="w-full h-12 rounded-2xl border border-zinc-200 bg-zinc-50/50 px-4 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
              />
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Requires CNAME configuration in your DNS settings</p>
            </div>
          </div>
        </section>

        {/* Action Button */}
        <div className="flex justify-end pt-4">
           <button 
             disabled={isLoading}
             className="h-14 px-10 rounded-[24px] bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-95 shadow-2xl shadow-zinc-900/30 flex items-center gap-3"
           >
             {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
             Save Agency Settings
           </button>
        </div>
      </form>
    </div>
  )
}
