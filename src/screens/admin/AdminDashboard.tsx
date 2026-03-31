import { motion } from 'framer-motion';
import { Users, Dumbbell, ShieldCheck, ChevronRight, ArrowLeft, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AdminDashboard() {
  const navigate = useNavigate();

  const adminModules = [
    { id: 'exercises', title: 'Treinos', icon: Dumbbell, description: 'Adicionar, editar e excluir treinos completos' },
    { id: 'contests', title: 'Concursos', icon: ShieldCheck, description: 'Cadastrar os concursos usados em toda a aplicacao' },
    { id: 'users', title: 'Usuarios e Assinaturas', icon: Users, description: 'Gerir usuarios, planos e reset de senha' },
  ];

  return (
    <div className="relative mx-auto flex h-screen max-w-md flex-col overflow-hidden bg-zinc-950 text-zinc-50 shadow-2xl">
      <div className="flex items-center border-b border-zinc-800 bg-zinc-900 px-6 pb-6 pt-12">
        <button onClick={() => navigate('/profile')} className="mr-2 p-2 -ml-2 text-zinc-400 transition-colors hover:text-white">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Painel Admin</h1>
          <p className="mt-1 font-mono text-sm text-emerald-500">Super Admin Access</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10">
              <Crown className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Dono da plataforma</h2>
              <p className="text-xs text-amber-100/80">Super admin sempre com TAF Elite Premium ativo e sem expiracao.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {adminModules.map((module, index) => {
            const Icon = module.icon;
            return (
              <motion.button
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(`/admin/${module.id}`)}
                className="group flex items-center rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-left transition-colors hover:border-emerald-500/50"
              >
                <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 transition-colors group-hover:bg-emerald-500/20">
                  <Icon className="h-6 w-6 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{module.title}</h3>
                  <p className="text-sm text-zinc-400">{module.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-zinc-600 transition-colors group-hover:text-emerald-500" />
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
