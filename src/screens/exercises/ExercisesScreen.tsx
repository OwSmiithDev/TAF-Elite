import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Play, Lock } from 'lucide-react';

const mockExercises = [
  { id: 1, title: 'Barra Fixa Pronada', category: 'Barra', isPremium: false },
  { id: 2, title: 'Barra Fixa Supinada', category: 'Barra', isPremium: true },
  { id: 3, title: 'Flexão Tradicional', category: 'Flexão', isPremium: false },
  { id: 4, title: 'Abdominal Remador', category: 'Abdominal', isPremium: false },
  { id: 5, title: 'Corrida Contínua', category: 'Corrida', isPremium: false },
  { id: 6, title: 'Tiro Curto (Sprints)', category: 'Corrida', isPremium: true },
];

export function ExercisesScreen() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Todos');

  const categories = ['Todos', 'Barra', 'Flexão', 'Abdominal', 'Corrida'];

  const filteredExercises = mockExercises.filter(
    (ex) =>
      (filter === 'Todos' || ex.category === filter) &&
      ex.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-full bg-[#0A0A0A] text-zinc-100 pb-24 font-sans">
      <header className="px-6 pt-12 pb-6 bg-[#0A0A0A] border-b border-zinc-900 sticky top-0 z-10">
        <h1 className="text-2xl font-black uppercase tracking-tight">Biblioteca</h1>
        <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest mt-1">Técnica e execução</p>
        
        <div className="mt-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar exercício..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-lg py-3 pl-10 pr-4 text-xs font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
          />
        </div>
      </header>

      <div className="px-6 py-6">
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-6 scrollbar-hide">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${
                filter === c
                  ? 'bg-emerald-500 text-zinc-950'
                  : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:bg-zinc-800'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Exercise List */}
        <div className="space-y-3">
          {filteredExercises.map((ex) => (
            <motion.div
              key={ex.id}
              whileTap={{ scale: 0.98 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center cursor-pointer hover:border-zinc-700 transition-colors group"
            >
              <div className="w-12 h-12 bg-[#0A0A0A] border border-zinc-800 rounded-lg flex items-center justify-center mr-4 relative overflow-hidden group-hover:border-emerald-500/50 transition-colors">
                <Play className="w-4 h-4 text-zinc-500 group-hover:text-emerald-500 transition-colors ml-0.5" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-sm font-black uppercase tracking-tight mb-1">{ex.title}</h3>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                  {ex.category}
                </span>
              </div>

              {ex.isPremium && (
                <div className="ml-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 p-1.5 rounded-lg">
                  <Lock className="w-3 h-3" />
                </div>
              )}
            </motion.div>
          ))}
          
          {filteredExercises.length === 0 && (
            <div className="text-center py-12 text-xs font-mono text-zinc-500 uppercase tracking-widest">
              Nenhum exercício encontrado.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
