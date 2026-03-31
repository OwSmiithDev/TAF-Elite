import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Lock, Play, Search } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/services/supabase/client';
import { useAuthStore } from '@/store/auth.store';
import type { Database } from '@/types/database';

type Exercise = Database['public']['Tables']['exercises']['Row'];
type ExerciseContest = Database['public']['Tables']['exercise_contests']['Row'];
type ProfileTargetExam = Database['public']['Tables']['profile_target_exams']['Row'];
type Subscription = Database['public']['Tables']['subscriptions']['Row'];

export function ExercisesScreen() {
  const { user, profile } = useAuthStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Todos');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>(['Todos']);
  const [hasTargetContests, setHasTargetContests] = useState(true);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setIsLoading(true);

        if (!isSupabaseConfigured) {
          setExercises([]);
          setCategories(['Todos']);
          return;
        }

        const isAdmin = profile?.role === 'admin';
        const [
          { data: exerciseRows, error: exercisesError },
          { data: targetRows, error: targetError },
          { data: relationRows, error: relationError },
          { data: subscriptionRow, error: subscriptionError },
        ] = await Promise.all([
          supabase.from('exercises').select('*').eq('is_active', true).order('title'),
          user?.id
            ? supabase.from('profile_target_exams').select('*').eq('profile_id', user.id)
            : Promise.resolve({ data: [] as ProfileTargetExam[], error: null }),
          supabase.from('exercise_contests').select('*'),
          user?.id
            ? supabase.from('subscriptions').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(1).maybeSingle()
            : Promise.resolve({ data: null as Subscription | null, error: null }),
        ]);

        if (exercisesError) throw exercisesError;
        if (targetError) throw targetError;
        if (relationError) throw relationError;
        if (subscriptionError) throw subscriptionError;

        const allExercises = (exerciseRows as Exercise[]) || [];
        const selectedContests = ((targetRows as ProfileTargetExam[]) || []).map((item) => item.contest_id);
        const exerciseContestLinks = (relationRows as ExerciseContest[]) || [];
        const subscription = subscriptionRow as Subscription | null;
        const premiumEnabled =
          isAdmin || (subscription?.status === 'active' && (subscription?.plan_name || '').toLowerCase().includes('elite'));

        setHasPremiumAccess(premiumEnabled);
        setHasTargetContests(isAdmin || selectedContests.length > 0);

        const contestExerciseIds = new Set(
          exerciseContestLinks
            .filter((item) => selectedContests.includes(item.contest_id))
            .map((item) => item.exercise_id)
        );

        const rows = isAdmin
          ? allExercises
          : allExercises.filter((exercise) => {
              const matchesContest = selectedContests.length > 0 && contestExerciseIds.has(exercise.id);
              const hasPlanAccess = !exercise.is_premium || premiumEnabled;
              return matchesContest && hasPlanAccess;
            });

        const foundCategories = Array.from(new Set(rows.map((item) => item.category).filter(Boolean)));
        setExercises(rows);
        setCategories(['Todos', ...foundCategories]);
      } catch (error) {
        console.error('Error fetching exercises:', error);
        setExercises([]);
        setCategories(['Todos']);
        setHasTargetContests(false);
        setHasPremiumAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExercises();
  }, [profile?.role, user?.id]);

  const filteredExercises = useMemo(
    () =>
      exercises.filter(
        (exercise) =>
          (filter === 'Todos' || exercise.category === filter) &&
          exercise.title.toLowerCase().includes(search.toLowerCase())
      ),
    [exercises, filter, search]
  );

  return (
    <div className="flex min-h-full flex-col bg-[#0A0A0A] pb-24 font-sans text-zinc-100">
      <header className="sticky top-0 z-10 border-b border-zinc-900 bg-[#0A0A0A] px-6 pb-6 pt-12">
        <h1 className="text-2xl font-black uppercase tracking-tight">Biblioteca</h1>
        <p className="mt-1 text-xs font-mono uppercase tracking-widest text-zinc-500">Tecnica e execucao</p>

        <div className="relative mt-6">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar exercicio..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-[#0A0A0A] py-3 pl-10 pr-4 text-xs font-mono text-zinc-100 placeholder:text-zinc-600 transition-all focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </header>

      <div className="px-6 py-6">
        <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-6">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`whitespace-nowrap rounded px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                filter === category
                  ? 'bg-emerald-500 text-zinc-950'
                  : 'border border-zinc-800 bg-zinc-900 text-zinc-500 hover:bg-zinc-800'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : (
          <div className="space-y-3">
            {filteredExercises.map((exercise) => (
              <motion.div
                key={exercise.id}
                whileTap={{ scale: 0.98 }}
                className="group flex cursor-pointer items-center rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition-colors hover:border-zinc-700"
              >
                <div className="relative mr-4 flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-zinc-800 bg-[#0A0A0A] transition-colors group-hover:border-emerald-500/50">
                  <Play className="ml-0.5 h-4 w-4 text-zinc-500 transition-colors group-hover:text-emerald-500" />
                </div>

                <div className="flex-1">
                  <h3 className="mb-1 text-sm font-black uppercase tracking-tight">{exercise.title}</h3>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">{exercise.category}</span>
                </div>

                {exercise.is_premium && (
                  <div className="ml-4 rounded-lg border border-amber-500/20 bg-amber-500/10 p-1.5 text-amber-500">
                    <Lock className="h-3 w-3" />
                  </div>
                )}
              </motion.div>
            ))}

            {!hasTargetContests && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 text-center text-xs font-mono uppercase tracking-widest text-zinc-500">
                Selecione um ou mais concursos alvo em Preferencias para liberar sua biblioteca.
              </div>
            )}

            {hasTargetContests && filteredExercises.length === 0 && (
              <div className="py-12 text-center text-xs font-mono uppercase tracking-widest text-zinc-500">
                {hasPremiumAccess ? 'Nenhum exercicio encontrado.' : 'Nenhum exercicio free encontrado para seus concursos.'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
