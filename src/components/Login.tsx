import { Cloud, Lock, ShieldCheck, Zap } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { motion } from "motion/react";

export function Login() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-nexus-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background purely decorative elements */}
      <div className="absolute top-0 right-0 w-[80vw] h-[80vw] bg-nexus-accent/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-[60vw] h-[60vw] bg-purple-500/5 rounded-full translate-y-1/3 -translate-x-1/4 blur-3xl"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl w-full grid md:grid-cols-2 gap-16 items-center relative z-10"
      >
        <div className="space-y-8">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-nexus-accent rounded-xl flex items-center justify-center shadow-lg shadow-nexus-accent/30 text-white">
              <Cloud className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">Nebula</span>
          </div>
          
          <h1 className="text-7xl font-light text-white leading-[1] tracking-tight">
            Your Files, <br/>
            Truly <span className="italic font-normal text-nexus-accent">Nebular.</span>
          </h1>
          
          <p className="text-lg text-slate-400 leading-relaxed max-w-sm">
            Experience the most sophisticated way to manage your Google Drive. Encrypted, clean, and blazingly fast.
          </p>

          <div className="flex flex-wrap gap-6 pt-4">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
              <Zap className="w-4 h-4 text-nexus-accent" />
              <span>Insta-Sync</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
              <Lock className="w-4 h-4 text-nexus-accent" />
              <span>Vault Security</span>
            </div>
          </div>
        </div>

        <div className="bg-[#111114] border border-white/5 p-12 rounded-[2rem] shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-nexus-accent to-transparent"></div>
          
          <div className="w-20 h-20 bg-nexus-accent/10 rounded-3xl flex items-center justify-center mb-8 border border-nexus-accent/20">
            <ShieldCheck className="w-10 h-10 text-nexus-accent" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Initialize Session</h2>
          <p className="text-slate-500 text-sm mb-10 leading-relaxed">Vault encryption ready. Connect your Google account <br/> to synchronize your terminal.</p>
          
          <button 
            onClick={login}
            className="w-full flex items-center justify-center gap-4 bg-white text-black py-4 px-8 rounded-2xl hover:bg-slate-200 transition-all shadow-xl font-bold text-sm active:scale-[0.98]"
          >
             <svg className="w-5 h-5 font-bold" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Conectar con Google</span>
          </button>

          <div className="mt-8 p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-left">
            <p className="text-[11px] text-amber-200/80 leading-relaxed">
              <span className="font-bold text-amber-400 block mb-1">¡IMPORTANTE PARA EL ACCESO!</span>
              Debido a las políticas de seguridad de los navegadores, si el inicio de sesión falla (la ventana se cierra pero no entras), por favor haz clic en el icono <b>"Open in new tab" ↗️</b> situado arriba a la derecha de esta ventana y prueba de nuevo desde allí.
            </p>
          </div>
          
          <div className="mt-10 flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-600">
            <span className="flex items-center gap-1.5"><div className="w-1 h-1 bg-green-500 rounded-full"></div> Servers Live</span>
            <span className="flex items-center gap-1.5"><div className="w-1 h-1 bg-nexus-accent rounded-full"></div> OAuth 2.0</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
