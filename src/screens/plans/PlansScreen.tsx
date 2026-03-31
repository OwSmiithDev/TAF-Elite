import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Clock, Target, Lock } from 'lucide-react';

const mockPlans = [
  {
    id: 1,
    title: 'Iniciante Total',
    level: 'Iniciante',
    duration: '8 Semanas',
    objective: 'Criar base física',
    isPremium: false,
    isActive: true,
  },
  {
    id: 2,
    title: 'Foco Aprovação',
    level: 'Avançado',
    duration: '6 Semanas',
    objective: 'Atingir índice mínimo',
    isPremium: true,
    isActive: false,
  },
  {
    id: 3,
    title: 'Barra Zero',
    level: 'Iniciante',
    duration: '6 Semanas',
    objective: 'Ganhar força para barra',
    isPremium: false,
    isActive: false,
  },
];

export function PlansScreen() {
  const [filter, setFilter] = useState('Todos');

  return (
    <div className="flex flex-col min-h-full bg-[#0A0A0A] text-zinc-100 pb-24 font-sans">
      <header className="px-6 pt-12 pb-6 bg-[#0A0A0A] border-b border-zinc-900 sticky top-0 z-10">
        <h1 className="text-2xl font-black uppercase tracking-tight">Planos</h1>
        <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest mt-1">Escolha seu treinamento</p>
      </header>

      <div className="px-6 py-6">
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {['Todos', 'Iniciante', 'Intermediário', 'Avançado'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${
                filter === f
                  ? 'bg-emerald-500 text-zinc-950'
                  : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:bg-zinc-800'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Active Plan */}
        <div className="mb-8 mt-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-4 flex items-center">
            Plano Ativo
          </h2>
          <motion.div
            whileTap={{ scale: 0.98 }}
            className="bg-zinc-900 border border-emerald-500/30 rounded-xl p-6 relative overflow-hidden group cursor-pointer"
          >
            <h3 className="text-xl font-black uppercase tracking-tight mb-2">Iniciante Total</h3>
            <div className="flex items-center text-zinc-400 text-xs font-mono mb-6">
              <Target className="w-3 h-3 mr-2 text-emerald-500" />
              Criar base física
            </div>
            
            <div className="flex gap-3">
              <div className="flex items-center text-[10px] font-bold text-zinc-400 bg-[#0A0A0A] border border-zinc-800 px-2 py-1.5 rounded uppercase tracking-widest">
                <Clock className="w-3 h-3 text-emerald-500 mr-1.5" />
                8 Semanas
              </div>
              <div className="flex items-center text-[10px] font-bold text-zinc-400 bg-[#0A0A0A] border border-zinc-800 px-2 py-1.5 rounded uppercase tracking-widest">
                <Dumbbell className="w-3 h-3 text-emerald-500 mr-1.5" />
                Iniciante
              </div>
            </div>
          </motion.div>
        </div>

        {/* Plan List */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center">
            Explorar Planos
          </h2>
          
          {mockPlans.filter(p => !p.isActive && (filter === 'Todos' || p.level === filter)).map((plan) => (
            <motion.div
              key={plan.id}
              whileTap={{ scale: 0.98 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col relative overflow-hidden cursor-pointer hover:border-zinc-700 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-black uppercase tracking-tight">{plan.title}</h3>
                {plan.isPremium && (
                  <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-1.5 rounded-lg">
                    <Lock className="w-3 h-3" />
                  </div>
                )}
              </div>
              <p className="text-zinc-500 text-xs font-mono mb-4">{plan.objective}</p>
              
              <div className="flex gap-3 mt-auto">
                <span className="text-[10px] font-bold text-zinc-400 bg-[#0A0A0A] border border-zinc-800 px-2 py-1 rounded uppercase tracking-widest">
                  {plan.duration}
                </span>
                <span className="text-[10px] font-bold text-zinc-400 bg-[#0A0A0A] border border-zinc-800 px-2 py-1 rounded uppercase tracking-widest">
                  {plan.level}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
