import { motion } from 'framer-motion';
import { Activity, CalendarDays, Target } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

export function HomeScreen() {
  const { profile } = useAuthStore();
  const userName = profile?.full_name?.split(' ')[0] || 'Usuario';

  return (
    <div className="flex min-h-full flex-col bg-[#0A0A0A] pb-24 font-sans text-zinc-100">
      <header className="sticky top-0 z-10 border-b border-zinc-900 bg-[#0A0A0A] px-6 pb-6 pt-12">
        <div className="flex items-center justify-between">
          <div>
            <p className="mb-1 text-xs font-mono uppercase tracking-widest text-zinc-500">Bem-vindo,</p>
            <h1 className="text-2xl font-black uppercase tracking-tight">{userName}</h1>
          </div>
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-zinc-800 bg-zinc-900">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <span className="text-lg font-bold text-zinc-500">{userName.charAt(0)}</span>
            )}
          </div>
        </div>
      </header>

      <div className="space-y-6 px-6 py-8">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
              <Target className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wide">Treino do Dia</h2>
              <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Sem dados simulados</p>
            </div>
          </div>
          <p className="text-sm leading-6 text-zinc-400">
            Nenhum treino real foi vinculado a sua conta ainda. Assim que os dados forem cadastrados no banco, eles
            aparecerao aqui.
          </p>
        </motion.section>

        <div className="grid grid-cols-1 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
                <Activity className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-wide">Seu Progresso</h2>
                <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Aguardando dados reais</p>
              </div>
            </div>
            <p className="text-sm leading-6 text-zinc-400">
              Nenhuma metrica fake esta sendo exibida. O progresso sera mostrado somente a partir de registros reais.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-500/20 bg-orange-500/10">
                <CalendarDays className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-wide">Resumo Inicial</h2>
                <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Base limpa</p>
              </div>
            </div>
            <p className="text-sm leading-6 text-zinc-400">
              O app foi limpo para comecar do zero com conteudo de treino, historico e indicadores vindos do banco.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
