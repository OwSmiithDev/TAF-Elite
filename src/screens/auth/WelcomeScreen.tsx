import { motion } from 'framer-motion';
import { ChevronRight, Shield, Sparkles, Target, TimerReset } from 'lucide-react';
import { Link } from 'react-router-dom';

const benefits = [
  'Treinos para barra, flexao, abdominal e corrida',
  'Roteiro visual para evolucao semanal',
  'Preparacao pensada para concursos policiais e militares',
];

const highlights = [
  { title: 'Missao diaria', value: 'Treine com clareza' },
  { title: 'Metodo aplicado', value: 'Sem improviso' },
  { title: 'Ritmo constante', value: 'Foco no TAF' },
];

export function WelcomeScreen() {
  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col overflow-hidden bg-[#050505] text-zinc-100 shadow-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#1d4737_0%,#0a1110_35%,#050505_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:90px_90px] opacity-40" />
      <motion.div
        aria-hidden
        className="absolute -top-12 right-[-15%] h-56 w-56 rounded-full bg-emerald-400/18 blur-3xl"
        animate={{ x: [0, -16, 10, 0], y: [0, 18, -10, 0], scale: [1, 1.08, 0.96, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="absolute bottom-20 left-[-18%] h-48 w-48 rounded-full bg-cyan-400/12 blur-3xl"
        animate={{ x: [0, 12, -10, 0], y: [0, -14, 10, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 flex min-h-screen flex-col px-5 pb-6 pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="flex items-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/7 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-200">
            <Shield className="h-4 w-4 text-emerald-300" />
            TAF Elite
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="pt-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[10px] uppercase tracking-[0.28em] text-zinc-300">
            <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
            Preparacao orientada
          </div>

          <h1 className="mt-5 text-[2.7rem] font-black uppercase leading-[0.92] tracking-[-0.07em] text-white">
            Treine para o
            <span className="block bg-[linear-gradient(135deg,#34d399_0%,#bef264_100%)] bg-clip-text text-transparent">
              TAF com metodo
            </span>
          </h1>

          <p className="mt-5 max-w-[28rem] text-sm leading-7 text-zinc-300">
            O TAF Elite organiza sua preparacao fisica para concursos policiais e militares com treinos direcionados,
            acompanhamento visual e foco total na evolucao do seu desempenho.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.65 }}
          className="mt-7 rounded-[28px] border border-white/10 bg-white/7 p-4 backdrop-blur-xl"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-200">Centro de preparo</p>
              <p className="mt-3 text-sm leading-6 text-zinc-300">
                Um ambiente pensado para manter consistencia, organizar ciclos e acompanhar a evolucao fisica.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <Target className="h-5 w-5 text-emerald-300" />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3">
            {highlights.map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/8 bg-black/20 p-3">
                <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">{item.title}</p>
                <p className="mt-2 text-sm font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.65 }}
          className="mt-5 rounded-[28px] border border-white/10 bg-black/25 p-4"
        >
          <div className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-zinc-300">
            <TimerReset className="h-4 w-4 text-cyan-300" />
            O que voce encontra
          </div>
          <div className="space-y-3">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/4 p-3">
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.8)]" />
                <p className="text-sm leading-6 text-zinc-300">{benefit}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36, duration: 0.65 }}
          className="mt-auto space-y-3 pt-6"
        >
          <Link
            to="/register"
            className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#34d399_0%,#bef264_100%)] px-4 text-sm font-black uppercase tracking-[0.22em] text-zinc-950 shadow-[0_18px_35px_rgba(52,211,153,0.24)] transition-transform active:scale-[0.985]"
          >
            Comecar agora
            <ChevronRight className="h-4 w-4" />
          </Link>
          <Link
            to="/login"
            className="flex h-14 items-center justify-center rounded-2xl border border-white/10 bg-white/6 px-4 text-sm font-bold uppercase tracking-[0.22em] text-zinc-200 transition-colors active:bg-white/10"
          >
            Ja tenho conta
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
