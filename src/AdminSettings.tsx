import React, { useState, useEffect } from 'react';
import { User, Shield, Bell, Globe, Save, Image as ImageIcon, Plus } from 'lucide-react';
import { useAuth } from './AuthContext';

export default function AdminSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<any>({});
  const [coverPhoto, setCoverPhoto] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setCoverPhoto(data.cover_photo || '');
      });
  }, []);

  const handleSaveSetting = async (key: string, value: string) => {
    setLoading(true);
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    });
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setCoverPhoto(data.url);
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Configurações</h1>
        <p className="text-slate-400">Gerencie sua conta e as preferências do sistema.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Cover Photo Section */}
          <div className="glass-dark p-8 rounded-[2rem]">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400">
                <ImageIcon size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Foto de Capa</h3>
                <p className="text-sm text-slate-400">Gerencie a imagem principal da página inicial.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-white/5 border border-white/10 mb-4">
                {coverPhoto ? (
                  <img src={coverPhoto} alt="Cover Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">Sem imagem</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">URL da Imagem ou Upload</label>
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="https://images.unsplash.com/..."
                    value={coverPhoto}
                    onChange={e => setCoverPhoto(e.target.value)}
                  />
                  <label className="cursor-pointer px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center">
                    <Plus size={18} />
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={handleFileUpload}
                      accept="image/*"
                    />
                  </label>
                  <button 
                    onClick={() => handleSaveSetting('cover_photo', coverPhoto)}
                    disabled={loading}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? 'Salvando...' : <><Save size={18} /> Atualizar</>}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-dark p-8 rounded-[2rem]">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400">
                <User size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Perfil do Usuário</h3>
                <p className="text-sm text-slate-400">Informações básicas da sua conta.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nome de Usuário</label>
                <input 
                  type="text" 
                  disabled
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 outline-none cursor-not-allowed"
                  value={user?.username}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">E-mail</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="admin@niklaus.com.br"
                />
              </div>
            </div>
            <button className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-all flex items-center gap-2">
              <Save size={18} /> Salvar Alterações
            </button>
          </div>

          <div className="glass-dark p-8 rounded-[2rem]">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-rose-500/10 rounded-2xl text-rose-400">
                <Shield size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Segurança</h3>
                <p className="text-sm text-slate-400">Altere sua senha e proteja sua conta.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Senha Atual</label>
                <input 
                  type="password" 
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Nova Senha</label>
                  <input 
                    type="password" 
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Confirmar Nova Senha</label>
                  <input 
                    type="password" 
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>
            <button className="mt-8 px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-slate-200 transition-all">
              Atualizar Senha
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-dark p-8 rounded-[2rem]">
            <h3 className="text-lg font-bold text-white mb-6">Preferências</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell size={18} className="text-slate-500" />
                  <span className="text-sm text-slate-300">Notificações</span>
                </div>
                <div className="w-10 h-6 bg-indigo-600 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe size={18} className="text-slate-500" />
                  <span className="text-sm text-slate-300">Modo Público</span>
                </div>
                <div className="w-10 h-6 bg-white/10 rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white/20 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
