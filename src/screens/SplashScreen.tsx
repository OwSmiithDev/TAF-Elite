import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

export function SplashScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#0A0A0A] text-zinc-100 max-w-md mx-auto shadow-2xl relative font-sans">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col items-center"
      >
        <Shield className="w-24 h-24 text-emerald-500 mb-6" strokeWidth={1.5} />
        <h1 className="text-4xl font-black tracking-tighter uppercase">TAF Elite</h1>
        <p className="text-zinc-500 mt-2 tracking-widest text-xs uppercase font-bold">Preparação Tática</p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="absolute bottom-12"
      >
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </motion.div>
    </div>
  );
}
