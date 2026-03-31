import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Camera,
  ChevronDown,
  ChevronRight,
  Crown,
  Database,
  Loader2,
  LogOut,
  Settings,
  Shield,
  Star,
  User,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { supabase, isSupabaseConfigured } from '@/services/supabase/client';
import { useNavigate } from 'react-router-dom';
import type { Database as DatabaseSchema } from '@/types/database';

type ProfileRow = DatabaseSchema['public']['Tables']['profiles']['Row'];
type ProfileUpdate = DatabaseSchema['public']['Tables']['profiles']['Update'];
type Contest = DatabaseSchema['public']['Tables']['contests']['Row'];
type ProfileTargetExam = DatabaseSchema['public']['Tables']['profile_target_exams']['Row'];
type ModalType = 'personal' | 'preferences' | null;

type PersonalFormState = {
  full_name: string;
  email: string;
  gender: string;
  birth_date: string;
  height_cm: string;
  weight_kg: string;
};

type PreferencesFormState = {
  exam_date: string;
  current_level: string;
  training_days_per_week: string;
  goal_type: string;
  physical_restrictions: string;
};

const emptyPersonalForm: PersonalFormState = {
  full_name: '',
  email: '',
  gender: '',
  birth_date: '',
  height_cm: '',
  weight_kg: '',
};

const emptyPreferencesForm: PreferencesFormState = {
  exam_date: '',
  current_level: '',
  training_days_per_week: '',
  goal_type: '',
  physical_restrictions: '',
};

function toInputValue(value: string | number | null | undefined) {
  return value == null ? '' : String(value);
}

