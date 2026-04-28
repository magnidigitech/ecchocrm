'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  FileText, 
  FolderOpen,
  CheckSquare,
  Settings,
  LogOut
} from "lucide-react"

const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Leads",
    href: "/dashboard/leads",
    icon: Users,
  },
  {
    title: "Students",
    href: "/dashboard/students",
    icon: GraduationCap,
  },
  {
    title: "Applications",
    href: "/dashboard/applications",
    icon: FileText,
  },
  {
    title: "Documents",
    href: "/dashboard/documents",
    icon: FolderOpen,
  },
  {
    title: "Tasks",
    href: "/dashboard/tasks",
    icon: CheckSquare,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-zinc-50 dark:bg-zinc-900">
      <div className="flex h-14 items-center border-b px-4 py-4">
        <div className="flex items-center gap-2 font-semibold tracking-tight">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-900 text-white">
            <GraduationCap className="h-4 w-4" />
          </div>
          <span className="text-lg text-zinc-900 dark:text-zinc-50">StudyCRM</span>
        </div>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-2">
          {sidebarNavItems.map((item, index) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={index}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-zinc-900 dark:hover:text-zinc-50 ${
                  isActive 
                    ? "bg-zinc-200/50 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50" 
                    : "text-zinc-500"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{item.title}</span>
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="mt-auto border-t p-4">
        <form action="/auth/signout" method="post">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-zinc-500 transition-all hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50">
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">Log out</span>
          </button>
        </form>
      </div>
    </div>
  )
}
