import { motion } from 'framer-motion';
import { Activity, Calendar, Trophy } from 'lucide-react';

export function ProgressScreen() {
  return (
    <div className="flex min-h-full flex-col bg-[#0A0A0A] pb-24 font-sans text-zinc-100">
      <header className="sticky top-0 z-10 border-b border-zinc-900 bg-[#0A0A0A] px-6 pb-6 pt-12">
        <h1 className="text-2xl font-black uppercase tracking-tight">Evolucao</h1>
        <p className="mt-1 text-xs font-mono uppercase tracking-widest text-zinc-500">Acompanhe seus indices</p>
      </header>

      <div className="space-y-4 px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
              <Activity className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wide">Resumo</h2>
              <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Sem numeros ficticios</p>
            </div>
          </div>
          <p className="text-sm leading-6 text-zinc-400">
            Os cards de treinos, simulados e contadores fake foram removidos. Esta tela vai mostrar somente dados reais
            quando o historico comecar a ser salvo.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
              <Trophy className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wide">Recordes Pessoais</h2>
              <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Aguardando registros</p>
            </div>
          </div>
          <p className="text-sm leading-6 text-zinc-400">
            Nenhum recorde esta sendo inventado na interface. Assim que os testes forem registrados no banco, eles
            aparecerao aqui.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-500/20 bg-orange-500/10">
              <Calendar className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wide">Historico Recente</h2>
              <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Base zerada</p>
            </div>
          </div>
          <p className="text-sm leading-6 text-zinc-400">
            O historico fake foi removido. Nenhum treino concluido sera mostrado ate existir persistencia real.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
