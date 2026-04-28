'use client'

import * as React from "react"
import { useRouter } from "next/navigation"
import { createLead } from "@/app/dashboard/leads/actions"
import { Loader2 } from "lucide-react"

export function CreateLeadForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | null>(null)

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.target as HTMLFormElement)
    const result = await createLead(formData)

    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    } else {
      router.push('/dashboard/leads')
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="first_name">
            First Name
          </label>
          <input
            id="first_name"
            name="first_name"
            required
            disabled={isLoading}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="last_name">
            Last Name
          </label>
          <input
            id="last_name"
            name="last_name"
            required
            disabled={isLoading}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="email">
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          disabled={isLoading}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="phone">
          Phone Number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          disabled={isLoading}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="source">
          Lead Source
        </label>
        <select
          id="source"
          name="source"
          disabled={isLoading}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="direct_walkin">Direct Walk-in</option>
          <option value="website">Website</option>
          <option value="education_fair">Education Fair</option>
          <option value="referral">Referral</option>
          <option value="google_ads">Google Ads</option>
          <option value="facebook_ads">Facebook Ads</option>
          <option value="phone_call">Phone Call</option>
          <option value="other">Other</option>
        </select>
      </div>

      {error && (
        <div className="text-sm text-red-500 font-medium">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-4 pt-4 border-t">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isLoading}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-zinc-100 hover:text-zinc-900 h-10 px-4 py-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-emerald-600 text-white hover:bg-emerald-700 h-10 px-4 py-2"
        >
          {isLoading && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Create Lead
        </button>
      </div>
    </form>
  )
}
