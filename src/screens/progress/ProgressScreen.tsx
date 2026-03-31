import { motion } from 'framer-motion';
import { Activity, TrendingUp, Trophy, Calendar } from 'lucide-react';

export function ProgressScreen() {
  return (
    <div className="flex flex-col min-h-full bg-[#0A0A0A] text-zinc-100 pb-24 font-sans">
      <header className="px-6 pt-12 pb-6 bg-[#0A0A0A] border-b border-zinc-900 sticky top-0 z-10">
        <h1 className="text-2xl font-black uppercase tracking-tight">Evolução</h1>
        <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest mt-1">Acompanhe seus índices</p>
      </header>

      <div className="px-6 py-8 space-y-8">
        {/* Resumo */}
        <section>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-emerald-500" />
                </div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Treinos</span>
              </div>
              <div className="relative z-10">
                <span className="text-2xl font-black font-mono tracking-tighter">12</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">concluídos</span>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                </div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Simulados</span>
              </div>
              <div className="relative z-10">
                <span className="text-2xl font-black font-mono tracking-tighter">2</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">realizados</span>
              </div>
            </div>
          </div>
        </section>

        {/* Recordes Pessoais */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-4 flex items-center">
            Recordes Pessoais
          </h2>

          <div className="space-y-3">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-[#0A0A0A] border border-zinc-800 rounded-lg flex items-center justify-center mr-4">
                  <Trophy className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight mb-1">Barra Fixa</h3>
                  <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">Último teste: 12/05</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-black font-mono tracking-tighter">8</span>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">reps</span>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-[#0A0A0A] border border-zinc-800 rounded-lg flex items-center justify-center mr-4">
                  <Trophy className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight mb-1">Flexão</h3>
                  <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">Último teste: 12/05</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-black font-mono tracking-tighter">32</span>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">reps</span>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-[#0A0A0A] border border-zinc-800 rounded-lg flex items-center justify-center mr-4">
                  <Trophy className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight mb-1">Corrida 2.4km</h3>
                  <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">Último teste: 10/05</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-black font-mono tracking-tighter">11:45</span>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">min</span>
              </div>
            </div>
          </div>
        </section>

        {/* Histórico */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center">
            Histórico Recente
          </h2>

          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center mr-4">
                    <Calendar className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div>
                    <h4 className="font-bold uppercase tracking-wide text-xs">Treino Concluído</h4>
                    <p className="text-[10px] font-mono text-zinc-500 mt-0.5">Força & Core</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  Ontem
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
