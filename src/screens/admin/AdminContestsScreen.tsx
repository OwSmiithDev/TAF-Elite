import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Edit2, Loader2, Plus, Search, ShieldCheck, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/services/supabase/client';
import type { Database } from '@/types/database';

type Contest = Database['public']['Tables']['contests']['Row'];

type ContestFormState = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
};

const emptyContestForm: ContestFormState = {
  name: '',
  slug: '',
  description: '',
  is_active: true,
};

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function AdminContestsScreen() {
  const navigate = useNavigate();
  const [contests, setContests] = useState<Contest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<ContestFormState>(emptyContestForm);

  const fetchContests = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from('contests').select('*').order('name');
      if (error) throw error;
      setContests((data as Contest[]) || []);
    } catch (error) {
      console.error('Error fetching contests:', error);
      setContests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContests();
  }, []);

  const filteredContests = useMemo(() => {
    const normalized = searchQuery.toLowerCase();
    return contests.filter(
      (contest) =>
        contest.name.toLowerCase().includes(normalized) ||
        (contest.description || '').toLowerCase().includes(normalized) ||
        contest.slug.toLowerCase().includes(normalized)
    );
  }, [contests, searchQuery]);

  const openCreateModal = () => {
    setForm(emptyContestForm);
    setIsModalOpen(true);
  };

  const openEditModal = (contest: Contest) => {
    setForm({
      id: contest.id,
      name: contest.name,
      slug: contest.slug,
      description: contest.description || '',
      is_active: contest.is_active,
    });
    setIsModalOpen(true);
  };

  const saveContest = async () => {
    try {
      setIsSaving(true);
      const payload = {
        name: form.name.trim(),
        slug: slugify(form.slug || form.name),
        description: form.description.trim() || null,
        is_active: form.is_active,
        updated_at: new Date().toISOString(),
      };

      if (form.id) {
        const { error } = await supabase.from('contests').update(payload).eq('id', form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('contests').insert(payload);
        if (error) throw error;
      }

      setIsModalOpen(false);
      setForm(emptyContestForm);
      await fetchContests();
    } catch (error) {
      console.error('Error saving contest:', error);
      alert('Nao foi possivel salvar o concurso.');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteContest = async (contestId: string) => {
    const confirmed = window.confirm('Deseja realmente excluir este concurso?');
    if (!confirmed) return;

    try {
      setIsDeleting(contestId);
      const { error } = await supabase.from('contests').delete().eq('id', contestId);
      if (error) throw error;
      await fetchContests();
    } catch (error) {
      console.error('Error deleting contest:', error);
      alert('Nao foi possivel excluir o concurso.');
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
                <h1 className="text-xl font-bold tracking-tight">Gestao de Concursos</h1>
                <p className="mt-1 text-sm font-mono text-emerald-500">Catalogo central da aplicacao</p>
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
              placeholder="Buscar concursos..."
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
          ) : filteredContests.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-sm text-zinc-400">Nenhum concurso encontrado.</div>
          ) : (
            <div className="space-y-3">
              {filteredContests.map((contest, index) => (
                <motion.div
                  key={contest.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="mb-3 flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        <h3 className="font-semibold text-white">{contest.name}</h3>
                      </div>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">{contest.slug}</p>
                      <p className="mt-3 text-sm text-zinc-400">{contest.description || 'Sem descricao cadastrada.'}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(contest)}
                        className="rounded-xl bg-zinc-950 p-2 text-zinc-400 transition-colors hover:text-emerald-500"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteContest(contest.id)}
                        disabled={isDeleting === contest.id}
                        className="rounded-xl bg-zinc-950 p-2 text-zinc-400 transition-colors hover:text-red-500 disabled:opacity-60"
                      >
                        {isDeleting === contest.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
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
              className="fixed inset-x-0 bottom-0 z-[90] mx-auto flex max-h-[88vh] w-full max-w-md flex-col rounded-t-[28px] border border-white/10 bg-[#0d0d0d] shadow-[0_-24px_60px_rgba(0,0,0,0.5)]"
            >
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  saveContest();
                }}
                className="flex flex-1 flex-col"
              >
                <div className="border-b border-white/6 px-5 pb-4 pt-4">
                  <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-zinc-700" />
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-tight text-white">
                        {form.id ? 'Editar concurso' : 'Novo concurso'}
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-zinc-400">Cadastre os concursos que vao alimentar filtros e preferencias.</p>
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
                    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Nome</span>
                    <input
                      value={form.name}
                      onChange={(event) =>
                        setForm((state) => ({
                          ...state,
                          name: event.target.value,
                          slug: state.id ? state.slug : slugify(event.target.value),
                        }))
                      }
                      className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Slug</span>
                    <input
                      value={form.slug}
                      onChange={(event) => setForm((state) => ({ ...state, slug: slugify(event.target.value) }))}
                      className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Descricao</span>
                    <textarea
                      value={form.description}
                      onChange={(event) => setForm((state) => ({ ...state, description: event.target.value }))}
                      rows={4}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                    />
                  </label>
                  <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/4 p-4 text-sm text-zinc-300">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(event) => setForm((state) => ({ ...state, is_active: event.target.checked }))}
                      className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500"
                    />
                    Concurso ativo
                  </label>
                </div>

                <div className="border-t border-white/6 bg-[#0d0d0d] px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-4">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-zinc-300"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-zinc-950 disabled:opacity-60"
                    >
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
