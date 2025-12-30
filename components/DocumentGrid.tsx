
import React, { useState, useEffect } from 'react';
import { Document, Role, User, AccessLevel } from '../types';

interface DocumentGridProps {
  documents: Document[];
  user: User;
  onDelete?: (id: string) => void;
  onUpdateAccess?: (id: string, updates: Partial<Document>) => void;
}

const DocumentGrid: React.FC<DocumentGridProps> = ({ documents, user, onDelete, onUpdateAccess }) => {
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [sharingDoc, setSharingDoc] = useState<Document | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [viewMode, setViewMode] = useState<'reader' | 'raw'>('reader');

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseViewer();
        setSharingDoc(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleCloseViewer = () => {
    setSelectedDoc(null);
    setIsUnlocked(false);
    setPasswordInput('');
    setPasswordError(false);
  };

  const handleViewClick = (doc: Document) => {
    setSelectedDoc(doc);
    setIsUnlocked(doc.accessLevel !== 'PRIVATE');
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === user.password) {
      setIsUnlocked(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
      setTimeout(() => setPasswordError(false), 500);
      setPasswordInput('');
    }
  };

  const handleOpenNative = () => {
    if (selectedDoc?.fileUrl) {
      window.open(selectedDoc.fileUrl, '_blank');
    }
  };

  const handleToggleRoleAccess = (doc: Document, role: Role) => {
    if (!onUpdateAccess) return;
    const newRoles = doc.roleAccess.includes(role)
      ? doc.roleAccess.filter(r => r !== role)
      : [...doc.roleAccess, role];
    
    onUpdateAccess(doc.id, { roleAccess: newRoles });
    setSharingDoc(prev => prev ? { ...prev, roleAccess: newRoles } : null);
  };

  const setAccessLevel = (doc: Document, level: AccessLevel) => {
    if (!onUpdateAccess) return;
    const updates: Partial<Document> = { accessLevel: level };
    if (level === 'INTERNAL' && doc.roleAccess.length === 0) {
      updates.roleAccess = [Role.ADMIN, user.role];
    } else if (level === 'PUBLIC') {
      updates.roleAccess = Object.values(Role);
    } else if (level === 'PRIVATE') {
      updates.roleAccess = [];
    }
    onUpdateAccess(doc.id, updates);
    setSharingDoc(prev => prev ? { ...prev, ...updates } : null);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Permanently purge this document from the enterprise vault? This action cannot be undone.')) {
      onDelete?.(id);
      if (selectedDoc?.id === id) handleCloseViewer();
    }
  };

  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((doc) => {
          const isOwner = doc.ownerId === user.id;
          const isAdmin = user.role === Role.ADMIN;
          const canManage = isOwner || isAdmin;

          return (
            <div 
              key={doc.id} 
              onClick={() => handleViewClick(doc)}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all group flex flex-col h-full relative cursor-pointer"
            >
              <div className="absolute top-4 right-4 flex items-center gap-2">
                {doc.accessLevel === 'PRIVATE' && (
                  <div className="p-1 bg-rose-50 text-rose-500 rounded-md">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                  </div>
                )}
                <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                  doc.accessLevel === 'PUBLIC' ? 'bg-green-100 text-green-700 border-green-200' :
                  doc.accessLevel === 'PRIVATE' ? 'bg-rose-100 text-rose-700 border-rose-200' :
                  'bg-indigo-100 text-indigo-700 border-indigo-200'
                }`}>
                  {doc.accessLevel}
                </div>
              </div>

              <div className="mb-4 flex justify-between items-start">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${doc.type === 'pdf' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                {canManage && (
                  <button 
                    onClick={(e) => handleDelete(e, doc.id)}
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    title="Purge Document"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-bold text-slate-900 mb-1 truncate text-lg group-hover:text-indigo-600 transition-colors">{doc.title}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">
                  {doc.author} • {doc.uploadDate}
                </p>
              </div>

              <div className="mt-auto flex space-x-2" onClick={(e) => e.stopPropagation()}>
                <button 
                  onClick={() => handleViewClick(doc)}
                  className="flex-1 py-2.5 text-xs font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-xl transition-all"
                >
                  View
                </button>
                {canManage && (
                  <button 
                    onClick={() => setSharingDoc(doc)}
                    className="p-2.5 text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-xl transition-all"
                    title="Security Settings"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Security Modal */}
      {sharingDoc && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setSharingDoc(null)}>
          <div className="bg-white w-full max-md:max-h-[80vh] overflow-y-auto max-w-md rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Security Policy</h2>
                <p className="text-sm text-slate-500">Classification for <span className="font-bold text-indigo-600">"{sharingDoc.title}"</span></p>
              </div>
              <button onClick={() => setSharingDoc(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-3">
                {(['PRIVATE', 'INTERNAL', 'PUBLIC'] as AccessLevel[]).map(level => (
                  <button
                    key={level}
                    onClick={() => setAccessLevel(sharingDoc, level)}
                    className={`flex items-start text-left p-4 rounded-2xl border-2 transition-all ${
                      sharingDoc.accessLevel === level 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' 
                      : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex-1">
                      <span className="text-xs font-black uppercase tracking-wider block">{level}</span>
                      <p className={`text-[10px] mt-0.5 ${sharingDoc.accessLevel === level ? 'text-indigo-100' : 'text-slate-400'}`}>
                        {level === 'PRIVATE' ? 'Owner Access Only (Password Lock)' : level === 'INTERNAL' ? 'Whitelisted Departments' : 'Organization Wide'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {sharingDoc.accessLevel === 'INTERNAL' && (
                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <label className="text-[10px] font-black text-indigo-900 uppercase tracking-widest block mb-3">Allowed Roles</label>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(Role).map(role => (
                      <button
                        key={role}
                        onClick={() => handleToggleRoleAccess(sharingDoc, role)}
                        className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg border transition-all ${
                          sharingDoc.roleAccess.includes(role)
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-indigo-400 border-indigo-100'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center space-x-3">
                <button onClick={() => setSharingDoc(null)} className="flex-1 py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl hover:bg-indigo-700 active:scale-95 transition-all">Apply Security</button>
                {onDelete && (
                  <button 
                    onClick={(e) => handleDelete(e as any, sharingDoc.id)}
                    className="p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 hover:bg-rose-100"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reader Mode Viewer */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4" onClick={handleCloseViewer}>
          <div className="bg-white w-full h-full max-w-[1000px] max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b flex justify-between items-center bg-white z-20">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-xl ${selectedDoc.type === 'pdf' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <h2 className="text-lg font-black text-slate-900 truncate max-w-md">{selectedDoc.title}</h2>
              </div>

              {isUnlocked && (
                <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl">
                  <button onClick={() => setViewMode('reader')} className={`px-4 py-2 text-[10px] font-black uppercase rounded-lg ${viewMode === 'reader' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Reader</button>
                  <button onClick={() => setViewMode('raw')} className={`px-4 py-2 text-[10px] font-black uppercase rounded-lg ${viewMode === 'raw' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Meta</button>
                </div>
              )}

              <div className="flex items-center space-x-3">
                {isUnlocked && (user.role === Role.ADMIN || selectedDoc.ownerId === user.id) && (
                  <button 
                    onClick={(e) => handleDelete(e as any, selectedDoc.id)}
                    className="p-2 text-rose-500 bg-rose-50 rounded-xl hover:bg-rose-100 transition-all"
                    title="Purge Document"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                )}
                {isUnlocked && selectedDoc.fileUrl && (
                  <button onClick={handleOpenNative} className="hidden md:flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    <span>Edge View</span>
                  </button>
                )}
                <button onClick={handleCloseViewer} className="p-2 text-slate-400 hover:text-slate-900 rounded-full bg-slate-100 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-100 flex flex-col items-center">
              {!isUnlocked ? (
                <div className="my-auto flex flex-col items-center space-y-6">
                  <div className={`w-20 h-20 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center shadow-lg transition-transform ${passwordError ? 'animate-shake' : ''}`}>
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-black text-slate-900">Encryption Active</h3>
                    <p className="text-sm text-slate-500 mt-1">This document is classified as PRIVATE.</p>
                  </div>
                  <form onSubmit={handleUnlock} className="w-full max-w-sm space-y-3">
                    <input 
                      type="password" 
                      required 
                      autoFocus 
                      value={passwordInput} 
                      onChange={(e) => setPasswordInput(e.target.value)} 
                      placeholder="ENTER CLEARANCE PASSWORD" 
                      className={`w-full px-6 py-4 border rounded-2xl text-center font-bold tracking-[0.3em] outline-none transition-all ${passwordError ? 'border-rose-300 bg-rose-50 text-rose-600 ring-4 ring-rose-50' : 'focus:ring-2 focus:ring-indigo-500'}`} 
                    />
                    {passwordError && <p className="text-[10px] text-rose-600 font-bold uppercase text-center animate-pulse">Access Denied: Invalid Credentials</p>}
                    <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-black uppercase text-xs rounded-2xl shadow-lg hover:bg-indigo-700">Verify & Decrypt</button>
                  </form>
                </div>
              ) : (
                <div className="bg-white w-full max-w-[900px] min-h-full shadow-lg transition-all">
                  {viewMode === 'reader' ? (
                    selectedDoc.type === 'pdf' && selectedDoc.fileUrl ? (
                      <div className="w-full h-full flex flex-col">
                        <iframe src={`${selectedDoc.fileUrl}#toolbar=1`} className="w-full flex-1 border-none min-h-[80vh]" title="PDF Viewer" />
                      </div>
                    ) : (
                      <div className="p-16 md:p-24 prose prose-slate prose-lg max-w-none">
                        <h1 className="text-4xl font-black text-slate-900 mb-8 border-b pb-8">{selectedDoc.title}</h1>
                        <p className="whitespace-pre-wrap font-serif text-slate-800 leading-relaxed text-xl">{selectedDoc.content}</p>
                      </div>
                    )
                  ) : (
                    <div className="p-16">
                      <h2 className="text-2xl font-black mb-8 text-slate-900 tracking-tight">System Metadata Audit</h2>
                      <pre className="bg-slate-900 text-indigo-400 p-8 rounded-3xl font-mono text-xs overflow-x-auto shadow-inner">
                        {JSON.stringify(selectedDoc, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="px-8 py-4 bg-slate-50 border-t flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span>SecureRAG Identity: {user.role}</span>
              <span>Classification: {selectedDoc.accessLevel}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentGrid;
