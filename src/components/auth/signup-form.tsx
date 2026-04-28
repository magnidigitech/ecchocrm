'use client'

import * as React from "react"
import { signup } from "@/app/(auth)/signup/actions"
import { Loader2 } from "lucide-react"

export function SignupForm() {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | null>(null)

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.target as HTMLFormElement)
    const result = await signup(formData)
    
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={onSubmit}>
        <div className="grid gap-4">
          {/* Tenant White-Label Details */}
          <div className="grid gap-2 border-b pb-4">
            <h3 className="font-medium text-lg">Consultancy Details</h3>
            
            <label className="text-sm font-medium mt-2" htmlFor="consultancyName">
              Consultancy Name
            </label>
            <input
              id="consultancyName"
              name="consultancyName"
              placeholder="e.g. GlobalEd Advisors"
              type="text"
              required
              disabled={isLoading}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />

            <label className="text-sm font-medium mt-2" htmlFor="subdomain">
              Desired Subdomain
            </label>
            <div className="flex items-center gap-2">
              <input
                id="subdomain"
                name="subdomain"
                placeholder="globaled"
                type="text"
                required
                disabled={isLoading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <span className="text-sm text-zinc-500">.crm.com</span>
            </div>
          </div>

          {/* Admin Details */}
          <div className="grid gap-2">
            <h3 className="font-medium text-lg">Admin Account</h3>
            
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="firstName">First Name</label>
                <input id="firstName" name="firstName" required disabled={isLoading} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="lastName">Last Name</label>
                <input id="lastName" name="lastName" required disabled={isLoading} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
              </div>
            </div>

            <label className="text-sm font-medium mt-2" htmlFor="email">Work Email</label>
            <input
              id="email"
              name="email"
              placeholder="name@consultancy.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              required
              disabled={isLoading}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />

            <label className="text-sm font-medium mt-2" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              disabled={isLoading}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          
          {error && (
            <div className="text-sm text-red-500 font-medium">
              {error}
            </div>
          )}

          <button 
            disabled={isLoading}
            className="mt-4 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-zinc-900 text-zinc-50 hover:bg-zinc-900/90 h-10 px-4 py-2"
          >
            {isLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create CRM Account
          </button>
        </div>
      </form>
    </div>
  )
}
