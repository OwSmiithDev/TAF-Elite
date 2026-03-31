import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Settings, LogOut, Shield, ChevronRight, Star, Camera, Loader2, Database } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { supabase, isSupabaseConfigured } from '@/services/supabase/client';
import { useNavigate } from 'react-router-dom';

export function ProfileScreen() {
  const { profile, user, signOut, setProfile } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const userName = profile?.full_name || 'Guerreiro';

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    signOut();
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}-${Math.random()}.${fileExt}`;

      if (!isSupabaseConfigured) {
        console.warn('Supabase not configured, mocking upload');
        setTimeout(() => setIsUploading(false), 1000);
        return;
      }

      // Upload image
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user?.id);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      if (profile) {
        setProfile({ ...profile, avatar_url: publicUrl });
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Erro ao fazer upload da imagem.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-[#0A0A0A] text-zinc-100 pb-24 font-sans">
      <header className="px-6 pt-12 pb-6 bg-[#0A0A0A] border-b border-zinc-900 sticky top-0 z-10">
        <h1 className="text-2xl font-black uppercase tracking-tight">Perfil</h1>
        <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest mt-1">Sua conta e configurações</p>
      </header>

      <div className="px-6 py-8 space-y-8">
        {/* Info do Usuário */}
        <section className="flex items-center">
          <div className="relative">
            <div 
              onClick={handleAvatarClick}
              className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden mr-6 cursor-pointer group relative"
            >
              {isUploading ? (
                <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
              ) : profile?.avatar_url ? (
                <>
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </>
              ) : (
                <>
                  <span className="text-2xl font-bold text-zinc-500">{userName.charAt(0)}</span>
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight mb-1">{userName}</h2>
            <p className="text-zinc-500 text-xs font-mono">{profile?.email || 'email@exemplo.com'}</p>
            <div className="mt-3 inline-flex items-center text-[10px] font-bold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded uppercase tracking-widest">
              <Shield className="w-3 h-3 mr-1.5 text-emerald-500" />
              {profile?.target_exam || 'Polícia Militar'}
            </div>
          </div>
        </section>

        {/* Premium Banner */}
        <section>
          <motion.div
            whileTap={{ scale: 0.98 }}
            className="bg-zinc-900 border border-amber-500/30 rounded-xl p-6 relative overflow-hidden group cursor-pointer"
          >
            <div className="flex items-center mb-4 relative z-10">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mr-4">
                <Star className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight text-amber-500">TAF Elite Premium</h3>
                <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest mt-0.5">Desbloqueie todo o potencial</p>
              </div>
            </div>
            <p className="text-xs text-zinc-400 mb-5 relative z-10 leading-relaxed">
              Acesse todos os planos, simulados ilimitados e conteúdo exclusivo para garantir sua aprovação.
            </p>
            <button className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold uppercase tracking-widest rounded-lg transition-colors relative z-10">
              Fazer Upgrade
            </button>
          </motion.div>
        </section>

        {/* Configurações */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center">
            Configurações
          </h2>

          <div className="space-y-2">
            {profile?.role === 'admin' && (
              <button 
                onClick={() => navigate('/admin')}
                className="w-full bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between hover:bg-emerald-900/30 transition-colors mb-4"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center mr-4">
                    <Database className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold uppercase tracking-wide text-xs text-emerald-500">Painel Admin</h4>
                    <p className="text-[10px] font-mono text-emerald-500/70 mt-0.5">Gerenciar conteúdo do app</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-500/50" />
              </button>
            )}

            <button className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 flex items-center justify-between hover:bg-zinc-900 transition-colors">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center mr-4">
                  <User className="w-4 h-4 text-zinc-400" />
                </div>
                <div className="text-left">
                  <h4 className="font-bold uppercase tracking-wide text-xs">Dados Pessoais</h4>
                  <p className="text-[10px] font-mono text-zinc-500 mt-0.5">Atualize seu perfil</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600" />
            </button>

            <button className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 flex items-center justify-between hover:bg-zinc-900 transition-colors">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center mr-4">
                  <Settings className="w-4 h-4 text-zinc-400" />
                </div>
                <div className="text-left">
                  <h4 className="font-bold uppercase tracking-wide text-xs">Preferências</h4>
                  <p className="text-[10px] font-mono text-zinc-500 mt-0.5">Notificações e tema</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600" />
            </button>

            <button
              onClick={handleLogout}
              className="w-full bg-zinc-900/50 border border-red-900/30 rounded-xl p-4 flex items-center justify-between hover:bg-red-950/20 transition-colors mt-6"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center mr-4">
                  <LogOut className="w-4 h-4 text-red-500" />
                </div>
                <div className="text-left">
                  <h4 className="font-bold uppercase tracking-wide text-xs text-red-500">Sair da Conta</h4>
                </div>
              </div>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

