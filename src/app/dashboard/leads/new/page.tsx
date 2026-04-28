import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CreateLeadForm } from "@/components/leads/create-lead-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NewLeadPage() {
  return (
    <div className="flex-1 space-y-6 p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/leads" 
          className="p-2 rounded-full hover:bg-zinc-200 transition-colors text-zinc-500"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Add New Lead</h2>
          <p className="text-sm text-zinc-500 mt-1">
            Manually enter a prospective student into the pipeline.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lead Information</CardTitle>
          <CardDescription>All new leads will start in the "New" status stage.</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateLeadForm />
        </CardContent>
      </Card>
    </div>
  )
}