function toNullableNumber(value: string) {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function ProfileEditModal({
  title,
  subtitle,
  isOpen,
  isSaving,
  onClose,
  onSubmit,
  children,
}: {
  title: string;
  subtitle: string;
  isOpen: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: () => void;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Fechar modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className="fixed inset-x-0 bottom-0 z-[90] mx-auto flex max-h-[88vh] w-full max-w-md flex-col rounded-t-[28px] border border-white/10 bg-[#0d0d0d] shadow-[0_-24px_60px_rgba(0,0,0,0.5)]"
          >
            <form
              onSubmit={(event) => {
                event.preventDefault();
                onSubmit();
              }}
              className="flex max-h-[88vh] flex-1 flex-col"
            >
              <div className="border-b border-white/6 px-5 pb-4 pt-4">
                <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-zinc-700" />
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tight text-white">{title}</h3>
                    <p className="mt-1 text-xs leading-5 text-zinc-400">{subtitle}</p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-400 transition-colors hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4 pr-4">{children}</div>

              <div className="border-t border-white/6 bg-[#0d0d0d] px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-4">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-zinc-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-zinc-950 disabled:cursor-not-allowed disabled:opacity-60"
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
  );
}

export function ProfileScreen() {
  const { profile, user, signOut, setProfile } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [personalForm, setPersonalForm] = useState<PersonalFormState>(emptyPersonalForm);
  const [preferencesForm, setPreferencesForm] = useState<PreferencesFormState>(emptyPreferencesForm);
  const [contests, setContests] = useState<Contest[]>([]);
  const [selectedContestIds, setSelectedContestIds] = useState<string[]>([]);
  const [isContestDropdownOpen, setIsContestDropdownOpen] = useState(false);
  const [isSavingPersonal, setIsSavingPersonal] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const userName = profile?.full_name || 'Usuario';
  const isOwnerAdmin = profile?.role === 'admin';
  const selectedContestNames = contests.filter((contest) => selectedContestIds.includes(contest.id)).map((contest) => contest.name);
  const displayedTargetExam = selectedContestNames.length > 0 ? selectedContestNames.join(', ') : profile?.target_exam || 'Sem concurso alvo';

  const fetchContests = async () => {
    try {
      const { data, error } = await supabase.from('contests').select('*').eq('is_active', true).order('name');
      if (error) throw error;
      setContests((data as Contest[]) || []);
    } catch (error) {
      console.error('Error fetching contests:', error);
      setContests([]);
    }
  };

  const fetchProfileTargetExams = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase.from('profile_target_exams').select('*').eq('profile_id', user.id);
      if (error) throw error;
      setSelectedContestIds(((data as ProfileTargetExam[]) || []).map((item) => item.contest_id));
    } catch (error) {
      console.error('Error fetching target exams:', error);
      setSelectedContestIds([]);
    }
  };

  const refreshProfile = async () => {
    if (!user?.id) return;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (error) throw error;
    setProfile(data as ProfileRow);
  };

  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchContests();
    }
  }, []);

  useEffect(() => {
    if (isSupabaseConfigured && user?.id) {
      fetchProfileTargetExams();
    }
  }, [user?.id]);

  useEffect(() => {
    if (activeModal === 'personal') {
      setPersonalForm({
        full_name: profile?.full_name ?? '',
        email: profile?.email ?? user?.email ?? '',
        gender: profile?.gender ?? '',
        birth_date: profile?.birth_date ?? '',
        height_cm: toInputValue(profile?.height_cm),
        weight_kg: toInputValue(profile?.weight_kg),
      });
    }
  }, [activeModal, profile, user?.email]);

  useEffect(() => {
    if (activeModal === 'preferences') {
      setPreferencesForm({
        exam_date: profile?.exam_date ?? '',
        current_level: profile?.current_level ?? '',
        training_days_per_week: toInputValue(profile?.training_days_per_week),
        goal_type: profile?.goal_type ?? '',
        physical_restrictions: profile?.physical_restrictions ?? '',
      });
      setIsContestDropdownOpen(false);
    }
  }, [activeModal, profile]);

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    signOut();
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const persistProfile = async (updates: ProfileUpdate) => {
    if (!user?.id) {
      throw new Error('Usuario nao encontrado.');
    }

    if (!isSupabaseConfigured) {
      throw new Error('Supabase nao configurado.');
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    setProfile(data as ProfileRow);
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}-${Math.random()}.${fileExt}`;

      if (!isSupabaseConfigured) {
        throw new Error('Supabase nao configurado.');
      }

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath);

      await persistProfile({ avatar_url: publicUrl });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Erro ao fazer upload da imagem.');
    } finally {
      setIsUploading(false);
    }
  };

  const savePersonalData = async () => {
    try {
      setIsSavingPersonal(true);
      await persistProfile({
        full_name: personalForm.full_name.trim() || null,
        email: personalForm.email.trim() || null,
        gender: personalForm.gender.trim() || null,
        birth_date: personalForm.birth_date || null,
        height_cm: toNullableNumber(personalForm.height_cm),
        weight_kg: toNullableNumber(personalForm.weight_kg),
      });
      setActiveModal(null);
    } catch (error) {
      console.error('Error saving personal data:', error);
      alert('Nao foi possivel salvar os dados pessoais.');
    } finally {
      setIsSavingPersonal(false);
    }
  };

  const toggleContestSelection = (contestId: string) => {
    setSelectedContestIds((state) => (state.includes(contestId) ? state.filter((id) => id !== contestId) : [...state, contestId]));
  };

  const savePreferences = async () => {
    try {
      if (!user?.id) throw new Error('Usuario nao encontrado.');
      setIsSavingPreferences(true);

      await persistProfile({
        exam_date: preferencesForm.exam_date || null,
        current_level: preferencesForm.current_level.trim() || null,
        training_days_per_week: toNullableNumber(preferencesForm.training_days_per_week),
        goal_type: preferencesForm.goal_type.trim() || null,
        physical_restrictions: preferencesForm.physical_restrictions.trim() || null,
      });

      const { error: deleteError } = await supabase.from('profile_target_exams').delete().eq('profile_id', user.id);
      if (deleteError) throw deleteError;

      if (selectedContestIds.length > 0) {
        const { error: insertError } = await supabase.from('profile_target_exams').insert(
          selectedContestIds.map((contestId) => ({
            profile_id: user.id,
            contest_id: contestId,
          }))
        );
        if (insertError) throw insertError;
      }

      await refreshProfile();
      setActiveModal(null);
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Nao foi possivel salvar as preferencias.');
    } finally {
      setIsSavingPreferences(false);
    }
  };

  return (
    <>
      <div className="flex min-h-full flex-col bg-[#0A0A0A] pb-24 font-sans text-zinc-100">
        <header className="sticky top-0 z-10 border-b border-zinc-900 bg-[#0A0A0A] px-6 pb-6 pt-12">
          <h1 className="text-2xl font-black uppercase tracking-tight">Perfil</h1>
          <p className="mt-1 text-xs font-mono uppercase tracking-widest text-zinc-500">Sua conta e configuracoes</p>
        </header>

        <div className="space-y-8 px-6 py-8">
          <section className="flex items-center">
            <div className="relative">
              <div onClick={handleAvatarClick} className="relative mr-6 flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-zinc-800 bg-zinc-900">
                {isUploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                ) : profile?.avatar_url ? (
                  <>
                    <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-2xl font-bold text-zinc-500">{userName.charAt(0)}</span>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                  </>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>
            <div>
              <h2 className="mb-1 text-xl font-black uppercase tracking-tight">{userName}</h2>
              <p className="text-xs font-mono text-zinc-500">{profile?.email || user?.email || 'email@exemplo.com'}</p>
              <div className="mt-3 inline-flex items-center rounded border border-zinc-800 bg-zinc-900 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                <Shield className="mr-1.5 h-3 w-3 text-emerald-500" />
                {displayedTargetExam}
              </div>
            </div>
          </section>

          <section>
            <motion.div whileTap={{ scale: 0.98 }} className="group relative cursor-pointer overflow-hidden rounded-xl border border-amber-500/30 bg-zinc-900 p-6">
              <div className="relative z-10 mb-4 flex items-center">
                <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10">
                  {isOwnerAdmin ? <Crown className="h-5 w-5 text-amber-400" /> : <Star className="h-5 w-5 text-amber-500" />}
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight text-amber-500">TAF Elite Premium</h3>
                  <p className="mt-0.5 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                    {isOwnerAdmin ? 'Super admin com acesso permanente' : 'Gerencie seu acesso premium'}
                  </p>
                </div>
              </div>
              <p className="relative z-10 mb-5 text-xs leading-relaxed text-zinc-400">
                {isOwnerAdmin
                  ? 'Como dono da plataforma, seu acesso premium Elite permanece ativo e sem expiracao.'
                  : 'Acesse todos os planos, simulados ilimitados e conteudo exclusivo para garantir sua aprovacao.'}
              </p>
              <button className="relative z-10 w-full rounded-lg bg-amber-500 py-3 text-xs font-bold uppercase tracking-widest text-zinc-950 transition-colors hover:bg-amber-400">
                {isOwnerAdmin ? 'Acesso Elite Ativo' : 'Fazer Upgrade'}
              </button>
            </motion.div>
          </section>

          <section>
            <h2 className="mb-4 flex items-center text-xs font-bold uppercase tracking-widest text-zinc-500">Configuracoes</h2>

            <div className="space-y-2">
              {profile?.role === 'admin' && (
                <button onClick={() => navigate('/admin')} className="mb-4 flex w-full items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-900/20 p-4 transition-colors hover:bg-emerald-900/30">
                  <div className="flex items-center">
                    <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
                      <Database className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs font-bold uppercase tracking-wide text-emerald-500">Painel Admin</h4>
                      <p className="mt-0.5 text-[10px] font-mono text-emerald-500/70">Gerenciar concursos, treinos e usuarios</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-emerald-500/50" />
                </button>
              )}

              <button onClick={() => setActiveModal('personal')} className="flex w-full items-center justify-between rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4 transition-colors hover:bg-zinc-900">
                <div className="flex items-center">
                  <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800">
                    <User className="h-4 w-4 text-zinc-400" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs font-bold uppercase tracking-wide">Dados Pessoais</h4>
                    <p className="mt-0.5 text-[10px] font-mono text-zinc-500">Atualize seu perfil</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-600" />
              </button>

              <button onClick={() => setActiveModal('preferences')} className="flex w-full items-center justify-between rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4 transition-colors hover:bg-zinc-900">
                <div className="flex items-center">
                  <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800">
                    <Settings className="h-4 w-4 text-zinc-400" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs font-bold uppercase tracking-wide">Preferencias</h4>
                    <p className="mt-0.5 text-[10px] font-mono text-zinc-500">Concurso alvo, meta e rotina</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-600" />
              </button>

              <button onClick={handleLogout} className="mt-6 flex w-full items-center justify-between rounded-xl border border-red-900/30 bg-zinc-900/50 p-4 transition-colors hover:bg-red-950/20">
                <div className="flex items-center">
                  <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">
                    <LogOut className="h-4 w-4 text-red-500" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs font-bold uppercase tracking-wide text-red-500">Sair da Conta</h4>
                  </div>
                </div>
              </button>
            </div>
          </section>
        </div>
      </div>

      <ProfileEditModal
        title="Dados Pessoais"
        subtitle="Edite suas informacoes basicas. Os campos ja abrem preenchidos com os dados atuais."
        isOpen={activeModal === 'personal'}
        isSaving={isSavingPersonal}
        onClose={() => setActiveModal(null)}
        onSubmit={savePersonalData}
      >
        <label className="block">
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Nome completo</span>
          <input value={personalForm.full_name} onChange={(event) => setPersonalForm((state) => ({ ...state, full_name: event.target.value }))} className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus:border-emerald-400/60" />
        </label>
        <label className="block">
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">E-mail</span>
          <input value={personalForm.email} onChange={(event) => setPersonalForm((state) => ({ ...state, email: event.target.value }))} type="email" className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus:border-emerald-400/60" />
        </label>
        <label className="block">
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Genero</span>
          <select value={personalForm.gender} onChange={(event) => setPersonalForm((state) => ({ ...state, gender: event.target.value }))} className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus:border-emerald-400/60">
            <option value="" className="bg-[#0d0d0d] text-zinc-400">Selecione</option>
            <option value="Masculino" className="bg-[#0d0d0d] text-white">Masculino</option>
            <option value="Feminino" className="bg-[#0d0d0d] text-white">Feminino</option>
            <option value="Prefiro nao dizer" className="bg-[#0d0d0d] text-white">Prefiro nao dizer</option>
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Nascimento</span>
            <input value={personalForm.birth_date} onChange={(event) => setPersonalForm((state) => ({ ...state, birth_date: event.target.value }))} type="date" className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus:border-emerald-400/60" />
          </label>
          <label className="block">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Altura (cm)</span>
            <input value={personalForm.height_cm} onChange={(event) => setPersonalForm((state) => ({ ...state, height_cm: event.target.value }))} inputMode="numeric" className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus:border-emerald-400/60" />
          </label>
        </div>
        <label className="block">
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Peso (kg)</span>
          <input value={personalForm.weight_kg} onChange={(event) => setPersonalForm((state) => ({ ...state, weight_kg: event.target.value }))} inputMode="decimal" className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus:border-emerald-400/60" />
        </label>
      </ProfileEditModal>

      <ProfileEditModal
        title="Preferencias"
        subtitle="Escolha um ou mais concursos alvo cadastrados pelo super admin e ajuste sua rotina."
        isOpen={activeModal === 'preferences'}
        isSaving={isSavingPreferences}
        onClose={() => setActiveModal(null)}
        onSubmit={savePreferences}
      >
        <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
          <button
            type="button"
            onClick={() => setIsContestDropdownOpen((state) => !state)}
            className="flex w-full items-center justify-between text-left"
          >
            <div>
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Concursos alvo</span>
              <p className="text-sm text-white">{selectedContestNames.length > 0 ? selectedContestNames.join(', ') : 'Selecione um ou mais concursos'}</p>
            </div>
            <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform ${isContestDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isContestDropdownOpen && (
            <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
              {contests.length === 0 ? (
                <p className="text-sm text-zinc-500">Nenhum concurso ativo cadastrado.</p>
              ) : (
                contests.map((contest) => (
                  <label key={contest.id} className="flex items-center gap-3 text-sm text-zinc-300">
                    <input
                      type="checkbox"
                      checked={selectedContestIds.includes(contest.id)}
                      onChange={() => toggleContestSelection(contest.id)}
                      className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500"
                    />
                    {contest.name}
                  </label>
                ))
              )}
            </div>
          )}
        </div>

        <label className="block">
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Data da prova</span>
          <input value={preferencesForm.exam_date} onChange={(event) => setPreferencesForm((state) => ({ ...state, exam_date: event.target.value }))} type="date" className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus:border-emerald-400/60" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Nivel atual</span>
            <select value={preferencesForm.current_level} onChange={(event) => setPreferencesForm((state) => ({ ...state, current_level: event.target.value }))} className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus:border-emerald-400/60">
              <option value="" className="bg-[#0d0d0d] text-zinc-400">Selecione</option>
              <option value="Iniciante" className="bg-[#0d0d0d] text-white">Iniciante</option>
              <option value="Intermediario" className="bg-[#0d0d0d] text-white">Intermediario</option>
              <option value="Avancado" className="bg-[#0d0d0d] text-white">Avancado</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Dias por semana</span>
            <input value={preferencesForm.training_days_per_week} onChange={(event) => setPreferencesForm((state) => ({ ...state, training_days_per_week: event.target.value }))} inputMode="numeric" className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus:border-emerald-400/60" />
          </label>
        </div>
        <label className="block">
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Objetivo</span>
          <input value={preferencesForm.goal_type} onChange={(event) => setPreferencesForm((state) => ({ ...state, goal_type: event.target.value }))} placeholder="Aprovacao, performance, condicionamento..." className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-emerald-400/60" />
        </label>
        <label className="block">
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Restricoes fisicas</span>
          <textarea value={preferencesForm.physical_restrictions} onChange={(event) => setPreferencesForm((state) => ({ ...state, physical_restrictions: event.target.value }))} rows={4} placeholder="Lesoes, dores recorrentes, limitacoes..." className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-emerald-400/60" />
        </label>
      </ProfileEditModal>
    </>
  );
}
