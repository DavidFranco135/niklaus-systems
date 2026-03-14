import React, { useState, useEffect } from 'react';
import { User, Shield, Bell, Globe, Save, Image as ImageIcon, Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { uploadFile } from './lib/utils';
import { useAuth } from './AuthContext';

export default function AdminSettings() {
  const { user, changePassword } = useAuth();

  const [coverPhoto, setCoverPhoto] = useState('');
  const [savingCover, setSavingCover]   = useState(false);
  const [coverMsg, setCoverMsg]         = useState('');

  const [uploading, setUploading] = useState(false);

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass]         = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMsg, setPassMsg]         = useState('');
  const [savingPass, setSavingPass]   = useState(false);

  useEffect(() => {
    getDoc(doc(db, 'settings', 'company')).then(snap => {
      if (snap.exists()) setCoverPhoto(snap.data().cover_photo || '');
    });
  }, []);

  const handleSaveCover = async () => {
    setSavingCover(true);
    setCoverMsg('');
    try {
      await setDoc(doc(db, 'settings', 'company'), { cover_photo: coverPhoto }, { merge: true });
      setCoverMsg('Capa atualizada com sucesso!');
      setTimeout(() => setCoverMsg(''), 3000);
    } finally {
      setSavingCover(false);
    }
  };

  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file, 'covers');
      setCoverPhoto(url);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      setPassMsg('As senhas novas não coincidem.');
      return;
    }
    if (newPass.length < 6) {
      setPassMsg('A nova senha deve ter ao menos 6 caracteres.');
      return;
    }
    setSavingPass(true);
    setPassMsg('');
    const result = await changePassword(currentPass, newPass);
    setSavingPass(false);
    if (result.success) {
      setPassMsg('Senha atualizada com sucesso!');
      setCurrentPass(''); setNewPass(''); setConfirmPass('');
    } else {
      setPassMsg(result.error || 'Erro ao atualizar senha.');
    }
    setTimeout(() => setPassMsg(''), 4000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-display font-bold text-white tracking-tighter uppercase">Configurações</h1>
        <p className="text-slate-400">Gerencie sua conta e as preferências do sistema.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">

          {/* ── Cover Photo ─────────────────────────────────────────────── */}
          <div className="glass-dark p-8 rounded-[2rem]">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400"><ImageIcon size={24} /></div>
              <div>
                <h3 className="text-lg font-bold text-white">Foto de Capa</h3>
                <p className="text-sm text-slate-400">Imagem de fundo exibida no portfólio público.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                {coverPhoto ? (
                  <img src={coverPhoto} alt="Cover Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600 text-sm">Sem imagem de capa</div>
                )}
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  placeholder="https://... ou faça upload"
                  value={coverPhoto}
                  onChange={e => setCoverPhoto(e.target.value)}
                />
                <label className={`cursor-pointer px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
                  {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  <span className="text-sm font-bold">Upload</span>
                  <input type="file" className="hidden" onChange={handleUploadCover} accept="image/*" />
                </label>
                <button
                  onClick={handleSaveCover}
                  disabled={savingCover || !coverPhoto}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {savingCover ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Salvar
                </button>
              </div>

              {coverMsg && (
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                  <CheckCircle2 size={16} /> {coverMsg}
                </div>
              )}
            </div>
          </div>

          {/* ── User Info ────────────────────────────────────────────────── */}
          <div className="glass-dark p-8 rounded-[2rem]">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400"><User size={24} /></div>
              <div>
                <h3 className="text-lg font-bold text-white">Perfil do Usuário</h3>
                <p className="text-sm text-slate-400">Informações da sua conta Firebase.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">E-mail</label>
                <input
                  type="text"
                  disabled
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 outline-none cursor-not-allowed"
                  value={user?.email || ''}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">UID</label>
                <input
                  type="text"
                  disabled
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-500 outline-none cursor-not-allowed text-xs"
                  value={user?.uid || ''}
                />
              </div>
            </div>
          </div>

          {/* ── Security ─────────────────────────────────────────────────── */}
          <div className="glass-dark p-8 rounded-[2rem]">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-rose-500/10 rounded-2xl text-rose-400"><Shield size={24} /></div>
              <div>
                <h3 className="text-lg font-bold text-white">Segurança</h3>
                <p className="text-sm text-slate-400">Altere sua senha de acesso.</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Senha Atual</label>
                <input
                  required
                  type="password"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={currentPass}
                  onChange={e => setCurrentPass(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Nova Senha</label>
                  <input
                    required
                    type="password"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newPass}
                    onChange={e => setNewPass(e.target.value)}
                    placeholder="mínimo 6 caracteres"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Confirmar Nova Senha</label>
                  <input
                    required
                    type="password"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={confirmPass}
                    onChange={e => setConfirmPass(e.target.value)}
                  />
                </div>
              </div>

              {passMsg && (
                <div className={`flex items-center gap-2 text-sm font-medium px-4 py-3 rounded-xl border ${
                  passMsg.includes('sucesso')
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                    : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                }`}>
                  {passMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={savingPass}
                className="mt-2 px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {savingPass ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
                Atualizar Senha
              </button>
            </form>
          </div>
        </div>

        {/* ── Sidebar preferences ─────────────────────────────────────── */}
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
                  <span className="text-sm text-slate-300">Portfólio Público</span>
                </div>
                <div className="w-10 h-6 bg-indigo-600 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="glass-dark p-8 rounded-[2rem]">
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">Versão do Sistema</h3>
            <p className="text-white font-bold">Niklaus Systems</p>
            <p className="text-slate-500 text-xs mt-1">v2.0.0 — Firebase Edition</p>
          </div>
        </div>
      </div>
    </div>
  );
}
