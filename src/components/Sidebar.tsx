import React from 'react';
import { 
  FolderIcon, 
  Clock, 
  Users, 
  Star, 
  Trash2, 
  Cloud, 
  Plus,
  LayoutGrid,
  FileText,
  Image as ImageIcon,
  Video,
  Music
} from "lucide-react";
import { motion } from "motion/react";

const navItems = [
  { id: 'all', icon: LayoutGrid, label: 'All Files' },
  { id: 'recent', icon: Clock, label: 'Recent' },
  { id: 'starred', icon: Star, label: 'Favorites' },
  { id: 'shared', icon: Users, label: 'Shared' },
  { id: 'trash', icon: Trash2, label: 'Trash' },
];

const categoryItems = [
  { icon: FileText, label: 'Documents', color: 'text-blue-500' },
  { icon: ImageIcon, label: 'Images', color: 'text-purple-500' },
  { icon: Video, label: 'Media', color: 'text-pink-500' },
  { icon: Music, label: 'Audio', color: 'text-orange-500' },
];

export function Sidebar({ activeTab, onTabChange, onUpload }: { activeTab: string, onTabChange: (tab: string) => void, onUpload: (file: File) => void }) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <aside className="w-72 bg-nexus-sidebar border-r border-nexus-border h-screen sticky top-0 flex flex-col p-6 overflow-y-auto">
      <div className="p-4 flex items-center gap-3 mb-10">
        <div className="w-8 h-8 bg-nexus-accent rounded-lg flex items-center justify-center shadow-lg shadow-nexus-accent/20">
          <Cloud className="text-white w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white">Nebula</h1>
      </div>

      <div className="relative mb-8 px-2">
        <input 
          type="file" 
          id="file-upload" 
          className="hidden" 
          onChange={handleFileChange}
        />
        <label 
          htmlFor="file-upload"
          className="flex items-center justify-center gap-2 w-full bg-white text-black py-3.5 rounded-xl shadow-xl hover:bg-slate-200 transition-all cursor-pointer font-bold text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Upload</span>
        </label>
      </div>

      <nav className="flex-1 space-y-1 mb-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-4 px-3">Storage</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-4 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive ? 'nav-item-active' : 'nav-item-inactive'
              }`}
            >
              <Icon className="w-5 h-5 opacity-70" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cloud Usage</span>
          <span className="text-[10px] font-bold text-nexus-accent">78%</span>
        </div>
        <div className="w-full h-1 bg-white/10 rounded-full mb-3">
          <div className="h-full w-[78%] bg-nexus-accent rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
        </div>
        <p className="text-[10px] text-slate-500">11.7 GB of 15 GB Used</p>
        <button className="w-full mt-4 py-2 bg-nexus-accent/10 text-nexus-accent rounded-lg text-[10px] font-bold border border-nexus-accent/20 hover:bg-nexus-accent hover:text-white transition-all uppercase tracking-widest">
          Upgrade
        </button>
      </div>
    </aside>
  );
}
