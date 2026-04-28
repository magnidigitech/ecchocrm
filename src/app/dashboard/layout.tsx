import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { processStaleLeads } from './leads/actions'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Run stale lead check (async, don't block render)
  processStaleLeads().catch(console.error)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  // Fetch tenant for whitelabeling
  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .maybeSingle()

  // Fetch pending tasks count for today
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  const { count: pendingTasksCount } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')
    .gte('due_date', todayStart.toISOString())
    .lte('due_date', todayEnd.toISOString())

  const primaryColor = tenant?.brand_colors?.primary || '#10b981'

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --brand-primary: ${primaryColor};
          --brand-primary-light: ${primaryColor}15;
          --brand-primary-muted: ${primaryColor}30;
        }
      `}} />
      <Sidebar tenant={tenant} />
      <div className="flex w-full flex-1 flex-col overflow-hidden">
        <Header user={user} tenant={tenant} taskCount={pendingTasksCount || 0} />
        <main className="flex-1 overflow-y-auto bg-zinc-50/50 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
