import { MoreVertical, File, Folder, FileImage, FileText, FileVideo, Music } from "lucide-react";
import { DriveFile } from "../hooks/useDrive";
import { motion } from "motion/react";

const getFileIcon = (mimeType: string) => {
  if (mimeType === 'application/vnd.google-apps.folder') return <Folder className="text-amber-400 fill-amber-400" />;
  if (mimeType.startsWith('image/')) return <FileImage className="text-purple-500" />;
  if (mimeType.includes('pdf') || mimeType.includes('text')) return <FileText className="text-blue-500" />;
  if (mimeType.startsWith('video/')) return <FileVideo className="text-pink-500" />;
  if (mimeType.startsWith('audio/')) return <Music className="text-orange-500" />;
  return <File className="text-nexus-muted" />;
};

function FileCard({ file, index }: { file: DriveFile, index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ scale: 1.02 }}
      className="bg-[#111114] border border-white/5 rounded-3xl p-6 group cursor-pointer hover:border-nexus-accent/50 hover:bg-white/[0.03] transition-all overflow-hidden relative"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="w-12 h-12 bg-nexus-accent/10 rounded-2xl flex items-center justify-center text-nexus-accent border border-nexus-accent/20 group-hover:bg-nexus-accent group-hover:text-white transition-all duration-300">
          {getFileIcon(file.mimeType)}
        </div>
        <button className="p-2 hover:bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreVertical className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      <div className="space-y-1">
        <h3 className="font-medium text-white text-sm truncate pr-2" title={file.name}>
          {file.name}
        </h3>
        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
          {file.mimeType.split('/').pop()?.split('.').pop() || 'File'}
        </p>
      </div>

      <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">
          {new Date(file.modifiedTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </span>
        <div className="text-[10px] font-bold text-nexus-accent italic bg-nexus-accent/10 px-2 py-0.5 rounded-md">
          {file.size ? `${(parseInt(file.size) / (1024 * 1024)).toFixed(1)}MB` : 'OWNER'}
        </div>
      </div>
    </motion.div>
  );
}

export function FileGrid({ files, loading }: { files: DriveFile[], loading: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="glass-card h-48 animate-pulse bg-black/5"></div>
        ))}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center mb-6">
          <Folder className="w-10 h-10 text-nexus-muted" />
        </div>
        <h2 className="text-2xl font-display font-medium mb-2">No files found</h2>
        <p className="text-nexus-muted max-w-xs">Try searching for something else or upload a new file to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
      {files.map((file, i) => (
        <div key={file.id}>
          <FileCard file={file} index={i} />
        </div>
      ))}
    </div>
  );
}
