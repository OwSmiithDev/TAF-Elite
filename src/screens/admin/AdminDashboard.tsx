import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Users, Dumbbell, Calendar, Image as ImageIcon, ChevronRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AdminDashboard() {
  const navigate = useNavigate();
  
  const adminModules = [
    { id: 'exercises', title: 'Exercícios', icon: Dumbbell, description: 'Gerenciar biblioteca de exercícios' },
    { id: 'plans', title: 'Planos de Treino', icon: Calendar, description: 'Criar e editar planos de treinamento' },
    { id: 'users', title: 'Usuários', icon: Users, description: 'Visualizar e gerenciar usuários' },
    { id: 'media', title: 'Mídia', icon: ImageIcon, description: 'Gerenciar imagens e vídeos' },
    { id: 'settings', title: 'Configurações', icon: Settings, description: 'Configurações gerais do app' },
  ];

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-50 overflow-hidden max-w-md mx-auto relative shadow-2xl">
      <div className="pt-12 pb-6 px-6 bg-zinc-900 border-b border-zinc-800 flex items-center">
        <button 
          onClick={() => navigate('/profile')}
          className="p-2 -ml-2 mr-2 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold font-sans tracking-tight">Painel Admin</h1>
          <p className="text-sm text-emerald-500 font-mono mt-1">Super Admin Access</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
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
                className="flex items-center p-4 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-emerald-500/50 transition-colors text-left group"
              >
                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mr-4 group-hover:bg-emerald-500/20 transition-colors">
                  <Icon className="w-6 h-6 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{module.title}</h3>
                  <p className="text-sm text-zinc-400">{module.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-emerald-500 transition-colors" />
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
