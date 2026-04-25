import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useDrive } from './hooks/useDrive';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { FileGrid } from './components/FileGrid';
import { Login } from './components/Login';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpDown, Filter, LayoutGrid, List } from 'lucide-react';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { files, loading, fetchFiles, uploadFile } = useDrive();

  useEffect(() => {
    // Construct query based on active tab and search
    let q = "trashed = false";
    if (activeTab === 'starred') q += " and starred = true";
    if (activeTab === 'trash') q = "trashed = true";
    if (searchQuery) q += ` and name contains '${searchQuery}'`;
    
    fetchFiles(q);
  }, [activeTab, searchQuery, fetchFiles]);

  return (
    <div className="flex min-h-screen bg-nexus-bg">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onUpload={uploadFile} 
      />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar onSearch={setSearchQuery} />
        
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <h2 className="text-4xl font-extralight text-white mb-2 capitalize tracking-tight">{activeTab.replace('-', ' ')}</h2>
              <p className="text-slate-500 text-sm italic">A unified view of your secure cloud library</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl">
                <button className="p-2 rounded-lg bg-nexus-accent text-white shadow-lg shadow-nexus-accent/20 transition-all">
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg text-slate-500 hover:text-white transition-all">
                  <List className="w-4 h-4" />
                </button>
              </div>
              
              <button className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:bg-white/10 transition-all">
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
            </div>
          </motion.div>

          <div className="mb-6 flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-slate-500 px-2 pb-4 border-b border-white/5">
             <div className="flex items-center gap-2">
               <span>Name</span>
               <ArrowUpDown className="w-3 h-3" />
             </div>
             <div className="flex items-center gap-12">
               <span>Last Modified</span>
               <span className="w-20 text-right">Size</span>
             </div>
          </div>

          <FileGrid files={files} loading={loading} />
        </div>
      </main>
    </div>
  );
}

function MainContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-nexus-bg">
        <div className="w-12 h-12 border-4 border-nexus-border border-t-nexus-accent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {user ? (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Dashboard />
        </motion.div>
      ) : (
        <motion.div
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Login />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
