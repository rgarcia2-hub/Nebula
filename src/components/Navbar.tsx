import { Search, Bell, User, LogOut, Grid, List as ListIcon } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { motion } from "motion/react";

export function Navbar({ onSearch }: { onSearch: (query: string) => void }) {
  const { user, logout } = useAuth();

  return (
    <header className="h-20 border-b border-nexus-border bg-nexus-bg/50 backdrop-blur-md sticky top-0 z-30 px-8 flex items-center justify-between">
      <div className="flex-1 max-w-2xl px-4 relative group">
        <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-nexus-accent transition-colors" />
        <input
          type="text"
          placeholder="Search in your private cloud..."
          className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-12 pr-6 text-sm focus:border-nexus-accent/50 transition-all outline-none"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center gap-2 bg-[#1A1A1D] border border-white/5 rounded-full px-4 py-1.5">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Drive Synced</span>
        </div>

        <button className="p-2 hover:bg-white/5 rounded-full transition-colors relative">
          <Bell className="w-5 h-5 text-slate-400 hover:text-white transition-colors" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-nexus-accent rounded-full border border-nexus-bg"></span>
        </button>

        <div className="flex items-center gap-4 pl-6 border-l border-nexus-border">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 underline cursor-pointer hover:text-nexus-accent transition-colors" onClick={logout}>Sign out</p>
          </div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-nexus-accent to-purple-500 overflow-hidden border border-white/10 shadow-lg shadow-nexus-accent/20"
          >
            {user?.picture ? (
              <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-full h-full p-2 text-white" />
            )}
          </motion.div>
        </div>
      </div>
    </header>
  );
}
