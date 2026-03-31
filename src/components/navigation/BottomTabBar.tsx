import { NavLink } from 'react-router-dom';
import { Home, Dumbbell, Activity, User, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { name: 'Início', path: '/', icon: Home },
  { name: 'Treinos', path: '/plans', icon: Dumbbell },
  { name: 'Exercícios', path: '/exercises', icon: BookOpen },
  { name: 'Evolução', path: '/progress', icon: Activity },
  { name: 'Perfil', path: '/profile', icon: User },
];

export function BottomTabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-md border-t border-zinc-900 pb-safe">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-4">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center w-16 h-full space-y-1 transition-colors',
                isActive ? 'text-emerald-500' : 'text-zinc-600 hover:text-zinc-400'
              )
            }
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-widest mt-1">{tab.name}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
