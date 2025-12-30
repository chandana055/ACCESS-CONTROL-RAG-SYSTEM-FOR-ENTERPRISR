
import React, { useState } from 'react';
import { Role, Document, User, AccessLevel } from '../types';

interface AdminPanelProps {
  documents: Document[];
  users: User[];
  onUpload: (doc: Document) => void;
  onUpdateRole: (userId: string, newRole: Role) => void;
  onDeleteUser: (userId: string) => void;
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

const AdminPanel: React.FC<AdminPanelProps> = ({ documents, users, onUpload, onUpdateRole, onDeleteUser }) => {
  const [newDoc, setNewDoc] = useState({
    title: '',
    content: '',
    roles: [Role.ADMIN] as Role[],
    accessLevel: 'INTERNAL' as AccessLevel
  });
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');

  const toggleRole = (role: Role) => {
    setNewDoc(prev => ({
      ...prev,
      roles: prev.roles.includes(role) 
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.title || !newDoc.content || uploadStatus === 'uploading') return;

    setUploadStatus('uploading');
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const doc: Document = {
        id: 'd' + Date.now(),
        title: newDoc.title,
        type: 'text',
        uploadDate: new Date().toISOString().split('T')[0],
        roleAccess: newDoc.accessLevel === 'PRIVATE' ? [] : (newDoc.accessLevel === 'PUBLIC' ? Object.values(Role) : newDoc.roles),
        accessLevel: newDoc.accessLevel,
        ownerId: 'SYSTEM', 
        author: 'Admin Indexer',
        fileSize: `${(newDoc.content.length / 1024).toFixed(1)} KB`,
        content: newDoc.content
      };

      onUpload(doc);
      setUploadStatus('success');
      setNewDoc({ title: '', content: '', roles: [Role.ADMIN], accessLevel: 'INTERNAL' });
      setTimeout(() => setUploadStatus('idle'), 4000);
    } catch (error) {
      setUploadStatus('error');
    }
  };

  const confirmDeleteUser = (userId: string, name: string) => {
    if (confirm(`Permanently revoke access for ${name}? This will remove them from the enterprise directory.`)) {
      onDeleteUser(userId);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* User Management Section */}
      <section className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="mb-10">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            User Directory & Access
          </h2>
          <p className="text-slate-500 mt-2 font-medium">Manage corporate identities and permission levels.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-3">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">
                <th className="pb-4 pl-4">Identity</th>
                <th className="pb-4">Email Address</th>
                <th className="pb-4">Permission Level</th>
                <th className="pb-4 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="bg-slate-50 hover:bg-slate-100 transition-colors group">
                  <td className="py-4 pl-4 rounded-l-2xl">
                    <div className="flex items-center space-x-3">
                      <img src={u.avatar} className="w-8 h-8 rounded-full border border-white shadow-sm" alt="" />
                      <span className="font-bold text-slate-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="text-sm font-medium text-slate-500">{u.email}</span>
                  </td>
                  <td className="py-4">
                    <select 
                      value={u.role} 
                      onChange={(e) => onUpdateRole(u.id, e.target.value as Role)}
                      className="bg-white border border-slate-200 rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="py-4 text-right pr-4 rounded-r-2xl">
                    <button 
                      onClick={() => confirmDeleteUser(u.id, u.name)}
                      className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                      title="Revoke Access"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Existing Ingest Engine */}
      <section className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex justify-between items-start mb-10">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-indigo-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              </div>
              System Ingest Engine
            </h2>
            <p className="text-slate-500 mt-2 font-medium">Bulk ingest content to the enterprise vault.</p>
          </div>
        </div>

        <form onSubmit={handleUpload} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Document Title</label>
              <input 
                type="text" 
                required 
                value={newDoc.title} 
                onChange={e => setNewDoc(p => ({...p, title: e.target.value}))} 
                placeholder="e.g. Q4 Strategy Review"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-bold transition-all" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Classification Policy</label>
              <select 
                value={newDoc.accessLevel} 
                onChange={e => setNewDoc(p => ({...p, accessLevel: e.target.value as AccessLevel}))} 
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500"
              >
                <option value="PRIVATE">Private (Restricted)</option>
                <option value="INTERNAL">Internal (Role Based)</option>
                <option value="PUBLIC">Public (Organization Wide)</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Raw Text Payload</label>
            <textarea 
              required 
              rows={8} 
              value={newDoc.content} 
              onChange={e => setNewDoc(p => ({...p, content: e.target.value}))} 
              placeholder="Enter full document text for RAG indexing..."
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-mono text-sm leading-relaxed transition-all" 
            />
          </div>

          {newDoc.accessLevel === 'INTERNAL' && (
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Whitelist Clearances</label>
              <div className="flex flex-wrap gap-2">
                {Object.values(Role).map(role => (
                  <button 
                    key={role} 
                    type="button" 
                    onClick={() => toggleRole(role)} 
                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${newDoc.roles.includes(role) ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-400'}`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={uploadStatus === 'uploading'} 
            className={`w-full py-5 text-xs font-black uppercase tracking-[0.3em] rounded-[1.5rem] transition-all flex items-center justify-center space-x-4 shadow-xl active:scale-95 ${
              uploadStatus === 'uploading' 
                ? 'bg-slate-200 text-slate-400 shadow-none' 
                : uploadStatus === 'success'
                  ? 'bg-emerald-500 text-white shadow-emerald-100'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
            }`}
          >
            {uploadStatus === 'uploading' ? 'Indexing...' : uploadStatus === 'success' ? 'Committed to Storage' : 'Commit Intelligence Asset'}
          </button>
        </form>
      </section>
    </div>
  );
};

export default AdminPanel;
