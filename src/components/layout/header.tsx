'use client'

import { Bell, Search, Calendar, Menu, ChevronDown, User as UserIcon } from "lucide-react"
import Link from "next/link"

export function Header({ user, tenant, taskCount }: { user: any, tenant: any, taskCount: number }) {
  // Use real user metadata or email
  const userName = user?.user_metadata?.first_name 
    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`
    : user?.email?.split('@')[0] || "User"
  const userRole = user?.user_metadata?.role || "Admin"

  return (
    <header className="flex h-20 items-center justify-between border-b bg-white px-6 dark:bg-zinc-950">
      <div className="flex flex-1 items-center gap-4">
        <button className="text-zinc-500 hover:text-zinc-700">
          <Menu className="h-5 w-5" />
        </button>
        <form className="w-full max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="search"
              placeholder="Search by name, email, phone or university..."
              className="flex h-10 w-full rounded-md border border-zinc-200 bg-zinc-50/50 px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 pl-9"
            />
          </div>
        </form>
      </div>
      <div className="flex items-center gap-6">
        <Link href="/dashboard/tasks" className="relative text-zinc-500 hover:opacity-70 transition-all">
          <Bell className="h-5 w-5" />
          {taskCount > 0 && (
            <span 
              className="absolute -right-1 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white border-2 border-white animate-in zoom-in duration-300"
              style={{ backgroundColor: 'var(--brand-primary)' }}
            >
              {taskCount}
            </span>
          )}
        </Link>
        <button className="text-zinc-500 hover:text-zinc-700 transition-colors">
          <Calendar className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3 border-l pl-6">
          <div 
            className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full shadow-sm border"
            style={{ backgroundColor: 'var(--brand-primary-light)', borderColor: 'var(--brand-primary-muted)' }}
          >
            <UserIcon className="h-5 w-5" style={{ color: 'var(--brand-primary)' }} />
          </div>
          <div className="hidden flex-col md:flex items-start">
            <span className="text-sm font-semibold leading-none text-zinc-900">{userName}</span>
            <span className="text-xs text-zinc-500 mt-1">{userRole}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-zinc-400 ml-1" />
        </div>
      </div>
    </header>
  )
}
