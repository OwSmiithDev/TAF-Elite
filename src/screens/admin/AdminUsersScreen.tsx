import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Crown, KeyRound, Loader2, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/services/supabase/client';
import type { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Subscription = Database['public']['Tables']['subscriptions']['Row'];

type UserWithSubscription = Profile & {
  subscription: Subscription | null;
};

type UserModalState = {
  user: UserWithSubscription | null;
  role: string;
  plan_name: string;
  status: string;
  expires_at: string;
};

export function AdminUsersScreen() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserWithSubscription[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState<string | null>(null);
  const [modalState, setModalState] = useState<UserModalState>({
    user: null,
    role: 'user',
    plan_name: 'Free',
    status: 'inactive',
    expires_at: '',
  });

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const [{ data: profilesData, error: profilesError }, { data: subscriptionsData, error: subscriptionsError }] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('subscriptions').select('*').order('updated_at', { ascending: false }),
      ]);

      if (profilesError) throw profilesError;
      if (subscriptionsError) throw subscriptionsError;

      const subscriptions = (subscriptionsData as Subscription[]) || [];
      const latestByUser = new Map<string, Subscription>();

      subscriptions.forEach((subscription) => {
        if (!latestByUser.has(subscription.user_id)) {
          latestByUser.set(subscription.user_id, subscription);
        }
      });

      const merged = ((profilesData as Profile[]) || []).map((profile) => ({
        ...profile,
        subscription: latestByUser.get(profile.id) ?? null,
      }));

      setUsers(merged);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const normalized = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        (user.full_name || '').toLowerCase().includes(normalized) ||
        (user.email || '').toLowerCase().includes(normalized) ||
        (user.target_exam || '').toLowerCase().includes(normalized)
    );
  }, [users, searchQuery]);

  const openUserModal = (user: UserWithSubscription) => {
    setModalState({
      user,
      role: user.role || 'user',
      plan_name: user.subscription?.plan_name || 'Free',
      status: user.subscription?.status || 'inactive',
      expires_at: user.subscription?.expires_at ? user.subscription.expires_at.slice(0, 10) : '',
    });
  };

  const saveUserAccess = async () => {
    if (!modalState.user) return;

    try {
      setIsSaving(true);
      const userId = modalState.user.id;
      const normalizedPlan = modalState.role === 'admin' ? 'Elite' : modalState.plan_name;
      const normalizedStatus = modalState.role === 'admin' ? 'active' : modalState.status;
      const normalizedExpires = modalState.role === 'admin' || normalizedPlan === 'Elite' ? null : modalState.expires_at || null;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: modalState.role, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (profileError) throw profileError;

      if (modalState.user.subscription) {
        const { error: subscriptionError } = await supabase
          .from('subscriptions')
          .update({
            plan_name: normalizedPlan,
            status: normalizedStatus,
            expires_at: normalizedExpires,
            gateway: modalState.role === 'admin' ? 'system_admin' : 'manual_admin',
            gateway_subscription_id: modalState.role === 'admin' ? 'super-admin-elite-indefinite' : modalState.user.subscription.gateway_subscription_id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', modalState.user.subscription.id);

        if (subscriptionError) throw subscriptionError;
      } else {
        const { error: insertError } = await supabase.from('subscriptions').insert({
          user_id: userId,
          plan_name: normalizedPlan,
          status: normalizedStatus,
          started_at: new Date().toISOString(),
          expires_at: normalizedExpires,
          gateway: modalState.role === 'admin' ? 'system_admin' : 'manual_admin',
          gateway_subscription_id: modalState.role === 'admin' ? 'super-admin-elite-indefinite' : null,
        });

        if (insertError) throw insertError;
      }

      setModalState((state) => ({ ...state, user: null }));
      await fetchUsers();
    } catch (error) {
      console.error('Error saving user access:', error);
      alert('Nao foi possivel salvar o usuario.');
    } finally {
      setIsSaving(false);
    }
  };

  const sendResetPassword = async (email: string | null, userId: string) => {
    if (!email) return;

    try {
      setIsResetting(userId);
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      alert('Email de redefinicao enviado com sucesso.');
    } catch (error) {
      console.error('Error sending reset password:', error);
      alert('Nao foi possivel enviar o reset de senha.');
    } finally {
      setIsResetting(null);
    }
  };

  return (
    <>
      <div className="relative mx-auto flex h-screen max-w-md flex-col overflow-hidden bg-zinc-950 text-zinc-50 shadow-2xl">
        <div className="border-b border-zinc-800 bg-zinc-900 px-6 pb-4 pt-12">
          <div className="mb-4 flex items-center">
            <button onClick={() => navigate('/admin')} className="mr-2 p-2 -ml-2 text-zinc-400 transition-colors hover:text-white">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Usuarios e Assinaturas</h1>
              <p className="mt-1 text-sm font-mono text-emerald-500">Gestao central do super admin</p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
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
          ) : filteredUsers.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-sm text-zinc-400">Nenhum usuario encontrado.</div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{user.full_name || 'Usuario sem nome'}</h3>
                      <p className="mt-1 text-xs font-mono text-zinc-500">{user.email}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full border border-zinc-700 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-300">
                          {user.role || 'user'}
                        </span>
                        <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-400">
                          {(user.subscription?.plan_name || 'Free') + ' / ' + (user.subscription?.status || 'inactive')}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => openUserModal(user)}
                      className="rounded-xl bg-zinc-950 px-3 py-2 text-xs font-bold uppercase tracking-widest text-zinc-300 transition-colors hover:text-emerald-400"
                    >
                      Gerir
                    </button>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => sendResetPassword(user.email, user.id)}
                      disabled={isResetting === user.id}
                      className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-300 transition-colors hover:text-white disabled:opacity-60"
                    >
                      {isResetting === user.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <KeyRound className="h-3.5 w-3.5" />}
                      Enviar reset de senha
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {modalState.user && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalState((state) => ({ ...state, user: null }))}
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
                  saveUserAccess();
                }}
                className="flex flex-1 flex-col"
              >
                <div className="border-b border-white/6 px-5 pb-4 pt-4">
                  <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-zinc-700" />
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-tight text-white">Gerir usuario</h3>
                      <p className="mt-1 text-xs leading-5 text-zinc-400">{modalState.user.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setModalState((state) => ({ ...state, user: null }))}
                      className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-400 transition-colors hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
                  <label className="block">
                    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Papel</span>
                    <select
                      value={modalState.role}
                      onChange={(event) => setModalState((state) => ({ ...state, role: event.target.value }))}
                      className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none"
                    >
                      <option value="user" className="bg-[#0d0d0d]">
                        Usuario
                      </option>
                      <option value="admin" className="bg-[#0d0d0d]">
                        Super admin
                      </option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Plano</span>
                    <select
                      value={modalState.plan_name}
                      onChange={(event) => setModalState((state) => ({ ...state, plan_name: event.target.value }))}
                      className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none"
                    >
                      <option value="Free" className="bg-[#0d0d0d]">
                        Free
                      </option>
                      <option value="Elite" className="bg-[#0d0d0d]">
                        TAF Elite Premium
                      </option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Status</span>
                    <select
                      value={modalState.status}
                      onChange={(event) => setModalState((state) => ({ ...state, status: event.target.value }))}
                      className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none"
                    >
                      <option value="active" className="bg-[#0d0d0d]">
                        Ativa
                      </option>
                      <option value="inactive" className="bg-[#0d0d0d]">
                        Inativa
                      </option>
                      <option value="cancelled" className="bg-[#0d0d0d]">
                        Cancelada
                      </option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Expira em</span>
                    <input
                      type="date"
                      value={modalState.expires_at}
                      onChange={(event) => setModalState((state) => ({ ...state, expires_at: event.target.value }))}
                      disabled={modalState.role === 'admin' || modalState.plan_name === 'Elite'}
                      className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none disabled:opacity-50"
                    />
                  </label>

                  <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
                    <div className="mb-2 flex items-center gap-2">
                      <Crown className="h-4 w-4" />
                      <span className="font-semibold uppercase tracking-[0.16em]">Regra do dono</span>
                    </div>
                    <p className="leading-6">
                      Quando o usuario estiver como super admin, a aplicacao o mantem com plano Elite ativo e sem expiracao.
                    </p>
                  </div>
                </div>

                <div className="border-t border-white/6 bg-[#0d0d0d] px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-4">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setModalState((state) => ({ ...state, user: null }))}
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
