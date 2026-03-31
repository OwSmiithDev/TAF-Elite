import { motion } from 'framer-motion';
import { Play, Flame, Trophy, Target, ChevronRight, Activity } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

export function HomeScreen() {
  const { profile } = useAuthStore();
  const userName = profile?.full_name?.split(' ')[0] || 'Guerreiro';

  return (
    <div className="flex flex-col min-h-full bg-[#0A0A0A] text-zinc-100 pb-24 font-sans">
      {/* Header */}
      <header className="px-6 pt-12 pb-6 bg-[#0A0A0A] border-b border-zinc-900 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest mb-1">
              Bom dia,
            </p>
            <h1 className="text-2xl font-black uppercase tracking-tight">{userName}</h1>
          </div>
          <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg font-bold text-zinc-500">{userName.charAt(0)}</span>
            )}
          </div>
        </div>
      </header>

      <div className="px-6 py-8 space-y-8">
        {/* Treino do Dia */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center">
              Treino do Dia
            </h2>
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded uppercase tracking-widest">
              Semana 2 - Dia 3
            </span>
          </div>

          <motion.div
            whileTap={{ scale: 0.98 }}
            className="relative overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800 group cursor-pointer"
          >
            <div className="p-6 relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight mb-1">
                    Força & Core
                  </h3>
                  <p className="text-zinc-500 text-xs font-mono">Foco em Barra Fixa e Abdominal</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center group-hover:bg-emerald-400 transition-colors">
                  <Play className="w-4 h-4 text-zinc-950 fill-current ml-0.5" />
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex items-center text-[10px] font-bold text-zinc-400 bg-[#0A0A0A] border border-zinc-800 px-2 py-1.5 rounded uppercase tracking-widest">
                  <Activity className="w-3 h-3 text-emerald-500 mr-1.5" />
                  45 min
                </div>
                <div className="flex items-center text-[10px] font-bold text-zinc-400 bg-[#0A0A0A] border border-zinc-800 px-2 py-1.5 rounded uppercase tracking-widest">
                  <Flame className="w-3 h-3 text-orange-500 mr-1.5" />
                  Alta Int.
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Resumo de Evolução */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center">
            Seu Progresso
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-orange-500" />
                </div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Sequência</span>
              </div>
              <div>
                <span className="text-2xl font-black font-mono tracking-tighter">4</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">dias</span>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-blue-500" />
                </div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Treinos</span>
              </div>
              <div>
                <span className="text-2xl font-black font-mono tracking-tighter">12</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">total</span>
              </div>
            </div>
          </div>
        </section>

        {/* Atalhos Rápidos */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center">
            Acesso Rápido
          </h2>

          <div className="space-y-2">
            <button className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 flex items-center justify-between hover:bg-zinc-900 transition-colors">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mr-4">
                  <Target className="w-4 h-4 text-purple-500" />
                </div>
                <div className="text-left">
                  <h4 className="font-bold uppercase tracking-wide text-xs">Simulado TAF</h4>
                  <p className="text-[10px] font-mono text-zinc-500 mt-0.5">Teste seus índices agora</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
