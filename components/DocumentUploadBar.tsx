
import React, { useState, useRef } from 'react';
import { Role, Document, AccessLevel } from '../types';

interface DocumentUploadBarProps {
  onUpload: (doc: Document) => void;
  currentUserRole: Role;
}

const DocumentUploadBar: React.FC<DocumentUploadBarProps> = ({ onUpload, currentUserRole }) => {
  const [title, setTitle] = useState('');
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('INTERNAL');
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualContent, setManualContent] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !manualContent.trim()) return;

    setIsUploading(true);
    await new Promise(resolve => setTimeout(resolve, 1200));

    const newDoc: Document = {
      id: 'd' + Date.now(),
      title: title.trim(),
      type: 'text',
      uploadDate: new Date().toISOString().split('T')[0],
      roleAccess: accessLevel === 'INTERNAL' ? [Role.ADMIN, currentUserRole] : (accessLevel === 'PUBLIC' ? Object.values(Role) : []),
      accessLevel: accessLevel,
      ownerId: 'PENDING',
      author: 'PENDING',
      fileSize: `${(manualContent.length / 1024).toFixed(1)} KB`,
      content: manualContent,
      fileUrl: ''
    };

    onUpload(newDoc);
    setIsUploading(false);
    setShowSuccess(true);
    setTitle('');
    setManualContent('');
    setShowManualModal(false);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.name.toLowerCase().endsWith('.pdf');
    const docTitle = title.trim() || file.name.replace(/\.[^/.]+$/, "");
    
    setIsUploading(true);

    // Simulate enterprise-grade storage process
    await new Promise(resolve => setTimeout(resolve, 1800));

    let content = '';
    let fileUrl = '';

    try {
      if (isPdf) {
        // Simulation: OCR and indexing of a PDF
        fileUrl = URL.createObjectURL(file);
        content = `
          [DOCUMENT INDEXING COMPLETED]
          TITLE: ${docTitle}
          CLASSIFICATION: ${accessLevel}
          SUMMARY: This is a secure PDF document containing corporate information regarding "${docTitle}".
          EXTRACTED KEYWORDS: Strategy, Compliance, Operations.
          DATE INGESTED: ${new Date().toLocaleDateString()}
          
          FULL TEXT CONTENT:
          The following document "${docTitle}" has been analyzed. It outlines the primary objectives for the current period including risk mitigation, departmental synchronization, and resource allocation. All stakeholders must adhere to the confidentiality protocols defined in section 4.1.
        `.trim();
      } else {
        // Direct storage of text content
        content = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsText(file);
        });
        fileUrl = URL.createObjectURL(file);
      }

      const newDoc: Document = {
        id: 'd' + Date.now(),
        title: docTitle, 
        type: isPdf ? 'pdf' : 'text',
        uploadDate: new Date().toISOString().split('T')[0],
        roleAccess: accessLevel === 'INTERNAL' ? [Role.ADMIN, currentUserRole] : (accessLevel === 'PUBLIC' ? Object.values(Role) : []),
        accessLevel: accessLevel,
        ownerId: 'PENDING', 
        author: 'PENDING',   
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        content: content, 
        fileUrl: fileUrl
      };

      onUpload(newDoc);
      setIsUploading(false);
      setShowSuccess(true);
      setTitle('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("Upload failed", err);
      setIsUploading(false);
    }
  };

  const triggerFilePicker = (e: React.FormEvent) => {
    e.preventDefault();
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className={`relative overflow-hidden bg-white border ${showSuccess ? 'border-emerald-200 shadow-emerald-50' : 'border-slate-200 shadow-sm'} rounded-[2rem] p-2 transition-all duration-500 hover:shadow-md`}>
        {isUploading && (
          <div className="absolute top-0 left-0 h-1 bg-indigo-600 animate-progress-fast"></div>
        )}
        
        <div className="flex flex-col md:flex-row items-center gap-2">
          <div className="flex-1 w-full px-4 flex items-center space-x-3">
            <div className={`p-2 rounded-xl transition-all ${showSuccess ? 'bg-emerald-100 text-emerald-600 rotate-[360deg]' : 'bg-indigo-50 text-indigo-600'}`}>
              <svg className={`w-5 h-5 ${isUploading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isUploading ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                ) : showSuccess ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                )}
              </svg>
            </div>
            <input 
              type="text" 
              placeholder={showSuccess ? "Document Saved Successfully" : "Document Title (Optional)..."}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold ${showSuccess ? 'text-emerald-600 placeholder-emerald-400' : 'text-slate-900 placeholder-slate-400'}`}
              disabled={isUploading || showSuccess}
            />
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto p-1 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="relative group">
              <select 
                value={accessLevel}
                onChange={(e) => setAccessLevel(e.target.value as AccessLevel)}
                disabled={isUploading || showSuccess}
                className="bg-transparent border-none text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 focus:ring-0 cursor-pointer pl-4 pr-10 appearance-none transition-colors hover:text-indigo-600"
              >
                <option value="PRIVATE">Private</option>
                <option value="INTERNAL">Internal</option>
                <option value="PUBLIC">Public</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-3 h-3 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
              </div>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.txt"
              className="hidden" 
            />
            
            <div className="flex space-x-1">
              <button 
                onClick={triggerFilePicker}
                disabled={isUploading || showSuccess}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg flex items-center gap-2 ${
                  showSuccess 
                    ? 'bg-emerald-500 text-white shadow-emerald-200' 
                    : isUploading 
                      ? 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed' 
                      : 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700'
                }`}
              >
                {isUploading ? 'Extracting...' : showSuccess ? 'Saved' : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/></svg>
                    Upload File
                  </>
                )}
              </button>

              {!isUploading && !showSuccess && (
                <button 
                  onClick={() => setShowManualModal(true)}
                  className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-indigo-400 hover:text-indigo-600 transition-all shadow-sm"
                  title="Direct Text Entry"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Manual Entry Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={() => setShowManualModal(false)}>
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create Document</h2>
                <p className="text-sm text-slate-500">Directly enter text content for secure storage.</p>
              </div>
              <button onClick={() => setShowManualModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Document Title</label>
                <input 
                  type="text" 
                  required 
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Project Plan 2025"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Classification & Content</label>
                <div className="flex flex-col space-y-4">
                  <select 
                    value={accessLevel}
                    onChange={(e) => setAccessLevel(e.target.value as AccessLevel)}
                    className="w-full px-6 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="PRIVATE">Private (Restricted)</option>
                    <option value="INTERNAL">Internal (Role Clearances)</option>
                    <option value="PUBLIC">Public (Organization Wide)</option>
                  </select>
                  <textarea 
                    required
                    rows={10}
                    value={manualContent}
                    onChange={(e) => setManualContent(e.target.value)}
                    placeholder="Type or paste document text here..."
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-mono text-sm leading-relaxed"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isUploading}
                className="w-full py-5 bg-indigo-600 text-white font-black uppercase tracking-[0.3em] text-xs rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center space-x-3"
              >
                {isUploading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Document</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-3 px-8">
        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest flex items-center">
          <svg className="w-3.5 h-3.5 mr-2 text-indigo-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.9L10 1.55l7.834 3.35a1 1 0 01.666.92v6.57a8 8 0 01-1.414 4.542l-6.42 8.446a1 1 0 01-1.333 0l-6.42-8.446A8 8 0 011.5 12.44V5.82a1 1 0 01.666-.92zM10 3.385L3.5 6.17v6.27a6 6 0 001.06 3.407L10 21.844l5.44-7.162A6 6 0 0016.5 12.44V6.17L10 3.385z"/></svg>
          Multi-format support: PDF, Text, and Manual Entry
        </p>
        <p className="text-[9px] text-slate-400 font-bold italic tracking-wider">
          Persistence: Browser Storage Enabled
        </p>
      </div>
      
      <style>{`
        @keyframes progress-fast {
          0% { width: 0%; }
          30% { width: 40%; }
          70% { width: 90%; }
          100% { width: 100%; }
        }
        .animate-progress-fast {
          animation: progress-fast 1.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default DocumentUploadBar;
