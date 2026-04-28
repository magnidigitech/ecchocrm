'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  FileText, 
  Building2,
  UserSquare2,
  CheckSquare,
  CalendarDays,
  FolderOpen,
  CircleDollarSign,
  BarChart3,
  Megaphone,
  Settings,
  Gift
} from "lucide-react"
import Image from "next/image"

const sidebarNavItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Leads", href: "/dashboard/leads", icon: Users },
  { title: "Students", href: "/dashboard/students", icon: GraduationCap },
  { title: "Applications", href: "/dashboard/applications", icon: FileText },
  { title: "Universities", href: "/dashboard/universities", icon: Building2 },
  { title: "Team", href: "/dashboard/counselors", icon: Users },
  { title: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
  { title: "Appointments", href: "/dashboard/appointments", icon: CalendarDays },
  { title: "Documents", href: "/dashboard/documents", icon: FolderOpen },
  { title: "Finance", href: "/dashboard/finance", icon: CircleDollarSign },
  { title: "Reports", href: "/dashboard/reports", icon: BarChart3 },
  { title: "Marketing", href: "/dashboard/marketing", icon: Megaphone },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar({ tenant }: { tenant: any }) {
  const pathname = usePathname()
  const logoUrl = tenant?.logo_url || "/images/eccho.png"
  const agencyName = tenant?.name || "Eccho Overseas"

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-white dark:bg-zinc-950">
      <div className="flex h-20 items-center justify-center px-4 py-6">
        <div className="relative h-14 w-full">
          {tenant?.logo_url ? (
            <img 
              src={logoUrl} 
              alt={agencyName} 
              className="h-full w-full object-contain object-left"
            />
          ) : (
            <div className="relative h-14 w-40">
              <Image 
                src="/images/eccho.png" 
                alt="Eccho Overseas" 
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-auto py-2 hide-scrollbar">
        <nav className="grid gap-1 px-3">
          {sidebarNavItems.map((item, index) => {
            const isActive = pathname === item.href
              return (
                <Link
                  key={index}
                  href={item.href}
                  style={{
                    backgroundColor: isActive ? 'var(--brand-primary)' : undefined,
                  }}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all text-[11px] font-black uppercase tracking-widest ${
                    isActive 
                      ? "text-white shadow-xl shadow-zinc-900/10" 
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'var(--brand-primary-light)'
                  }
                  }
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <item.icon 
                    className="h-4 w-4" 
                    style={{ color: isActive ? 'white' : 'inherit' }}
                  />
                  <span>{item.title}</span>
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="mt-auto p-6">
          <div 
            className="rounded-[24px] border p-5 relative overflow-hidden group cursor-pointer transition-all hover:scale-[1.02]"
            style={{ 
              backgroundColor: 'var(--brand-primary-light)',
              borderColor: 'var(--brand-primary-muted)'
            }}
          >
            <div className="mb-2 flex items-center gap-2">
              <h4 className="font-black text-zinc-900 text-[10px] uppercase tracking-widest">Refer & Earn</h4>
            </div>
            <p className="text-[9px] font-bold text-zinc-500 mb-4 pr-4 leading-relaxed uppercase tracking-wider">
              Refer students and earn exciting rewards.
            </p>
            <button 
              className="w-full rounded-xl py-2.5 text-[9px] font-black uppercase tracking-widest transition-all text-white shadow-lg"
              style={{ backgroundColor: 'var(--brand-primary)' }}
            >
              Refer Now
            </button>
            <Gift 
              className="absolute -bottom-2 -right-2 h-16 w-16 opacity-10 transition-transform group-hover:scale-110"
              style={{ color: 'var(--brand-primary)' }}
            />
          </div>
        </div>
    </div>
  )
}
