import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, Shield, User } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/services/supabase/client';
import { useAuthStore } from '@/store/auth.store';

const registerSchema = z
  .object({
    fullName: z.string().min(3, 'Nome muito curto'),
    email: z.string().email('E-mail invalido'),
    password: z.string().min(6, 'A senha deve ter no minimo 6 caracteres'),
    confirmPassword: z.string(),
    terms: z.boolean().refine((value) => value === true, {
      message: 'Voce deve aceitar os termos',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas nao coincidem',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export function RegisterScreen() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase nao configurado. Configure o ambiente para criar usuarios reais.');
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: authData.user.id,
          full_name: data.fullName,
          email: data.email,
        } as any);
        if (profileError) console.error('Error creating profile:', profileError);
      }

      setSession(authData.session);
      navigate('/onboarding');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative mx-auto min-h-screen max-w-md overflow-hidden bg-[radial-gradient(circle_at_top,#17382d_0%,#0b1110_34%,#050505_100%)] text-zinc-100 shadow-2xl">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0.4 }}
        animate={{ opacity: 0.9 }}
      >
        <motion.div
          className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-emerald-500/18 blur-3xl"
          animate={{ x: [0, 24, -12, 0], y: [0, 18, -16, 0], scale: [1, 1.08, 0.96, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute right-[-8%] top-[10%] h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl"
          animate={{ x: [0, -30, 10, 0], y: [0, 24, -20, 0], scale: [1, 0.95, 1.1, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[-8%] left-1/3 h-64 w-64 rounded-full bg-lime-300/8 blur-3xl"
          animate={{ x: [0, 20, -18, 0], y: [0, -18, 12, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:120px_120px] [mask-image:radial-gradient(circle_at_center,black,transparent_80%)]" />
      </motion.div>

      <div className="relative flex min-h-screen flex-col px-5 pb-6 pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 flex items-center justify-between"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-300 transition-colors hover:text-white"
          >
            Voltar
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-200">
            <Shield className="h-4 w-4" />
            Cadastro
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-1 items-center"
        >
          <div className="w-full rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.06))] p-[1px] shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
            <div className="rounded-[31px] bg-[#0b0f0d]/90 p-6 backdrop-blur-2xl sm:p-8">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-200">Cadastro</p>
                  <h2 className="mt-3 text-3xl font-black uppercase tracking-[-0.04em] text-white">Criar conta</h2>
                  <p className="mt-3 max-w-xs text-sm leading-6 text-zinc-400">
                    Monte seu acesso e comece sua preparacao no ambiente principal do app.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-zinc-200">
                  <Shield className="h-6 w-6" strokeWidth={1.5} />
                </div>
              </div>

              <motion.form
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.12 } },
                }}
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      key={error}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.label variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.26em] text-zinc-400">
                    Nome completo
                  </span>
                  <div className="group relative">
                    <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-emerald-300" />
                    <input
                      {...register('fullName')}
                      type="text"
                      placeholder="Seu nome"
                      className="h-14 w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 text-sm text-white outline-none transition-all placeholder:text-zinc-500 focus:border-emerald-400/60 focus:bg-white/7 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.12)]"
                    />
                  </div>
                  {errors.fullName && <p className="mt-2 text-xs text-red-300">{errors.fullName.message}</p>}
                </motion.label>

                <motion.label variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.26em] text-zinc-400">
                    E-mail operacional
                  </span>
                  <div className="group relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-emerald-300" />
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="voce@elite.com"
                      className="h-14 w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 text-sm text-white outline-none transition-all placeholder:text-zinc-500 focus:border-emerald-400/60 focus:bg-white/7 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.12)]"
                    />
                  </div>
                  {errors.email && <p className="mt-2 text-xs text-red-300">{errors.email.message}</p>}
                </motion.label>

                <motion.label variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.26em] text-zinc-400">Senha</span>
                  <div className="group relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-emerald-300" />
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Digite sua senha"
                      className="h-14 w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-14 text-sm text-white outline-none transition-all placeholder:text-zinc-500 focus:border-emerald-400/60 focus:bg-white/7 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.12)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-white"
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-2 text-xs text-red-300">{errors.password.message}</p>}
                </motion.label>

                <motion.label variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.26em] text-zinc-400">
                    Confirmar senha
                  </span>
                  <div className="group relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-emerald-300" />
                    <input
                      {...register('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Repita sua senha"
                      className="h-14 w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-14 text-sm text-white outline-none transition-all placeholder:text-zinc-500 focus:border-emerald-400/60 focus:bg-white/7 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.12)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-white"
                      aria-label={showConfirmPassword ? 'Ocultar confirmacao de senha' : 'Mostrar confirmacao de senha'}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="mt-2 text-xs text-red-300">{errors.confirmPassword.message}</p>}
                </motion.label>

                <motion.label
                  variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/4 p-4 text-sm text-zinc-300"
                >
                  <input
                    {...register('terms')}
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="leading-6">
                    Eu concordo com os{' '}
                    <a href="#" className="font-semibold uppercase tracking-[0.16em] text-emerald-300 transition-colors hover:text-white">
                      Termos e Condicoes
                    </a>
                  </span>
                </motion.label>
                {errors.terms && <p className="text-xs text-red-300">{errors.terms.message}</p>}

                <motion.button
                  variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
                  whileHover={{ scale: isLoading ? 1 : 1.01 }}
                  whileTap={{ scale: isLoading ? 1 : 0.985 }}
                  type="submit"
                  disabled={isLoading}
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#34d399_0%,#a3e635_100%)] px-4 text-sm font-black uppercase tracking-[0.24em] text-zinc-950 transition-all hover:shadow-[0_20px_40px_rgba(52,211,153,0.25)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Criar conta
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </motion.button>
              </motion.form>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="mt-6 rounded-2xl border border-white/10 bg-white/4 p-4 text-sm text-zinc-300"
              >
                <p className="leading-6">
                  Ja tem uma conta?{' '}
                  <Link to="/login" className="font-semibold uppercase tracking-[0.18em] text-emerald-300 transition-colors hover:text-white">
                    Entrar
                  </Link>
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
