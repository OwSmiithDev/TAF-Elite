import { motion } from 'framer-motion';
import { Shield, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function WelcomeScreen() {
  return (
    <div className="flex flex-col h-screen bg-[#0A0A0A] text-zinc-100 overflow-hidden relative max-w-md mx-auto shadow-2xl font-sans">
      {/* Background Image/Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/50 to-[#0A0A0A] z-0" />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1599058945522-28d584b6f4ff?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" />

      <div className="relative z-10 flex flex-col flex-1 px-6 pt-20 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 flex flex-col justify-center"
        >
          <Shield className="w-16 h-16 text-emerald-500 mb-6" strokeWidth={1.5} />
          <h1 className="text-5xl font-black uppercase tracking-tighter leading-none mb-4">
            Treine com <br />
            <span className="text-emerald-500">Método</span>
          </h1>
          <p className="text-sm text-zinc-400 mb-8 max-w-sm leading-relaxed font-mono">
            O único aplicativo especializado em preparação física para concursos policiais e militares.
          </p>

          <div className="space-y-4">
            <div className="flex items-center text-xs font-bold uppercase tracking-widest text-zinc-300">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-3" />
              Barra Fixa, Flexão e Corrida
            </div>
            <div className="flex items-center text-xs font-bold uppercase tracking-widest text-zinc-300">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-3" />
              Simulados de Editais
            </div>
            <div className="flex items-center text-xs font-bold uppercase tracking-widest text-zinc-300">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-3" />
              Planos de Treino Estruturados
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="space-y-3 mt-auto"
        >
          <Link
            to="/register"
            className="flex items-center justify-center w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold uppercase tracking-widest rounded-xl transition-colors group"
          >
            Começar Agora
            <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="flex items-center justify-center w-full py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold uppercase tracking-widest rounded-xl border border-zinc-800 transition-colors"
          >
            Já tenho conta
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
