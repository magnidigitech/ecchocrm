'use client'

import { Bell, Search, User } from "lucide-react"

export function Header({ user }: { user: any }) {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-6 dark:bg-zinc-950">
      <div className="flex flex-1 items-center gap-4">
        <form className="w-full max-w-sm">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              type="search"
              placeholder="Search leads, students, or applications..."
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-9"
            />
          </div>
        </form>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative rounded-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
          <Bell className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-600"></span>
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800">
            <User className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
          </div>
          <div className="hidden flex-col md:flex">
            <span className="text-sm font-medium leading-none">{user?.email}</span>
            <span className="text-xs text-zinc-500">Counselor</span>
          </div>
        </div>
      </div>
    </header>
  )
}
