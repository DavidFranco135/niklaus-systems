import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, Loader2, CheckCircle2, Image as ImageIcon, Upload,
  Type, User, Briefcase, Phone, ChevronDown, ChevronUp, Eye
} from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { uploadFile } from './lib/utils';

// ── Defaults (mesmos da LandingPage) ─────────────────────────────────────────
const DEFAULTS: Record<string, string> = {
  cover_photo: '',
  hero_badge: 'Software Development',
  hero_title: 'Construindo o futuro digital',
  hero_subtitle: 'Desenvolvimento de software sob medida — web, mobile e sistemas — com design que encanta e tecnologia que performa.',
  hero_cta_primary: 'Ver Projetos',
  hero_cta_secondary: 'Falar Comigo',
  about_title: 'Transformo ideias em produtos digitais reais',
  about_text1: 'Sou um desenvolvedor full-stack apaixonado por criar experiências digitais excepcionais.',
  about_text2: 'De startups a grandes empresas, cada projeto recebe atenção total.',
  stat1_value: '50+', stat1_label: 'Projetos entregues',
  stat2_value: '3+',  stat2_label: 'Anos de experiência',
  stat3_value: '100%', stat3_label: 'Satisfação garantida',
  services_title: 'Serviços especializados',
  service1_title: 'Desenvolvimento Web',
  service1_desc: 'Sites institucionais, landing pages e sistemas web modernos.',
  service2_title: 'Apps Mobile',
  service2_desc: 'Aplicativos iOS e Android com React Native.',
  service3_title: 'Sistemas & APIs',
  service3_desc: 'Backends robustos, integrações e APIs REST escaláveis.',
  service4_title: 'UI/UX Design',
  service4_desc: 'Interfaces elegantes, responsivas e centradas no usuário.',
  portfolio_title: 'Projetos em destaque',
  portfolio_subtitle: 'Cada projeto é uma história de parceria, desafio e resultado.',
  contact_title: 'Tem um projeto em mente?',
  contact_subtitle: 'Estou disponível para novos projetos. Vamos transformar sua ideia em realidade.',
  contact_cta: 'Solicitar Orçamento',
  contact_email: 'niklausadm@gmail.com',
  contact_instagram: '@niklaus.dev',
  contact_instagram_url: 'https://instagram.com',
  contact_github: 'github.com/niklaus',
  contact_github_url: 'https://github.com',
  footer_text: 'Niklaus Systems. Todos os direitos reservados.',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block mb-1.5">
    {children}
  </label>
);

const Input = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <input
    type="text"
    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors text-sm"
    value={value}
    placeholder={placeholder}
    onChange={e => onChange(e.target.value)}
  />
);

const Textarea = ({ value, onChange, rows = 3 }: { value: string; onChange: (v: string) => void; rows?: number }) => (
  <textarea
    rows={rows}
    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors text-sm resize-none"
    value={value}
    onChange={e => onChange(e.target.value)}
  />
);

