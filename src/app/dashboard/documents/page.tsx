import { createClient } from "@/utils/supabase/server"
import { FolderOpen, Search, FileText, Download, Eye, RefreshCw, User } from "lucide-react"
import { DocumentsDirectory } from "@/components/documents/documents-directory"
import { getStudents } from "@/app/dashboard/students/actions"

export default async function DocumentsPage() {
  const students = await getStudents()

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
            <FolderOpen className="h-8 w-8" style={{ color: 'var(--brand-primary)' }} />
            Document Vault
          </h1>
          <p className="text-zinc-500 font-bold mt-1 uppercase text-[10px] tracking-widest">Centralized digital storage for all students</p>
        </div>
      </div>

      <DocumentsDirectory initialStudents={students} />
    </div>
  )
}
