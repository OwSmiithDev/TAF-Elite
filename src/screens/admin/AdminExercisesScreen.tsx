import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Edit2, Loader2, Plus, Search, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/services/supabase/client';
import type { Database } from '@/types/database';

type Exercise = Database['public']['Tables']['exercises']['Row'];
type Contest = Database['public']['Tables']['contests']['Row'];
type ExerciseContest = Database['public']['Tables']['exercise_contests']['Row'];

type ExerciseFormState = {
  id?: string;
  title: string;
  slug: string;
  category: string;
  difficulty_level: string;
  description: string;
  instructions: string;
  common_mistakes: string;
  tips: string;
  safety_notes: string;
  video_url: string;
  thumbnail_url: string;
  reps_text: string;
  sets_count: string;
  rest_seconds: string;
  estimated_duration_minutes: string;
  equipment: string;
  is_premium: boolean;
  is_active: boolean;
  contest_ids: string[];
};

const emptyExerciseForm: ExerciseFormState = {
  title: '',
  slug: '',
  category: '',
  difficulty_level: '',
  description: '',
  instructions: '',
  common_mistakes: '',
  tips: '',
  safety_notes: '',
  video_url: '',
  thumbnail_url: '',
  reps_text: '',
  sets_count: '',
  rest_seconds: '',
  estimated_duration_minutes: '',
  equipment: '',
  is_premium: false,
  is_active: true,
  contest_ids: [],
};

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toNullableNumber(value: string) {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export function AdminExercisesScreen() {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [contests, setContests] = useState<Contest[]>([]);
  const [exerciseContests, setExerciseContests] = useState<ExerciseContest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<ExerciseFormState>(emptyExerciseForm);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [{ data: exercisesData, error: exercisesError }, { data: contestsData, error: contestsError }, { data: linksData, error: linksError }] = await Promise.all([
        supabase.from('exercises').select('*').order('title'),
        supabase.from('contests').select('*').order('name'),
        supabase.from('exercise_contests').select('*'),
      ]);

      if (exercisesError) throw exercisesError;
      if (contestsError) throw contestsError;
      if (linksError) throw linksError;

      setExercises((exercisesData as Exercise[]) || []);
      setContests((contestsData as Contest[]) || []);
      setExerciseContests((linksData as ExerciseContest[]) || []);
    } catch (error) {
      console.error('Error fetching training admin data:', error);
      setExercises([]);
      setContests([]);
      setExerciseContests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredExercises = useMemo(() => {
    const normalized = searchQuery.toLowerCase();
    return exercises.filter(
      (exercise) =>
        exercise.title.toLowerCase().includes(normalized) ||
        exercise.category.toLowerCase().includes(normalized) ||
        (exercise.description || '').toLowerCase().includes(normalized)
    );
  }, [exercises, searchQuery]);

  const getContestNames = (exerciseId: string) => {
    const ids = exerciseContests.filter((link) => link.exercise_id === exerciseId).map((link) => link.contest_id);
    return contests.filter((contest) => ids.includes(contest.id)).map((contest) => contest.name);
  };

  const openCreateModal = () => {
    setForm(emptyExerciseForm);
    setIsModalOpen(true);
  };

  const openEditModal = (exercise: Exercise) => {
    setForm({
      id: exercise.id,
      title: exercise.title,
      slug: exercise.slug,
      category: exercise.category,
      difficulty_level: exercise.difficulty_level || '',
      description: exercise.description || '',
      instructions: exercise.instructions || '',
      common_mistakes: exercise.common_mistakes || '',
      tips: exercise.tips || '',
      safety_notes: exercise.safety_notes || '',
      video_url: exercise.video_url || '',
      thumbnail_url: exercise.thumbnail_url || '',
      reps_text: exercise.reps_text || '',
      sets_count: exercise.sets_count?.toString() || '',
      rest_seconds: exercise.rest_seconds?.toString() || '',
      estimated_duration_minutes: exercise.estimated_duration_minutes?.toString() || '',
      equipment: exercise.equipment || '',
      is_premium: exercise.is_premium,
      is_active: exercise.is_active,
      contest_ids: exerciseContests.filter((link) => link.exercise_id === exercise.id).map((link) => link.contest_id),
    });
    setIsModalOpen(true);
  };

  const saveExercise = async () => {
    try {
      setIsSaving(true);
      const payload = {
        title: form.title.trim(),
        slug: slugify(form.slug || form.title),
        category: form.category.trim(),
        difficulty_level: form.difficulty_level.trim() || null,
        description: form.description.trim() || null,
        instructions: form.instructions.trim() || null,
        common_mistakes: form.common_mistakes.trim() || null,
        tips: form.tips.trim() || null,
        safety_notes: form.safety_notes.trim() || null,
        video_url: form.video_url.trim() || null,
        thumbnail_url: form.thumbnail_url.trim() || null,
        reps_text: form.reps_text.trim() || null,
        sets_count: toNullableNumber(form.sets_count),
        rest_seconds: toNullableNumber(form.rest_seconds),
        estimated_duration_minutes: toNullableNumber(form.estimated_duration_minutes),
        equipment: form.equipment.trim() || null,
        is_premium: form.is_premium,
        is_active: form.is_active,
        updated_at: new Date().toISOString(),
      };

      let exerciseId = form.id;

      if (form.id) {
        const { error } = await supabase.from('exercises').update(payload).eq('id', form.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('exercises').insert(payload).select('id').single();
        if (error) throw error;
        exerciseId = (data as { id: string }).id;
      }

      if (!exerciseId) {
        throw new Error('Treino sem identificador apos salvar.');
      }

      const { error: deleteLinksError } = await supabase.from('exercise_contests').delete().eq('exercise_id', exerciseId);
      if (deleteLinksError) throw deleteLinksError;

      if (form.contest_ids.length > 0) {
        const { error: insertLinksError } = await supabase.from('exercise_contests').insert(
          form.contest_ids.map((contestId) => ({
            exercise_id: exerciseId,
            contest_id: contestId,
          }))
        );
        if (insertLinksError) throw insertLinksError;
      }

      setIsModalOpen(false);
      setForm(emptyExerciseForm);
      await fetchData();
    } catch (error) {
      console.error('Error saving exercise:', error);
      alert('Nao foi possivel salvar o treino.');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteExercise = async (exerciseId: string) => {
    const confirmed = window.confirm('Deseja realmente excluir este treino?');
    if (!confirmed) return;

    try {
      setIsDeleting(exerciseId);
      await supabase.from('exercise_contests').delete().eq('exercise_id', exerciseId);
      const { error } = await supabase.from('exercises').delete().eq('id', exerciseId);
      if (error) throw error;
      await fetchData();
    } catch (error) {
      console.error('Error deleting exercise:', error);
      alert('Nao foi possivel excluir o treino.');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <>
      <div className="relative mx-auto flex h-screen max-w-md flex-col overflow-hidden bg-zinc-950 text-zinc-50 shadow-2xl">
        <div className="border-b border-zinc-800 bg-zinc-900 px-6 pb-4 pt-12">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center">
              <button onClick={() => navigate('/admin')} className="mr-2 p-2 -ml-2 text-zinc-400 transition-colors hover:text-white">
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Gestao de Treinos</h1>
                <p className="mt-1 text-sm font-mono text-emerald-500">Cadastro completo para free e premium</p>
              </div>
            </div>
            <button
              onClick={openCreateModal}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-zinc-950 transition-colors hover:bg-emerald-400"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar treinos..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-3 pl-10 pr-4 font-mono text-sm transition-colors focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
          ) : filteredExercises.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-sm text-zinc-400">Nenhum treino encontrado.</div>
          ) : (
            <div className="space-y-3">
              {filteredExercises.map((exercise, index) => {
                const contestNames = getContestNames(exercise.id);
                return (
                  <motion.div
                    key={exercise.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-white">{exercise.title}</h3>
                          <span className="rounded-full border border-zinc-700 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                            {exercise.category}
                          </span>
                          <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${exercise.is_premium ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            {exercise.is_premium ? 'Elite premium' : 'Free'}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-400">{exercise.description || 'Sem descricao cadastrada.'}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(contestNames.length > 0 ? contestNames : ['Sem concurso vinculado']).map((label) => (
                            <span key={label} className="rounded-full border border-zinc-700 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-300">
                              {label}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openEditModal(exercise)} className="rounded-xl bg-zinc-950 p-2 text-zinc-400 transition-colors hover:text-emerald-500">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteExercise(exercise.id)}
                          disabled={isDeleting === exercise.id}
                          className="rounded-xl bg-zinc-950 p-2 text-zinc-400 transition-colors hover:text-red-500 disabled:opacity-60"
                        >
                          {isDeleting === exercise.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed inset-x-0 bottom-0 z-[90] mx-auto flex max-h-[90vh] w-full max-w-md flex-col rounded-t-[28px] border border-white/10 bg-[#0d0d0d] shadow-[0_-24px_60px_rgba(0,0,0,0.5)]"
            >
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  saveExercise();
                }}
                className="flex flex-1 flex-col"
              >
                <div className="border-b border-white/6 px-5 pb-4 pt-4">
                  <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-zinc-700" />
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-tight text-white">{form.id ? 'Editar treino' : 'Novo treino'}</h3>
                      <p className="mt-1 text-xs leading-5 text-zinc-400">Cadastre videos, repeticoes, seguranca, premium/free e concursos vinculados.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-400 transition-colors hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
                  <label className="block">
                    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Titulo</span>
                    <input
                      value={form.title}
                      onChange={(event) =>
                        setForm((state) => ({
                          ...state,
                          title: event.target.value,
                          slug: state.id ? state.slug : slugify(event.target.value),
                        }))
                      }
                      className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none"
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Slug</span>
                      <input
                        value={form.slug}
                        onChange={(event) => setForm((state) => ({ ...state, slug: slugify(event.target.value) }))}
                        className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Categoria</span>
                      <input
                        value={form.category}
                        onChange={(event) => setForm((state) => ({ ...state, category: event.target.value }))}
                        className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none"
                      />
                    </label>
                  </div>
                  <label className="block">
                    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Nivel</span>
                    <select
                      value={form.difficulty_level}
                      onChange={(event) => setForm((state) => ({ ...state, difficulty_level: event.target.value }))}
                      className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none"
                    >
                      <option value="" className="bg-[#0d0d0d]">Selecione</option>
                      <option value="Iniciante" className="bg-[#0d0d0d]">Iniciante</option>
                      <option value="Intermediario" className="bg-[#0d0d0d]">Intermediario</option>
                      <option value="Avancado" className="bg-[#0d0d0d]">Avancado</option>
                    </select>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Series</span>
                      <input value={form.sets_count} onChange={(event) => setForm((state) => ({ ...state, sets_count: event.target.value }))} inputMode="numeric" className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none" />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Repeticoes</span>
                      <input value={form.reps_text} onChange={(event) => setForm((state) => ({ ...state, reps_text: event.target.value }))} placeholder="3x12, 5 min, AMRAP..." className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none" />
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Descanso (s)</span>
                      <input value={form.rest_seconds} onChange={(event) => setForm((state) => ({ ...state, rest_seconds: event.target.value }))} inputMode="numeric" className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none" />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Duracao (min)</span>
                      <input value={form.estimated_duration_minutes} onChange={(event) => setForm((state) => ({ ...state, estimated_duration_minutes: event.target.value }))} inputMode="numeric" className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none" />
                    </label>
                  </div>
                  <label className="block">
                    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Equipamento</span>
                    <input value={form.equipment} onChange={(event) => setForm((state) => ({ ...state, equipment: event.target.value }))} className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none" />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Descricao</span>
                    <textarea value={form.description} onChange={(event) => setForm((state) => ({ ...state, description: event.target.value }))} rows={3} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Como executar</span>
                    <textarea value={form.instructions} onChange={(event) => setForm((state) => ({ ...state, instructions: event.target.value }))} rows={4} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Erros comuns</span>
                    <textarea value={form.common_mistakes} onChange={(event) => setForm((state) => ({ ...state, common_mistakes: event.target.value }))} rows={3} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Dicas</span>
                    <textarea value={form.tips} onChange={(event) => setForm((state) => ({ ...state, tips: event.target.value }))} rows={3} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Seguranca</span>
                    <textarea value={form.safety_notes} onChange={(event) => setForm((state) => ({ ...state, safety_notes: event.target.value }))} rows={3} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Video URL</span>
                    <input value={form.video_url} onChange={(event) => setForm((state) => ({ ...state, video_url: event.target.value }))} className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none" />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Thumbnail URL</span>
                    <input value={form.thumbnail_url} onChange={(event) => setForm((state) => ({ ...state, thumbnail_url: event.target.value }))} className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none" />
                  </label>
                  <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Concursos vinculados</p>
                    <div className="space-y-2">
                      {contests.map((contest) => (
                        <label key={contest.id} className="flex items-center gap-3 text-sm text-zinc-300">
                          <input
                            type="checkbox"
                            checked={form.contest_ids.includes(contest.id)}
                            onChange={(event) =>
                              setForm((state) => ({
                                ...state,
                                contest_ids: event.target.checked
                                  ? [...state.contest_ids, contest.id]
                                  : state.contest_ids.filter((id) => id !== contest.id),
                              }))
                            }
                            className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500"
                          />
                          {contest.name}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/4 p-4 text-sm text-zinc-300">
                      <input type="checkbox" checked={form.is_premium} onChange={(event) => setForm((state) => ({ ...state, is_premium: event.target.checked }))} className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500" />
                      Elite premium
                    </label>
                    <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/4 p-4 text-sm text-zinc-300">
                      <input type="checkbox" checked={form.is_active} onChange={(event) => setForm((state) => ({ ...state, is_active: event.target.checked }))} className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500" />
                      Ativo
                    </label>
                  </div>
                </div>

                <div className="border-t border-white/6 bg-[#0d0d0d] px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-4">
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-zinc-300">
                      Cancelar
                    </button>
                    <button type="submit" disabled={isSaving} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-zinc-950 disabled:opacity-60">
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
