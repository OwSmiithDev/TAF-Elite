import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Clock, Loader2, Lock, Target } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/services/supabase/client';
import { useAuthStore } from '@/store/auth.store';
import type { Database } from '@/types/database';

type TrainingPlan = Database['public']['Tables']['training_plans']['Row'];
type UserActivePlan = Database['public']['Tables']['user_active_plans']['Row'];

export function PlansScreen() {
  const [filter, setFilter] = useState('Todos');
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setIsLoading(true);

        if (!isSupabaseConfigured) {
          setPlans([]);
          setActivePlanId(null);
          return;
        }

        const [{ data: plansData, error: plansError }, { data: activeData, error: activeError }] = await Promise.all([
          supabase.from('training_plans').select('*').eq('is_active', true).order('created_at', { ascending: false }),
          user?.id
            ? supabase.from('user_active_plans').select('*').eq('user_id', user.id).eq('status', 'active').limit(1).maybeSingle()
            : Promise.resolve({ data: null as UserActivePlan | null, error: null }),
        ]);

        if (plansError) throw plansError;
        if (activeError) throw activeError;

        setPlans((plansData as TrainingPlan[]) || []);
        setActivePlanId((activeData as UserActivePlan | null)?.plan_id ?? null);
      } catch (error) {
        console.error('Error fetching plans:', error);
        setPlans([]);
        setActivePlanId(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, [user?.id]);

  const normalizedFilter = filter === 'Intermediário' ? 'Intermediario' : filter;
  const activePlan = plans.find((plan) => plan.id === activePlanId) ?? null;
  const availablePlans = plans.filter((plan) => plan.id !== activePlanId);
  const filteredPlans = availablePlans.filter((plan) => filter === 'Todos' || plan.level === normalizedFilter);

  return (
    <div className="flex min-h-full flex-col bg-[#0A0A0A] pb-24 font-sans text-zinc-100">
      <header className="sticky top-0 z-10 border-b border-zinc-900 bg-[#0A0A0A] px-6 pb-6 pt-12">
        <h1 className="text-2xl font-black uppercase tracking-tight">Planos</h1>
        <p className="mt-1 text-xs font-mono uppercase tracking-widest text-zinc-500">Escolha seu treinamento</p>
      </header>

      <div className="px-6 py-6">
        <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-4">
          {['Todos', 'Iniciante', 'Intermediário', 'Avançado'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`whitespace-nowrap rounded px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                filter === f
                  ? 'bg-emerald-500 text-zinc-950'
                  : 'border border-zinc-800 bg-zinc-900 text-zinc-500 hover:bg-zinc-800'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : (
          <>
            <div className="mb-8 mt-4">
              <h2 className="mb-4 flex items-center text-xs font-bold uppercase tracking-widest text-emerald-500">Plano Ativo</h2>
              {activePlan ? (
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  className="group relative cursor-pointer overflow-hidden rounded-xl border border-emerald-500/30 bg-zinc-900 p-6"
                >
                  <h3 className="mb-2 text-xl font-black uppercase tracking-tight">{activePlan.title}</h3>
                  <div className="mb-6 flex items-center text-xs font-mono text-zinc-400">
                    <Target className="mr-2 h-3 w-3 text-emerald-500" />
                    {activePlan.objective || 'Objetivo nao informado'}
                  </div>

                  <div className="flex gap-3">
                    <div className="flex items-center rounded border border-zinc-800 bg-[#0A0A0A] px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                      <Clock className="mr-1.5 h-3 w-3 text-emerald-500" />
                      {activePlan.duration_weeks ? `${activePlan.duration_weeks} Semanas` : 'Duracao livre'}
                    </div>
                    <div className="flex items-center rounded border border-zinc-800 bg-[#0A0A0A] px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                      <Dumbbell className="mr-1.5 h-3 w-3 text-emerald-500" />
                      {activePlan.level || 'Sem nivel'}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 text-xs font-mono uppercase tracking-widest text-zinc-500">
                  Nenhum plano ativo encontrado.
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h2 className="mb-4 flex items-center text-xs font-bold uppercase tracking-widest text-zinc-500">Explorar Planos</h2>

              {filteredPlans.length === 0 ? (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 text-xs font-mono uppercase tracking-widest text-zinc-500">
                  Nenhum plano encontrado.
                </div>
              ) : (
                filteredPlans.map((plan) => (
                  <motion.div
                    key={plan.id}
                    whileTap={{ scale: 0.98 }}
                    className="relative flex cursor-pointer flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition-colors hover:border-zinc-700"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <h3 className="text-lg font-black uppercase tracking-tight">{plan.title}</h3>
                      {plan.is_premium && (
                        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-1.5 text-amber-500">
                          <Lock className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    <p className="mb-4 text-xs font-mono text-zinc-500">{plan.objective || 'Objetivo nao informado'}</p>

                    <div className="mt-auto flex gap-3">
                      <span className="rounded border border-zinc-800 bg-[#0A0A0A] px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                        {plan.duration_weeks ? `${plan.duration_weeks} Semanas` : 'Duracao livre'}
                      </span>
                      <span className="rounded border border-zinc-800 bg-[#0A0A0A] px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                        {plan.level || 'Sem nivel'}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
