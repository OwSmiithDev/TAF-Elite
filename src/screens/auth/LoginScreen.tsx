import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/services/supabase/client';
import { useAuthStore } from '@/store/auth.store';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginScreen() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!isSupabaseConfigured) {
        // Mock login for UI preview
        setTimeout(() => {
          setSession({ user: { id: 'mock-user', email: data.email } });
          navigate('/onboarding');
        }, 1000);
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;
      setSession(authData.session);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0A] text-zinc-100 px-6 pt-12 pb-8 max-w-md mx-auto shadow-2xl relative font-sans">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-12"
      >
        <Link to="/" className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors">
          Voltar
        </Link>
        <Shield className="w-8 h-8 text-emerald-500" strokeWidth={1.5} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-10"
      >
        <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Acesso Restrito</h1>
        <p className="text-sm text-zinc-400 font-mono">Entre para continuar sua preparação.</p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 flex-1"
      >
        {error && (
          <div className="p-4 bg-red-950/50 border border-red-900/50 rounded-xl text-red-400 text-xs font-mono">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              {...register('email')}
              type="email"
              placeholder="SEU E-MAIL"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 pl-12 pr-4 text-zinc-100 placeholder:text-zinc-600 placeholder:text-xs placeholder:font-bold placeholder:uppercase placeholder:tracking-widest focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-mono text-sm"
            />
            {errors.email && <p className="text-red-400 text-[10px] uppercase tracking-wider mt-1 ml-1">{errors.email.message}</p>}
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              {...register('password')}
              type="password"
              placeholder="SUA SENHA"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 pl-12 pr-4 text-zinc-100 placeholder:text-zinc-600 placeholder:text-xs placeholder:font-bold placeholder:uppercase placeholder:tracking-widest focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-mono text-sm"
            />
            {errors.password && <p className="text-red-400 text-[10px] uppercase tracking-wider mt-1 ml-1">{errors.password.message}</p>}
          </div>
        </div>

        <div className="flex justify-end">
          <Link to="/recover" className="text-[10px] uppercase tracking-widest text-emerald-500 hover:text-emerald-400 font-bold">
            Esqueceu a senha?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center justify-center w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 text-xs font-bold uppercase tracking-widest rounded-xl transition-colors mt-8"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Entrar
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </button>
      </motion.form>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-auto text-center"
      >
        <p className="text-xs text-zinc-500 font-mono">
          Ainda não tem conta?{' '}
          <Link to="/register" className="text-emerald-500 hover:text-emerald-400 font-bold uppercase tracking-widest ml-1 font-sans">
            Aliste-se
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
