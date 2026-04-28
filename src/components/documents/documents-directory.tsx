'use client'

import * as React from "react"
import { Student, getStudentDocuments, uploadDocument, deleteDocument } from "@/app/dashboard/students/actions"
import { 
  Search, 
  User, 
  Folder, 
  FileText, 
  Eye, 
  Download, 
  Trash2, 
  Upload, 
  Loader2, 
  X,
  ChevronRight,
  FileCheck,
  MoreVertical
} from "lucide-react"
import { useToast, ToastContainer } from "@/components/ui/toast"
import { format } from "date-fns"

export function DocumentsDirectory({ initialStudents }: { initialStudents: Student[] }) {
  const { toasts, showToast, hideToast } = useToast()
  const [search, setSearch] = React.useState("")
  const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(null)
  const [documents, setDocuments] = React.useState<any[]>([])
  const [isLoadingDocs, setIsLoadingDocs] = React.useState(false)
  const [previewDoc, setPreviewDoc] = React.useState<any | null>(null)
  const [isUploading, setIsUploading] = React.useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false)
  const [documentToDelete, setDocumentToDelete] = React.useState<{ id: string, name: string } | null>(null)
  const [confirmationText, setConfirmationText] = React.useState("")
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const filteredStudents = initialStudents.filter(s => 
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelectStudent = async (student: Student) => {
    setSelectedStudent(student)
    setIsLoadingDocs(true)
    const docs = await getStudentDocuments(student.id)
    setDocuments(docs)
    setIsLoadingDocs(false)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedStudent) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    const res = await uploadDocument(selectedStudent.id, formData)
    if (res.success) {
      showToast("Document added to vault")
      const docs = await getStudentDocuments(selectedStudent.id)
      setDocuments(docs)
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
    if (!selectedStudent || !documentToDelete || confirmationText !== "DELETE") return
    
    setIsDeleting(documentToDelete.id)
    const res = await deleteDocument(documentToDelete.id, selectedStudent.id, documentToDelete.name)
    if (res.success) {
      setDocuments(docs => docs.filter(d => d.id !== documentToDelete.id))
      showToast("Document archived")
      setIsDeleteModalOpen(false)
      setDocumentToDelete(null)
    } else {
      showToast(res.error || "Delete failed", "error")
    }
    setIsDeleting(null)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[700px]">
      <ToastContainer toasts={toasts} hideToast={hideToast} />
      
      {/* Sidebar: Student List */}
      <div className="w-full lg:w-96 bg-white rounded-[32px] border border-zinc-100 shadow-sm flex flex-col overflow-hidden">
        <div className="p-6 border-b border-zinc-50 space-y-4">
          <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Student Directory</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input 
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-zinc-50 border-none rounded-2xl text-xs font-bold focus:ring-4 outline-none transition-all"
              style={{'--tw-ring-color': 'var(--brand-primary)', '--tw-ring-opacity': '0.1'} as any}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredStudents.map(student => (
            <button
              key={student.id}
              onClick={() => handleSelectStudent(student)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                selectedStudent?.id === student.id 
                  ? 'bg-[var(--brand-primary)] text-white shadow-lg shadow-[var(--brand-primary-muted)]' 
                  : 'hover:bg-[var(--brand-primary-light)] text-zinc-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-xs transition-colors ${
                  selectedStudent?.id === student.id ? 'bg-white/20' : 'bg-zinc-100 text-zinc-400 group-hover:bg-[var(--brand-primary)] group-hover:text-white'
                }`}>
                  {student.first_name[0]}{student.last_name[0]}
                </div>
                <div className="text-left">
                  <div className={`text-xs font-black tracking-tight ${selectedStudent?.id === student.id ? 'text-white' : 'text-zinc-900'}`}>
                    {student.first_name} {student.last_name}
                  </div>
                  <div className={`text-[9px] font-bold uppercase tracking-wider opacity-60 ${selectedStudent?.id === student.id ? 'text-white' : 'text-zinc-400'}`}>
                    {student.current_education || 'Lead'}
                  </div>
                </div>
              </div>
              <ChevronRight className={`h-4 w-4 transition-transform ${selectedStudent?.id === student.id ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Main Panel: Documents */}
      <div className="flex-1 bg-white rounded-[32px] border border-zinc-100 shadow-sm flex flex-col overflow-hidden">
        {selectedStudent ? (
          <>
            <div className="p-8 border-b border-zinc-50 bg-zinc-50/30 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-[20px] bg-white border border-zinc-100 shadow-sm flex items-center justify-center text-[var(--brand-primary)]">
                   <Folder className="h-7 w-7" />
                </div>
                <div>
                   <h3 className="text-lg font-black text-zinc-900 tracking-tight">{selectedStudent.first_name}'s Folder</h3>
                   <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Stored in Encrypted Cloud</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-2 px-5 py-3 bg-[var(--brand-primary)] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[var(--brand-primary-muted)] transition-all active:scale-95 disabled:opacity-50"
                >
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Upload File
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              {isLoadingDocs ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-zinc-200" />
                </div>
              ) : documents.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-300 gap-4 opacity-40">
                   <FileCheck className="h-16 w-16" />
                   <p className="text-[10px] font-black uppercase tracking-[0.2em]">Folder is Empty</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {documents.map(doc => (
                    <div key={doc.id} className="group p-5 rounded-3xl border border-zinc-100 bg-white hover:border-[var(--brand-primary-muted)] hover:shadow-xl hover:shadow-zinc-900/5 transition-all relative overflow-hidden">
                       <div className="flex items-start justify-between mb-4">
                          <div className="h-12 w-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-[var(--brand-primary-light)] group-hover:text-[var(--brand-primary)] transition-colors">
                             <FileText className="h-6 w-6" />
                          </div>
                          <button 
                            onClick={() => handleDeleteClick({ id: doc.id, name: doc.name })}
                            className="p-2 text-zinc-300 hover:text-red-500 rounded-xl hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                          >
                             <Trash2 className="h-4 w-4" />
                          </button>
                       </div>
                       <div className="space-y-1">
                          <h4 className="text-xs font-black text-zinc-900 line-clamp-1 group-hover:text-[var(--brand-primary)] transition-colors">{doc.name}</h4>
                          <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tight">Added {format(new Date(doc.created_at), 'MMM dd, yyyy')}</p>
                       </div>
                       
                       <div className="mt-5 pt-5 border-t border-zinc-50 flex items-center gap-2">
                          <button 
                            onClick={() => setPreviewDoc(doc)}
                            className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-zinc-50 text-zinc-600 text-[9px] font-black uppercase tracking-widest hover:bg-[var(--brand-primary)] hover:text-white transition-all"
                          >
                             <Eye className="h-3.5 w-3.5" /> View
                          </button>
                          <a 
                            href={doc.file_url} 
                            download={doc.name}
                            className="flex items-center justify-center h-10 w-10 rounded-xl bg-zinc-50 text-zinc-400 hover:bg-zinc-100 transition-all"
                          >
                             <Download className="h-4 w-4" />
                          </a>
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-300 gap-6 p-20">
             <div className="h-24 w-24 rounded-[32px] bg-zinc-50 flex items-center justify-center text-zinc-200">
                <User className="h-12 w-12" />
             </div>
             <div className="text-center space-y-2">
                <h4 className="text-sm font-black text-zinc-900 uppercase tracking-[0.2em]">Select a Student</h4>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">To browse their document portfolio</p>
             </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
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
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-zinc-900/90 backdrop-blur-xl p-4 md:p-10 animate-in fade-in duration-300">
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
              {previewDoc.document_type?.includes('image') ? (
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
