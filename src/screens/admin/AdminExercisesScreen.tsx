import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Edit2, Trash2, Search, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '@/services/supabase/client';
import type { Database } from '@/types/database';

type Exercise = Database['public']['Tables']['exercises']['Row'];

export function AdminExercisesScreen() {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      setIsLoading(true);
      if (!isSupabaseConfigured) {
        // Mock data
        setExercises([
          {
            id: '1',
            title: 'Flexão de Braço',
            slug: 'flexao-braco',
            category: 'Força',
            difficulty_level: 'Iniciante',
            description: 'Exercício fundamental para peito e tríceps.',
            instructions: '',
            common_mistakes: '',
            tips: '',
            safety_notes: '',
            video_url: '',
            thumbnail_url: '',
            is_premium: false,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ]);
        return;
      }

      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('title');

      if (error) throw error;
      setExercises(data || []);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredExercises = exercises.filter(ex => 
    ex.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ex.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-50 overflow-hidden max-w-md mx-auto relative shadow-2xl">
      <div className="pt-12 pb-4 px-6 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/admin')}
              className="p-2 -ml-2 mr-2 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold font-sans tracking-tight">Exercícios</h1>
          </div>
          <button className="w-10 h-10 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl flex items-center justify-center transition-colors">
            <Plus className="w-5 h-5" />
          </button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar exercícios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-500 transition-colors font-mono"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : filteredExercises.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-zinc-500 font-mono">Nenhum exercício encontrado.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredExercises.map((exercise, index) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <h3 className="font-bold">{exercise.title}</h3>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded uppercase">
                      {exercise.category}
                    </span>
                    {!exercise.is_active && (
                      <span className="text-[10px] font-mono text-red-400 bg-red-900/30 px-2 py-0.5 rounded uppercase">
                        Inativo
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-zinc-400 hover:text-emerald-500 transition-colors bg-zinc-950 rounded-lg">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-zinc-400 hover:text-red-500 transition-colors bg-zinc-950 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
