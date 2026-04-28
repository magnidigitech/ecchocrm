'use client'

import * as React from "react"
import { FileText, Upload, Trash2, Download, File, ShieldCheck, Clock, Loader2, X, Check, Eye } from "lucide-react"
import { uploadDocument, getStudentDocuments, deleteDocument } from "@/app/dashboard/students/actions"
import { useToast, ToastContainer } from "@/components/ui/toast"

export function StudentDocuments({ studentId, onActivity }: { studentId: string, onActivity?: () => void }) {
  const { toasts, showToast, hideToast } = useToast()
  const [documents, setDocuments] = React.useState<any[]>([])
  const [isUploading, setIsUploading] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null)
  const [previewDoc, setPreviewDoc] = React.useState<any | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false)
  const [documentToDelete, setDocumentToDelete] = React.useState<{ id: string, name: string } | null>(null)
  const [confirmationText, setConfirmationText] = React.useState("")
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Fetch documents on mount
  React.useEffect(() => {
    async function loadDocs() {
      const docs = await getStudentDocuments(studentId)
      setDocuments(docs)
    }
    loadDocs()
  }, [studentId])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    const res = await uploadDocument(studentId, formData)
    if (res.success) {
      showToast("Document uploaded successfully")
      const docs = await getStudentDocuments(studentId)
      setDocuments(docs)
      if (onActivity) onActivity()
    } else {
      showToast(res.error || "Upload failed", "error")
    }
    setIsUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDeleteClick = (doc: { id: string, name: string }) => {
    setDocumentToDelete(doc)
    setConfirmationText("")
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!documentToDelete || confirmationText !== "DELETE") return
    
    setIsDeleting(documentToDelete.id)
    const res = await deleteDocument(documentToDelete.id, studentId, documentToDelete.name)
    if (res.success) {
      setDocuments(docs => docs.filter(d => d.id !== documentToDelete.id))
      showToast("Document archived")
      setIsDeleteModalOpen(false)
      setDocumentToDelete(null)
      if (onActivity) onActivity()
    } else {
      showToast(res.error || "Delete failed", "error")
    }
    setIsDeleting(null)
  }

  return (
    <div className="bg-white rounded-[32px] border border-zinc-100 shadow-sm overflow-hidden">
      <ToastContainer toasts={toasts} hideToast={hideToast} />
      
      <div className="p-8 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/30">
        <div className="flex items-center gap-3">
          <div 
            className="h-10 w-10 rounded-2xl flex items-center justify-center shadow-sm"
            style={{ backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)' }}
          >
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight">Document Vault</h3>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Compliance & Records</p>
          </div>
        </div>
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="h-10 px-5 rounded-xl text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-lg"
          style={{ backgroundColor: 'var(--brand-primary)', boxShadow: '0 10px 20px -5px var(--brand-primary-muted)' }}
        >
          {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
      </div>

      <div className="p-6">
        {documents.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-zinc-200 gap-4">
             <div className="h-16 w-16 rounded-full bg-zinc-50 flex items-center justify-center">
               <File className="h-8 w-8 opacity-20" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Vault is empty</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div 
                key={doc.id} 
                className="group flex items-center gap-4 p-4 rounded-2xl border border-zinc-100 transition-all duration-300"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--brand-primary-muted)'
                  e.currentTarget.style.backgroundColor = 'var(--brand-primary-light)'
                  e.currentTarget.style.setProperty('--icon-bg', 'var(--brand-primary-light)')
                  e.currentTarget.style.setProperty('--icon-color', 'var(--brand-primary)')
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = ''
                  e.currentTarget.style.backgroundColor = ''
                }}
              >
                <div className="h-12 w-12 rounded-xl bg-zinc-50 text-zinc-400 flex items-center justify-center transition-colors border border-zinc-100 group-hover:bg-white group-hover:text-[var(--brand-primary)]">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black text-zinc-900 truncate group-hover:text-[var(--brand-primary)] transition-colors">{doc.name}</div>
                  <div className="flex items-center gap-2 mt-1 text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      {new Date(doc.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => setPreviewDoc(doc)}
                    className="p-2 rounded-xl text-zinc-400 hover:text-[var(--brand-primary)] hover:bg-white transition-all shadow-sm border border-transparent hover:border-[var(--brand-primary-muted)]"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <a 
                    href={doc.file_url} 
                    download={doc.name}
                    className="p-2 rounded-xl text-zinc-400 hover:text-[var(--brand-primary)] hover:bg-white transition-all shadow-sm border border-transparent hover:border-[var(--brand-primary-muted)]"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                  <button 
                    onClick={() => handleDeleteClick({ id: doc.id, name: doc.name })}
                    disabled={isDeleting === doc.id}
                    className="p-2 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-white transition-all shadow-sm border border-transparent hover:border-red-100"
                  >
                    {isDeleting === doc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-zinc-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
           <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-red-100">
              <div className="p-8 border-b border-zinc-50 bg-red-50/30 flex items-center gap-4">
                 <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-red-500 border border-red-100">
                    <Trash2 className="h-6 w-6" />
                 </div>
                 <div>
                    <h3 className="text-lg font-black text-zinc-900 tracking-tight">Destructive Action</h3>
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-1">Archiving Sensitive Record</p>
                 </div>
              </div>
              <div className="p-8 space-y-6">
                 <p className="text-xs font-bold text-zinc-500 leading-relaxed uppercase tracking-wider">
                    You are about to remove <span className="text-zinc-900 font-black">"{documentToDelete?.name}"</span> from the student's vault. This action will be logged.
                 </p>
                 
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Type <span className="text-red-500">DELETE</span> to confirm</label>
                    <input 
                      type="text"
                      value={confirmationText}
                      onChange={(e) => setConfirmationText(e.target.value.toUpperCase())}
                      placeholder="Type DELETE"
                      className="w-full h-14 rounded-2xl border-2 border-zinc-100 bg-zinc-50/50 px-5 text-sm font-black tracking-widest focus:border-red-500 outline-none transition-all text-red-500 placeholder:text-zinc-300"
                    />
                 </div>

                 <div className="flex gap-3">
                    <button 
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="flex-1 h-14 rounded-2xl bg-zinc-50 text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-100 transition-all"
                    >
                       Cancel
                    </button>
                    <button 
                      onClick={handleConfirmDelete}
                      disabled={confirmationText !== "DELETE" || isDeleting !== null}
                      className="flex-[2] h-14 rounded-2xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-200 transition-all active:scale-95 disabled:opacity-30 disabled:grayscale disabled:scale-100 flex items-center justify-center gap-2"
                    >
                       {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                       Archive Permanently
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-900/90 backdrop-blur-xl p-4 md:p-10 animate-in fade-in duration-300">
          <div className="relative w-full max-w-5xl h-full flex flex-col bg-white rounded-[32px] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b shrink-0">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5" style={{ color: 'var(--brand-primary)' }} />
                <span className="text-sm font-black text-zinc-900 uppercase tracking-tight">{previewDoc.name}</span>
              </div>
              <button 
                onClick={() => setPreviewDoc(null)}
                className="p-3 rounded-full hover:bg-zinc-100 text-zinc-400 transition-all active:scale-95 border border-zinc-100 shadow-sm"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 bg-zinc-100/50 p-4 overflow-hidden relative">
              {previewDoc.document_type.includes('image') ? (
                <img src={previewDoc.file_url} className="w-full h-full object-contain rounded-xl" alt="Preview" />
              ) : (
                <iframe src={previewDoc.file_url} className="w-full h-full rounded-xl" title="PDF Preview" />
              )}
            </div>
            <div className="p-6 border-t bg-zinc-50/50 flex justify-end gap-3">
               <button onClick={() => setPreviewDoc(null)} className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:bg-white rounded-xl border border-zinc-200 transition-all">Close Preview</button>
               <a 
                 href={previewDoc.file_url} 
                 download 
                 className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white rounded-xl transition-all flex items-center gap-2 shadow-lg"
                 style={{ backgroundColor: 'var(--brand-primary)', boxShadow: '0 10px 20px -5px var(--brand-primary-muted)' }}
               >
                 <Download className="h-4 w-4" /> Download Original
               </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
