'use client'

import * as React from "react"
import { Lead, updateLeadStatus, updateLead, bulkCreateLeads } from "@/app/dashboard/leads/actions"
import { format } from "date-fns"
import { Search, ChevronDown, MoreHorizontal, Loader2, Edit, Trash2, Upload, X, Check, AlertCircle, GraduationCap, Bell, Calendar as CalendarIcon, Clock, Plus } from "lucide-react"
import * as XLSX from 'xlsx'
import { useRouter } from "next/navigation"
import { useToast, ToastContainer } from "@/components/ui/toast"

const CRM_FIELDS = [
  { key: 'first_name', label: 'First Name', required: true },
  { key: 'last_name', label: 'Last Name', required: false },
  { key: 'email', label: 'Email', required: false },
  { key: 'phone', label: 'Phone Number', required: false },
  { key: 'source', label: 'Lead Source', required: false },
]

export function LeadsTable({ initialLeads }: { initialLeads: Lead[] }) {
  const router = useRouter()
  const { toasts, showToast, hideToast } = useToast()
  
  const [leads, setLeads] = React.useState<Lead[]>(initialLeads)
  const [search, setSearch] = React.useState("")
  const [updatingId, setUpdatingId] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState<string>("all")
  
  const [openActionId, setOpenActionId] = React.useState<string | null>(null)
  const [openUpwards, setOpenUpwards] = React.useState(false)
  const [isFilterOpen, setIsFilterOpen] = React.useState(false)
  const [editingLead, setEditingLead] = React.useState<Lead | null>(null)
  const [followUpLead, setFollowUpLead] = React.useState<Lead | null>(null)
  const [isImporting, setIsImporting] = React.useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)

  // Import State
  const [importModalOpen, setImportModalOpen] = React.useState(false)
  const [importData, setImportData] = React.useState<any[]>([])
  const [importHeaders, setImportHeaders] = React.useState<string[]>([])
  const [columnMapping, setColumnMapping] = React.useState<Record<string, string>>({})

  const filterRef = React.useRef<HTMLDivElement>(null)
  const actionRef = React.useRef<HTMLTableCellElement>(null)

  const handleActionClick = (event: React.MouseEvent, leadId: string) => {
    if (openActionId === leadId) {
      setOpenActionId(null)
      return
    }
    
    const rect = event.currentTarget.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const dropdownHeight = 220 // Estimated height
    
    setOpenUpwards(spaceBelow < dropdownHeight)
    setOpenActionId(leadId)
  }

  // Handle outside clicks
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false)
      }
      if (actionRef.current && !actionRef.current.contains(event.target as Node)) {
        setOpenActionId(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredLeads = leads.filter((lead) => {
    if (activeTab !== "all" && lead.status !== activeTab) return false;
    const query = search.toLowerCase()
    const fullName = `${lead.first_name} ${lead.last_name}`.toLowerCase()
    return (
      fullName.includes(query) || 
      (lead.email && lead.email.toLowerCase().includes(query)) ||
      (lead.phone && lead.phone.toLowerCase().includes(query))
    )
  })

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    setUpdatingId(leadId)
    setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus as any } : l))
    const res = await updateLeadStatus(leadId, newStatus)
    if (res.success) {
      showToast(`Status updated to ${newStatus}`)
    } else {
      showToast(res.error || 'Failed to update status', 'error')
    }
    setUpdatingId(null)
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingLead) return
    
    const formData = new FormData(e.currentTarget)
    const data = {
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
    }

    setLeads(leads.map(l => l.id === editingLead.id ? { ...l, ...data } as Lead : l))
    setEditingLead(null)
    const res = await updateLead(editingLead.id, data)
    if (res.success) {
      showToast('Lead updated successfully')
    } else {
      showToast(res.error || 'Failed to update lead', 'error')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (evt) => {
      const bstr = evt.target?.result
      const wb = XLSX.read(bstr, { type: 'binary' })
      const wsname = wb.SheetNames[0]
      const ws = wb.Sheets[wsname]
      const data = XLSX.utils.sheet_to_json(ws) as any[]
      
      if (data.length === 0) {
        showToast("The file seems to be empty", "error")
        return
      }

      const headers = Object.keys(data[0])
      setImportHeaders(headers)
      setImportData(data)
      
      const mapping: Record<string, string> = {}
      CRM_FIELDS.forEach(field => {
        const match = headers.find(h => 
          h.toLowerCase().replace(/[^a-z]/g, '') === field.label.toLowerCase().replace(/[^a-z]/g, '') ||
          h.toLowerCase().replace(/[^a-z]/g, '') === field.key.toLowerCase().replace(/[^a-z]/g, '')
        )
        if (match) mapping[field.key] = match
      })
      
      setColumnMapping(mapping)
      setImportModalOpen(true)
      e.target.value = ''
    }
    reader.readAsBinaryString(file)
  }

  const confirmImport = async () => {
    if (!columnMapping['first_name']) {
      showToast("First Name mapping is required", "error")
      return
    }

    setIsImporting(true)
    const formattedData = importData.map(row => {
      const lead: any = {}
      CRM_FIELDS.forEach(field => {
        if (columnMapping[field.key]) {
          lead[field.key] = row[columnMapping[field.key]]
        }
      })
      return lead
    })

    const result = await bulkCreateLeads(formattedData)
    if (result.success) {
      setImportModalOpen(false)
      showToast(`${importData.length} leads imported successfully`)
      router.refresh()
    } else {
      showToast(result.error || 'Failed to import leads', 'error')
    }
    setIsImporting(false)
  }

  const handleCreateLead = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const { createLead } = await import("@/app/dashboard/leads/actions")
    const res = await createLead(formData)
    if (res.success) {
      showToast("Lead created successfully!")
      setIsCreateModalOpen(false)
      router.refresh()
    } else {
      showToast(res.error || "Failed to create lead", "error")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new': return "bg-blue-50 text-blue-700 border-blue-200"
      case 'contacted': return "bg-purple-50 text-purple-700 border-purple-200"
      case 'in_progress': return "bg-orange-50 text-orange-700 border-orange-200"
      case 'converted': return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case 'lost': return "bg-red-50 text-red-700 border-red-200"
      default: return "bg-zinc-100 text-zinc-700 border-zinc-200"
    }
  }

  return (
    <div className="w-full relative">
      <ToastContainer toasts={toasts} hideToast={hideToast} />

      {/* Tabs */}
      <div className="flex items-center justify-between px-4 pt-4 border-b border-zinc-100 overflow-x-auto hide-scrollbar">
        <div className="flex gap-6">
            {['ALL', 'NEW', 'CONTACTED', 'IN_PROGRESS', 'CONVERTED', 'LOST'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap uppercase tracking-widest ${
                  activeTab === tab 
                    ? 'border-[var(--brand-primary)] text-[var(--brand-primary)]' 
                    : 'border-transparent text-zinc-400 hover:text-zinc-600'
                }`}
              >
                {tab}
              </button>
            ))}
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex h-11 items-center gap-2 rounded-xl px-6 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-all hover:opacity-90 active:scale-95 mb-3"
          style={{ backgroundColor: 'var(--brand-primary)' }}
        >
          <Plus className="h-4 w-4" />
          Add Lead
        </button>
      </div>

      {/* Table Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-100 bg-white">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="search"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 w-full rounded-2xl border border-zinc-100 bg-zinc-50/50 pl-11 pr-4 text-sm font-bold transition-all focus:ring-4 outline-none"
            style={{ '--tw-ring-color': 'var(--brand-primary)', '--tw-ring-opacity': '0.1' } as any}
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs font-bold text-zinc-600 border border-zinc-200 px-4 py-2 rounded-xl hover:bg-zinc-50 cursor-pointer transition-all active:scale-95 shadow-sm bg-white">
            <Upload className="h-4 w-4 text-[var(--brand-primary)]" />
            Import Excel
            <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleFileUpload} />
          </label>
          <div className="relative" ref={filterRef}>
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 text-xs font-bold text-zinc-600 border border-zinc-200 px-4 py-2 rounded-xl hover:bg-zinc-50 transition-all active:scale-95 shadow-sm bg-white"
            >
              Filter <ChevronDown className="h-4 w-4 opacity-50" />
            </button>
            
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-zinc-200 bg-white p-2 shadow-2xl z-10 animate-in fade-in zoom-in duration-150">
                <p className="text-[10px] font-bold text-zinc-400 mb-2 px-2 uppercase tracking-widest">By Source</p>
                {['Website', 'Referral', 'Walk In', 'Education Fair', 'Google Ads', 'Facebook Ads'].map(src => (
                  <label key={src} className="flex items-center gap-2 px-2 py-2 hover:bg-emerald-50 rounded-lg cursor-pointer transition-colors group">
                    <input type="checkbox" className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-600 h-3.5 w-3.5" />
                    <span className="text-xs font-bold text-zinc-700 group-hover:text-emerald-700">{src}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-sm text-left">
          <thead className="text-[10px] text-zinc-400 bg-zinc-50/50 border-b border-zinc-100 uppercase tracking-[0.1em] font-extrabold">
            <tr>
              <th className="px-6 py-4">Lead Name</th>
              <th className="px-6 py-4">Contact Details</th>
              <th className="px-6 py-4">Source</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date Added</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                   <div className="flex flex-col items-center gap-3 text-zinc-300">
                     <Search className="h-10 w-10 opacity-20" />
                     <p className="text-sm font-bold uppercase tracking-widest">No leads matched</p>
                   </div>
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => (
                <tr 
                  key={lead.id} 
                  className="bg-white hover:bg-[var(--brand-primary-light)] transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 font-bold text-xs shrink-0 border border-zinc-100 group-hover:bg-[var(--brand-primary)] group-hover:text-white transition-all duration-300 shadow-sm">
                        {lead.first_name?.[0]}{lead.last_name?.[0]}
                      </div>
                      <div className="font-bold text-zinc-900 group-hover:text-[var(--brand-primary)] transition-colors">
                        {lead.first_name} {lead.last_name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-zinc-900 font-bold text-xs">{lead.email || '—'}</div>
                    <div className="text-[10px] text-zinc-500 font-medium mt-0.5 tracking-tight uppercase">{lead.phone || 'No phone'}</div>
                  </td>
                  <td className="px-6 py-4">
                     <span className="text-zinc-500 bg-zinc-100 px-2 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-widest border border-zinc-200">
                       {lead.source?.replace('_', ' ') || 'Direct'}
                     </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <select 
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        disabled={updatingId === lead.id}
                        className={`text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-lg border cursor-pointer appearance-none outline-none transition-all shadow-sm ${getStatusBadge(lead.status)}`}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="in_progress">In Progress</option>
                        <option value="converted">Converted</option>
                        <option value="lost">Lost</option>
                      </select>
                      {updatingId === lead.id && <Loader2 className="h-3 w-3 animate-spin text-zinc-400" />}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-500 tabular-nums font-bold text-xs">
                    {format(new Date(lead.created_at), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 text-right relative" ref={openActionId === lead.id ? actionRef : null}>
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => setFollowUpLead(lead)}
                        className="text-zinc-400 hover:text-emerald-600 p-2.5 rounded-xl hover:bg-emerald-50 transition-all active:scale-90"
                        title="Add Follow-up"
                      >
                        <Bell className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={(e) => handleActionClick(e, lead.id)}
                        className="text-zinc-400 hover:text-zinc-900 p-2.5 rounded-xl hover:bg-zinc-100 transition-all active:scale-90"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>

                    {openActionId === lead.id && (
                      <div className={`absolute right-6 ${openUpwards ? 'bottom-12' : 'top-12'} mt-1 w-52 rounded-2xl border border-zinc-200 bg-white p-2 shadow-2xl z-20 text-left animate-in fade-in slide-in-from-${openUpwards ? 'bottom' : 'top'}-2 duration-300 overflow-hidden`}>
                        <button 
                          onClick={async () => {
                            const { convertLeadToStudent } = await import("@/app/dashboard/students/actions")
                            const res = await convertLeadToStudent(lead.id)
                            if (res.success) {
                              showToast(`Lead promoted to Student!`)
                              router.push(`/dashboard/students/${res.studentId}`)
                            } else {
                              showToast(res.error || 'Promotion failed', 'error')
                            }
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold hover:bg-emerald-50 text-emerald-700 transition-all"
                        >
                          <GraduationCap className="h-4 w-4 opacity-70" /> Promote to Student
                        </button>
                        <div className="h-px bg-zinc-50 my-1 mx-2" />
                        <button 
                          onClick={() => { setEditingLead(lead); setOpenActionId(null); }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold hover:bg-zinc-50 text-zinc-700 transition-all"
                        >
                          <Edit className="h-4 w-4 opacity-70" /> Edit Details
                        </button>
                        <div className="h-px bg-zinc-50 my-1 mx-2" />
                        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold hover:bg-red-50 text-red-600 transition-all">
                          <Trash2 className="h-4 w-4 opacity-70" /> Delete Lead
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Lead Modal */}
      {editingLead && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="flex items-center justify-between p-6 border-b border-zinc-100 bg-zinc-50/50">
              <h3 className="font-extrabold text-zinc-900 tracking-tight">Edit Lead Information</h3>
              <button onClick={() => setEditingLead(null)} className="p-2 rounded-xl hover:bg-white text-zinc-400 hover:text-zinc-600 transition-all shadow-sm border border-transparent hover:border-zinc-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">First Name</label>
                  <input name="first_name" defaultValue={editingLead.first_name} className="w-full h-12 rounded-2xl border border-zinc-200 px-4 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all bg-zinc-50/50" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Last Name</label>
                  <input name="last_name" defaultValue={editingLead.last_name} className="w-full h-12 rounded-2xl border border-zinc-200 px-4 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all bg-zinc-50/50" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Email Address</label>
                <input name="email" defaultValue={editingLead.email} className="w-full h-12 rounded-2xl border border-zinc-200 px-4 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all bg-zinc-50/50" type="email" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Phone Number</label>
                <input name="phone" defaultValue={editingLead.phone} className="w-full h-12 rounded-2xl border border-zinc-200 px-4 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all bg-zinc-50/50" type="tel" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setEditingLead(null)} className="flex-1 h-12 rounded-2xl text-sm font-bold text-zinc-500 hover:bg-zinc-100 transition-all uppercase tracking-widest">Cancel</button>
                <button type="submit" className="flex-[2] h-12 rounded-2xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 shadow-xl shadow-emerald-600/20 transition-all active:scale-95 uppercase tracking-widest">Update Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Follow-up Modal */}
      {followUpLead && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-zinc-900/70 backdrop-blur-md animate-in fade-in duration-300 p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="flex items-center justify-between p-6 border-b border-zinc-100 bg-zinc-50/50">
              <h3 className="font-extrabold text-zinc-900 tracking-tight flex items-center gap-2.5">
                <div 
                  className="h-9 w-9 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: 'var(--brand-primary)' }}
                >
                  <Bell className="h-5 w-5" />
                </div>
                Schedule Follow-up
              </h3>
              <button onClick={() => setFollowUpLead(null)} className="p-2 rounded-xl hover:bg-white text-zinc-400 transition-all border border-transparent hover:border-zinc-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form 
              onSubmit={async (e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const { createTask } = await import("@/app/dashboard/tasks/actions")
                const res = await createTask(formData)
                if (res.success) {
                  showToast("Follow-up reminder set successfully!")
                  setFollowUpLead(null)
                } else {
                  showToast(res.error || "Failed to set reminder", "error")
                }
              }} 
              className="p-8 space-y-6"
            >
              <input type="hidden" name="lead_id" value={followUpLead.id} />
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em]">Follow-up for</label>
                <div className="text-base font-extrabold text-zinc-900">{followUpLead.first_name} {followUpLead.last_name}</div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em]">Task Title</label>
                <div className="relative">
                  <input 
                    name="title" 
                    placeholder="e.g. Call to discuss course" 
                    className="w-full h-12 rounded-2xl border border-zinc-200 bg-zinc-50/50 px-4 text-sm font-bold focus:ring-4 outline-none transition-all" 
                    style={{ '--tw-ring-color': 'var(--brand-primary)', '--tw-ring-opacity': '0.1' } as any}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em]">Due Date & Time</label>
                <div className="relative">
                  <input 
                    name="due_date" 
                    type="datetime-local" 
                    className="w-full h-12 rounded-2xl border border-zinc-200 bg-zinc-50/50 px-4 text-sm font-bold focus:ring-4 outline-none transition-all tabular-nums" 
                    style={{ '--tw-ring-color': 'var(--brand-primary)', '--tw-ring-opacity': '0.1' } as any}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em]">Description & Context</label>
                <textarea 
                  name="description" 
                  defaultValue={`Lead: ${followUpLead.first_name} ${followUpLead.last_name}\nPhone: ${followUpLead.phone || 'N/A'}\nEmail: ${followUpLead.email || 'N/A'}\nSource: ${followUpLead.source || 'Direct'}`}
                  className="w-full h-32 rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4 text-sm font-bold focus:ring-4 outline-none transition-all resize-none" 
                  style={{ '--tw-ring-color': 'var(--brand-primary)', '--tw-ring-opacity': '0.1' } as any}
                />
              </div>

              <button 
                type="submit" 
                className="w-full h-14 rounded-2xl text-white text-sm font-black shadow-2xl transition-all active:scale-[0.98] uppercase tracking-widest flex items-center justify-center gap-2"
                style={{ backgroundColor: 'var(--brand-primary)', boxShadow: '0 20px 40px -10px var(--brand-primary-muted)' }}
              >
                <Check className="h-5 w-5" />
                Set Reminder
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b shrink-0 bg-zinc-50">
              <div>
                <h3 className="font-bold text-zinc-900 text-lg">Import Leads from Spreadsheet</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Map your file columns to CRM fields and preview the data below.</p>
              </div>
              <button 
                onClick={() => setImportModalOpen(false)} 
                className="p-2 rounded-full hover:bg-white text-zinc-400 hover:text-zinc-600 transition-colors shadow-sm"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6 space-y-8">
              <section>
                <h4 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">
                   <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">1</div>
                   Column Mapping
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {CRM_FIELDS.map(field => (
                    <div key={field.key} className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-2 hover:border-emerald-200 transition-colors">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        {columnMapping[field.key] ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : field.required ? (
                          <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                        ) : null}
                      </div>
                      <select 
                        value={columnMapping[field.key] || ''} 
                        onChange={(e) => setColumnMapping({ ...columnMapping, [field.key]: e.target.value })}
                        className="w-full h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      >
                        <option value="">Select Column...</option>
                        {importHeaders.map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h4 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">
                   <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">2</div>
                   Data Preview (First 5 Rows)
                </h4>
                <div className="rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-zinc-100 border-b border-zinc-200 text-zinc-500 font-bold uppercase">
                      <tr>
                        {CRM_FIELDS.filter(f => columnMapping[f.key]).map(field => (
                          <th key={field.key} className="px-4 py-3">{field.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {importData.slice(0, 5).map((row, i) => (
                        <tr key={i} className="bg-white">
                          {CRM_FIELDS.filter(f => columnMapping[f.key]).map(field => (
                            <td key={field.key} className="px-4 py-3 text-zinc-700">
                              {row[columnMapping[field.key]]?.toString() || '—'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <div className="p-5 border-t bg-zinc-50 flex items-center justify-between shrink-0">
               <div className="text-sm text-zinc-500">
                 Ready to import <span className="font-bold text-zinc-900">{importData.length}</span> leads.
               </div>
               <div className="flex gap-3">
                 <button 
                   onClick={() => setImportModalOpen(false)} 
                   className="px-6 py-2.5 text-sm font-bold text-zinc-600 hover:bg-white rounded-lg border border-zinc-200 shadow-sm transition-all"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={confirmImport} 
                   disabled={isImporting || !columnMapping['first_name']}
                   className="px-8 py-2.5 text-sm font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                 >
                   {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                   Confirm & Import
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}
      {/* Create Lead Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="flex items-center justify-between p-6 border-b border-zinc-100 bg-zinc-50/50">
              <h3 className="font-extrabold text-zinc-900 tracking-tight flex items-center gap-2.5">
                <div 
                  className="h-9 w-9 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: 'var(--brand-primary)' }}
                >
                  <Plus className="h-5 w-5" />
                </div>
                Add New Lead
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-2 rounded-xl hover:bg-white text-zinc-400 hover:text-zinc-600 transition-all shadow-sm border border-transparent hover:border-zinc-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateLead} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">First Name</label>
                  <input 
                    name="first_name" 
                    placeholder="John"
                    className="w-full h-12 rounded-2xl border border-zinc-100 px-4 text-sm font-bold focus:ring-4 outline-none transition-all bg-zinc-50/50" 
                    style={{ '--tw-ring-color': 'var(--brand-primary)', '--tw-ring-opacity': '0.1' } as any}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Last Name</label>
                  <input 
                    name="last_name" 
                    placeholder="Doe"
                    className="w-full h-12 rounded-2xl border border-zinc-100 px-4 text-sm font-bold focus:ring-4 outline-none transition-all bg-zinc-50/50" 
                    style={{ '--tw-ring-color': 'var(--brand-primary)', '--tw-ring-opacity': '0.1' } as any}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Email Address</label>
                <input 
                  name="email" 
                  type="email"
                  placeholder="john@example.com"
                  className="w-full h-12 rounded-2xl border border-zinc-100 px-4 text-sm font-bold focus:ring-4 outline-none transition-all bg-zinc-50/50" 
                  style={{ '--tw-ring-color': 'var(--brand-primary)', '--tw-ring-opacity': '0.1' } as any}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Phone Number</label>
                <input 
                  name="phone" 
                  type="tel"
                  placeholder="+91 98765 43210"
                  className="w-full h-12 rounded-2xl border border-zinc-100 px-4 text-sm font-bold focus:ring-4 outline-none transition-all bg-zinc-50/50" 
                  style={{ '--tw-ring-color': 'var(--brand-primary)', '--tw-ring-opacity': '0.1' } as any}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Lead Source</label>
                <select 
                  name="source" 
                  className="w-full h-12 rounded-2xl border border-zinc-100 px-4 text-sm font-bold focus:ring-4 outline-none transition-all bg-zinc-50/50 appearance-none"
                  style={{ '--tw-ring-color': 'var(--brand-primary)', '--tw-ring-opacity': '0.1' } as any}
                >
                  <option value="Direct">Direct</option>
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="Education Fair">Education Fair</option>
                  <option value="Google Ads">Google Ads</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 h-12 rounded-2xl text-sm font-bold text-zinc-500 hover:bg-zinc-100 transition-all uppercase tracking-widest">Cancel</button>
                <button 
                  type="submit" 
                  className="flex-[2] h-12 rounded-2xl text-white text-sm font-black shadow-2xl transition-all active:scale-95 uppercase tracking-widest"
                  style={{ backgroundColor: 'var(--brand-primary)', boxShadow: '0 20px 40px -10px var(--brand-primary-muted)' }}
                >
                  Create Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
