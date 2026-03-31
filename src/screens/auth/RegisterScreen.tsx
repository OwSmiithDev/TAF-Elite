import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/services/supabase/client';
import { useAuthStore } from '@/store/auth.store';

const registerSchema = z.object({
  fullName: z.string().min(3, 'Nome muito curto'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string(),
  terms: z.boolean().refine((val) => val === true, {
    message: 'Você deve aceitar os termos',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export function RegisterScreen() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
        // Mock register for UI preview
        setTimeout(() => {
          setSession({ user: { id: 'mock-user', email: data.email } });
          navigate('/onboarding');
        }, 1000);
        return;
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

      // Create profile record
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
    <div className="flex flex-col h-screen bg-[#0A0A0A] text-zinc-100 px-6 pt-12 pb-8 overflow-y-auto max-w-md mx-auto shadow-2xl relative font-sans scrollbar-hide">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
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
        className="mb-8"
      >
        <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Aliste-se</h1>
        <p className="text-sm text-zinc-400 font-mono">Crie sua conta e inicie a preparação.</p>
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
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              {...register('fullName')}
              type="text"
              placeholder="NOME COMPLETO"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 pl-12 pr-4 text-zinc-100 placeholder:text-zinc-600 placeholder:text-xs placeholder:font-bold placeholder:uppercase placeholder:tracking-widest focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-mono text-sm"
            />
            {errors.fullName && <p className="text-red-400 text-[10px] uppercase tracking-wider mt-1 ml-1">{errors.fullName.message}</p>}
          </div>

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

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              {...register('confirmPassword')}
              type="password"
              placeholder="CONFIRME A SENHA"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 pl-12 pr-4 text-zinc-100 placeholder:text-zinc-600 placeholder:text-xs placeholder:font-bold placeholder:uppercase placeholder:tracking-widest focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-mono text-sm"
            />
            {errors.confirmPassword && <p className="text-red-400 text-[10px] uppercase tracking-wider mt-1 ml-1">{errors.confirmPassword.message}</p>}
          </div>

          <div className="flex items-start mt-4">
            <div className="flex items-center h-5">
              <input
                {...register('terms')}
                id="terms"
                type="checkbox"
                className="w-4 h-4 bg-zinc-900 border-zinc-800 rounded text-emerald-500 focus:ring-emerald-500 focus:ring-offset-[#0A0A0A]"
              />
            </div>
            <div className="ml-3 text-xs font-mono">
              <label htmlFor="terms" className="text-zinc-400">
                Eu concordo com os{' '}
                <a href="#" className="text-emerald-500 hover:underline">
                  Termos e Condições
                </a>
              </label>
              {errors.terms && <p className="text-red-400 text-[10px] uppercase tracking-wider mt-1">{errors.terms.message}</p>}
            </div>
          </div>
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
              Criar Conta
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </button>
      </motion.form>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 text-center"
      >
        <p className="text-xs text-zinc-500 font-mono">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-emerald-500 hover:text-emerald-400 font-bold uppercase tracking-widest ml-1 font-sans">
            Entrar
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
