
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import DocumentGrid from './components/DocumentGrid';
import AIAssistant from './components/AIAssistant';
import AdminPanel from './components/AdminPanel';
import DocumentUploadBar from './components/DocumentUploadBar';
import { User, Document, Role } from './types';
import { MOCK_USERS, DUMMY_DOCUMENTS } from './constants';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Persistence Layer
  const [documents, setDocuments] = useState<Document[]>(() => {
    const saved = localStorage.getItem('secure_rag_docs');
    return saved ? JSON.parse(saved) : DUMMY_DOCUMENTS;
  });
  
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('secure_rag_users');
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  const [isLoggingIn, setIsLoggingIn] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('secure_rag_docs', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('secure_rag_users', JSON.stringify(users));
  }, [users]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    const user = users.find(u => u.email === loginEmail && u.password === loginPassword);
    
    if (user) {
      setCurrentUser(user);
      setIsLoggingIn(false);
      setLoginEmail('');
      setLoginPassword('');
    } else {
      setLoginError('Invalid enterprise credentials. Access Denied.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggingIn(true);
    setActiveTab('dashboard');
  };

  const handleUpload = (newDoc: Document) => {
    if (!currentUser) return;
    const enrichedDoc: Document = { 
      ...newDoc, 
      ownerId: currentUser.id, 
      author: currentUser.name 
    };
    setDocuments(prev => [enrichedDoc, ...prev]);
  };

  const handleDeleteDoc = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const handleUpdateDocAccess = (id: string, updates: Partial<Document>) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const handleUpdateRole = (userId: string, newRole: Role) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, role: newRole } : null);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser?.id) {
      alert("You cannot delete your own administrative account.");
      return;
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const authorizedDocs = useMemo(() => {
    if (!currentUser) return [];
    return documents.filter(doc => {
      if (doc.accessLevel === 'PRIVATE') {
        return doc.ownerId === currentUser.id || currentUser.role === Role.ADMIN;
      }
      if (doc.accessLevel === 'INTERNAL') {
        return doc.roleAccess.includes(currentUser.role) || currentUser.role === Role.ADMIN;
      }
      return true; // PUBLIC
    });
  }, [documents, currentUser]);

  if (isLoggingIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 overflow-hidden relative">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/20 blur-[120px] rounded-full"></div>

        <div className="max-w-md w-full bg-white rounded-[2rem] p-10 shadow-2xl relative z-10 border border-slate-100 animate-in fade-in zoom-in duration-500">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center font-black text-4xl mx-auto mb-6 shadow-xl shadow-indigo-200">S</div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">SecureRAG</h1>
            <p className="text-slate-500 font-medium tracking-wide">Enterprise Data Storage</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Identity Email</label>
              <input 
                type="email" 
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="ceo@enterprise.com"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-slate-900 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Secret Key</label>
              <input 
                type="password" 
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-slate-900 font-medium"
              />
            </div>

            {loginError && (
              <div className="bg-red-50 text-red-600 text-[10px] font-black uppercase p-3 rounded-xl border border-red-100 text-center tracking-widest">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] mt-2"
            >
              Authorize Access
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-50">
             <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest leading-loose">
               Vault Storage: {documents.length} Files Active
             </p>
             <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="bg-slate-50 p-2 rounded-lg text-center cursor-pointer hover:bg-slate-100" onClick={() => {setLoginEmail('ceo@enterprise.com'); setLoginPassword('ceo123');}}>
                   <p className="text-[8px] text-slate-400 font-bold uppercase">Root User</p>
                   <p className="text-[10px] text-indigo-600 font-bold">CEO</p>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg text-center cursor-pointer hover:bg-slate-100" onClick={() => {setLoginEmail('staff@enterprise.com'); setLoginPassword('staff123');}}>
                   <p className="text-[8px] text-slate-400 font-bold uppercase">Standard User</p>
                   <p className="text-[10px] text-indigo-600 font-bold">Employee</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (!currentUser) return null;

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8 animate-in fade-in duration-700">
            <DocumentUploadBar onUpload={handleUpload} currentUserRole={currentUser.role} />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-100 group transition-all hover:scale-[1.02]">
                <div className="bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">Total Documents</p>
                <h3 className="text-4xl font-black">{authorizedDocs.length}</h3>
                <p className="text-indigo-200 text-[10px] mt-4 font-bold uppercase tracking-widest">Accessible Files</p>
              </div>
              
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm transition-all hover:shadow-md">
                <div className="bg-slate-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                   <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                </div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Active Role</p>
                <h3 className="text-4xl font-black text-slate-900 uppercase">{currentUser.role}</h3>
                <div className="flex items-center mt-4 space-x-1">
                  <div className="h-1.5 w-full bg-indigo-50 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: currentUser.role === Role.ADMIN ? '100%' : currentUser.role === Role.HR ? '75%' : currentUser.role === Role.MANAGER ? '50%' : '25%' }}></div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm transition-all hover:shadow-md">
                <div className="bg-slate-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                   <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Your Uploads</p>
                <h3 className="text-4xl font-black text-slate-900">{documents.filter(d => d.ownerId === currentUser.id).length}</h3>
                <p className="text-slate-400 text-[10px] mt-4 font-medium uppercase tracking-widest">Owner Rights Active</p>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-6 px-2">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Recent Activity</h2>
                  <p className="text-sm text-slate-500">Latest document entries</p>
                </div>
                <button 
                  onClick={() => setActiveTab('documents')} 
                  className="px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all active:scale-95"
                >
                  View All Documents
                </button>
              </div>
              <DocumentGrid 
                documents={authorizedDocs.slice(0, 3)} 
                user={currentUser} 
                onDelete={handleDeleteDoc}
                onUpdateAccess={handleUpdateDocAccess}
              />
            </div>
          </div>
        );
      case 'documents':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <DocumentUploadBar onUpload={handleUpload} currentUserRole={currentUser.role} />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 px-2">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Documents</h1>
                <p className="text-slate-500 font-medium">Secure storage for {authorizedDocs.length} accessible files.</p>
              </div>
            </div>
            <DocumentGrid 
              documents={authorizedDocs} 
              user={currentUser} 
              onDelete={handleDeleteDoc}
              onUpdateAccess={handleUpdateDocAccess}
            />
          </div>
        );
      case 'ai-assistant':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="px-2">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Secure RAG Assistant</h1>
              <p className="text-slate-500 font-medium italic">Analyzing {authorizedDocs.length} authorized documents for answers.</p>
            </div>
            <AIAssistant authorizedDocs={authorizedDocs} />
          </div>
        );
      case 'admin':
        return (
          <div className="space-y-6">
            <AdminPanel 
              documents={documents} 
              users={users} 
              onUpload={handleUpload} 
              onUpdateRole={handleUpdateRole}
              onDeleteUser={handleDeleteUser}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900">
      <Sidebar 
        currentUser={currentUser!} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
      />
      <main className="flex-1 ml-64 p-10 max-w-[1400px] mx-auto min-h-screen flex flex-col">
        <header className="flex justify-between items-center mb-10 px-2">
          <div className="flex items-center space-x-4">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <h2 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{activeTab}</h2>
              <p className="text-slate-900 font-bold text-sm">Identity Verified: <span className="text-indigo-600">{currentUser?.name}</span></p>
            </div>
          </div>
          <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Status</div>
             <div className="px-2 py-0.5 bg-green-50 text-green-600 text-[8px] font-black rounded-lg border border-green-100">STABLE</div>
          </div>
        </header>

        <div className="flex-1 pb-10">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