// ── Collapsible Section ───────────────────────────────────────────────────────
const Panel = ({ icon, title, color, children }: { icon: React.ReactNode; title: string; color: string; children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass-dark rounded-[2rem] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-6 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${color}`}>{icon}</div>
          <span className="font-bold text-white text-lg">{title}</span>
        </div>
        {open ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-5 border-t border-white/5 pt-6">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AdminPageManager() {
  const [data, setData]         = useState<Record<string, string>>(DEFAULTS);
  const [saving, setSaving]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    getDoc(doc(db, 'settings', 'company')).then(snap => {
      if (snap.exists()) setData(prev => ({ ...prev, ...snap.data() }));
    });
  }, []);

  const set = (key: string, value: string) => setData(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'company'), data, { merge: true });
      setSavedMsg('Alterações salvas com sucesso!');
      setTimeout(() => setSavedMsg(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file);
      set('cover_photo', url);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold text-white tracking-tighter uppercase">Página Pública</h1>
          <p className="text-slate-500 font-medium">Edite todos os textos e imagens exibidos no portfólio.</p>
        </div>
        <div className="flex items-center gap-4">
          <a href="/" target="_blank" rel="noreferrer"
            className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all text-sm font-bold">
            <Eye size={16} /> Visualizar site
          </a>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-60"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Salvando...' : 'Salvar Tudo'}
          </button>
        </div>
      </div>

      {savedMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-6 py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 font-bold">
          <CheckCircle2 size={20} /> {savedMsg}
        </motion.div>
      )}

      {/* ── CAPA ──────────────────────────────────────────────────────────── */}
      <Panel icon={<ImageIcon size={20} className="text-indigo-400" />} title="Foto de Capa" color="bg-indigo-500/10">
        {data.cover_photo && (
          <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/10 mb-4">
            <img src={data.cover_photo} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
        )}
        <div className="flex gap-3">
          <Input value={data.cover_photo} onChange={v => set('cover_photo', v)} placeholder="https://... cole uma URL ou faça upload" />
          <label className={`cursor-pointer flex items-center gap-2 px-5 py-3 bg-indigo-600 rounded-xl text-white font-bold text-sm hover:bg-indigo-500 transition-all whitespace-nowrap ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            Upload
            <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
          </label>
        </div>
      </Panel>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <Panel icon={<Type size={20} className="text-purple-400" />} title="Seção Hero (topo)" color="bg-purple-500/10">
        <div>
          <Label>Badge (etiqueta pequena)</Label>
          <Input value={data.hero_badge} onChange={v => set('hero_badge', v)} />
        </div>
        <div>
          <Label>Título principal</Label>
          <Input value={data.hero_title} onChange={v => set('hero_title', v)} />
        </div>
        <div>
          <Label>Subtítulo / descrição</Label>
          <Textarea value={data.hero_subtitle} onChange={v => set('hero_subtitle', v)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Botão primário</Label>
            <Input value={data.hero_cta_primary} onChange={v => set('hero_cta_primary', v)} />
          </div>
          <div>
            <Label>Botão secundário</Label>
            <Input value={data.hero_cta_secondary} onChange={v => set('hero_cta_secondary', v)} />
          </div>
        </div>
      </Panel>

      {/* ── SOBRE ─────────────────────────────────────────────────────────── */}
      <Panel icon={<User size={20} className="text-emerald-400" />} title="Seção Sobre" color="bg-emerald-500/10">
        <div>
          <Label>Título</Label>
          <Input value={data.about_title} onChange={v => set('about_title', v)} />
        </div>
        <div>
          <Label>Parágrafo 1</Label>
          <Textarea value={data.about_text1} onChange={v => set('about_text1', v)} />
        </div>
        <div>
          <Label>Parágrafo 2</Label>
          <Textarea value={data.about_text2} onChange={v => set('about_text2', v)} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(n => (
            <div key={n} className="space-y-3">
              <div>
                <Label>Número {n}</Label>
                <Input value={data[`stat${n}_value`]} onChange={v => set(`stat${n}_value`, v)} placeholder="ex: 50+" />
              </div>
              <div>
                <Label>Legenda {n}</Label>
                <Input value={data[`stat${n}_label`]} onChange={v => set(`stat${n}_label`, v)} placeholder="ex: Projetos entregues" />
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* ── SERVIÇOS ──────────────────────────────────────────────────────── */}
      <Panel icon={<Briefcase size={20} className="text-amber-400" />} title="Seção Serviços" color="bg-amber-500/10">
        <div>
          <Label>Título da seção</Label>
          <Input value={data.services_title} onChange={v => set('services_title', v)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3,4].map(n => (
            <div key={n} className="space-y-3 p-4 bg-white/[0.02] rounded-2xl border border-white/5">
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Serviço {n}</p>
              <div>
                <Label>Título</Label>
                <Input value={data[`service${n}_title`]} onChange={v => set(`service${n}_title`, v)} />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea value={data[`service${n}_desc`]} onChange={v => set(`service${n}_desc`, v)} rows={2} />
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* ── PORTFÓLIO ─────────────────────────────────────────────────────── */}
      <Panel icon={<ImageIcon size={20} className="text-blue-400" />} title="Seção Portfólio" color="bg-blue-500/10">
        <div>
          <Label>Título</Label>
          <Input value={data.portfolio_title} onChange={v => set('portfolio_title', v)} />
        </div>
        <div>
          <Label>Subtítulo</Label>
          <Textarea value={data.portfolio_subtitle} onChange={v => set('portfolio_subtitle', v)} rows={2} />
        </div>
        <p className="text-xs text-slate-500 mt-2 italic">Os projetos são gerenciados na aba <strong className="text-slate-400">Galeria</strong>.</p>
      </Panel>

      {/* ── CONTATO ───────────────────────────────────────────────────────── */}
      <Panel icon={<Phone size={20} className="text-rose-400" />} title="Seção Contato & Rodapé" color="bg-rose-500/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Título da seção</Label>
            <Input value={data.contact_title} onChange={v => set('contact_title', v)} />
          </div>
          <div>
            <Label>Texto do botão CTA</Label>
            <Input value={data.contact_cta} onChange={v => set('contact_cta', v)} />
          </div>
        </div>
        <div>
          <Label>Subtítulo / descrição</Label>
          <Textarea value={data.contact_subtitle} onChange={v => set('contact_subtitle', v)} rows={2} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <Label>E-mail de contato</Label>
            <Input value={data.contact_email} onChange={v => set('contact_email', v)} placeholder="seu@email.com" />
          </div>
          <div>
            <Label>Instagram (@handle)</Label>
            <Input value={data.contact_instagram} onChange={v => set('contact_instagram', v)} placeholder="@seu.perfil" />
          </div>
          <div>
            <Label>URL do Instagram</Label>
            <Input value={data.contact_instagram_url} onChange={v => set('contact_instagram_url', v)} placeholder="https://instagram.com/..." />
          </div>
          <div>
            <Label>GitHub (texto exibido)</Label>
            <Input value={data.contact_github} onChange={v => set('contact_github', v)} placeholder="github.com/seu-usuario" />
          </div>
          <div>
            <Label>URL do GitHub</Label>
            <Input value={data.contact_github_url} onChange={v => set('contact_github_url', v)} placeholder="https://github.com/..." />
          </div>
          <div>
            <Label>Texto do rodapé</Label>
            <Input value={data.footer_text} onChange={v => set('footer_text', v)} />
          </div>
        </div>
      </Panel>

      {/* Salvar botão final */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-500/20 disabled:opacity-60"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Salvando...' : 'Salvar Todas as Alterações'}
        </button>
      </div>
    </div>
  );
}
