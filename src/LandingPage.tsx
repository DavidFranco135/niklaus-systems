import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, ExternalLink, Code2, Smartphone, Globe,
  Layers, ChevronDown, X, ChevronLeft, ChevronRight,
  Mail, Instagram, Github, Menu, Shield
} from 'lucide-react';
import { collection, getDocs, doc, getDoc, orderBy, query } from 'firebase/firestore';
import { db } from './firebase';
import { GalleryItem } from './types';

const DEFAULTS = {
  cover_photo: 'https://picsum.photos/seed/niklaus-dark/1920/1080',
  hero_badge: 'Software Development',
  hero_title: 'Construindo o futuro digital',
  hero_subtitle: 'Desenvolvimento de software sob medida — web, mobile e sistemas — com design que encanta e tecnologia que performa.',
  hero_cta_primary: 'Ver Projetos',
  hero_cta_secondary: 'Falar Comigo',
  about_title: 'Transformo ideias em produtos digitais reais',
  about_text1: 'Sou um desenvolvedor full-stack apaixonado por criar experiências digitais excepcionais. Com foco em código limpo, design moderno e entregas que superam expectativas.',
  about_text2: 'De startups a grandes empresas, cada projeto recebe atenção total — da arquitetura ao pixel final. Tecnologia como ferramenta para transformar negócios reais.',
  stat1_value: '50+', stat1_label: 'Projetos entregues',
  stat2_value: '3+',  stat2_label: 'Anos de experiência',
  stat3_value: '100%', stat3_label: 'Satisfação garantida',
  services_title: 'Serviços especializados',
  service1_title: 'Desenvolvimento Web',
  service1_desc: 'Sites institucionais, landing pages e sistemas web modernos com foco em performance e conversão.',
  service2_title: 'Apps Mobile',
  service2_desc: 'Aplicativos iOS e Android com React Native, entregando experiências nativas de alta qualidade.',
  service3_title: 'Sistemas & APIs',
  service3_desc: 'Backends robustos, integrações e APIs REST escaláveis para o seu negócio crescer.',
  service4_title: 'UI/UX Design',
  service4_desc: 'Interfaces elegantes, responsivas e centradas no usuário que convertem e encantam.',
  portfolio_title: 'Projetos em destaque',
  portfolio_subtitle: 'Cada projeto é uma história de parceria, desafio e resultado. Clique para ver os detalhes.',
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

type SiteContent = typeof DEFAULTS;

const Section = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className={className}>
      {children}
    </motion.div>
  );
};

// ── Lightbox (corrigido para string[] do Firestore) ───────────────────────────
const Lightbox = ({ item, onClose }: { item: GalleryItem; onClose: () => void }) => {
  const [idx, setIdx] = useState(0);

  // Suporta images como string[] (Firestore) ou {url:string}[] (tipo antigo)
  const extraImages: string[] = (item.images || []).map((img: any) =>
    typeof img === 'string' ? img : img.url
  );
  const images = [item.url, ...extraImages].filter(Boolean);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIdx(p => (p + 1) % images.length);
      if (e.key === 'ArrowLeft')  setIdx(p => (p - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [images.length]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4"
      onClick={onClose}
    >
      <button className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all" onClick={onClose}>
        <X size={24} />
      </button>
      <div className="w-full max-w-5xl" onClick={e => e.stopPropagation()}>
        <motion.img key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          src={images[idx]} alt={item.title} className="w-full max-h-[70vh] object-contain rounded-3xl" referrerPolicy="no-referrer" />

        {images.length > 1 && (
          <div className="flex items-center justify-between mt-4">
            <button onClick={() => setIdx(p => (p - 1 + images.length) % images.length)}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all">
              <ChevronLeft size={20} />
            </button>
            <div className="flex gap-2 items-center">
              {images.map((_, i) => (
                <button key={i} onClick={() => setIdx(i)}
                  className={`h-2 rounded-full transition-all ${i === idx ? 'bg-indigo-500 w-6' : 'bg-white/20 w-2'}`} />
              ))}
            </div>
            <button onClick={() => setIdx(p => (p + 1) % images.length)}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all">
              <ChevronRight size={20} />
            </button>
          </div>
        )}
        <div className="mt-6 text-center">
          <h3 className="text-2xl font-bold text-white tracking-tight">{item.title}</h3>
          {item.description && <p className="text-slate-400 mt-2 max-w-xl mx-auto">{item.description}</p>}
          <p className="text-slate-600 text-xs mt-3">{idx + 1} / {images.length}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [content, setContent]   = useState<SiteContent>(DEFAULTS);
  const [gallery, setGallery]   = useState<GalleryItem[]>([]);
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    getDoc(doc(db, 'settings', 'company')).then(snap => {
      if (snap.exists()) setContent(prev => ({ ...prev, ...snap.data() }));
    });
    getDocs(query(collection(db, 'gallery'), orderBy('created_at', 'desc'))).then(snap => {
      setGallery(snap.docs.map(d => ({ id: d.id, ...d.data() } as GalleryItem)));
    });
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const services = [
    { icon: <Globe size={28} />,      title: content.service1_title, desc: content.service1_desc },
    { icon: <Smartphone size={28} />, title: content.service2_title, desc: content.service2_desc },
    { icon: <Code2 size={28} />,      title: content.service3_title, desc: content.service3_desc },
    { icon: <Layers size={28} />,     title: content.service4_title, desc: content.service4_desc },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 overflow-x-hidden">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between bg-black/40 backdrop-blur-2xl border border-white/5 rounded-2xl px-6 py-3">
          <span className="text-xl font-display font-bold tracking-tighter text-white">NIKLAUS<span className="text-indigo-500">.</span></span>
          <div className="hidden md:flex items-center gap-8">
            {[{id:'sobre',l:'Sobre'},{id:'servicos',l:'Serviços'},{id:'portfolio',l:'Portfólio'},{id:'contato',l:'Contato'}].map(i => (
              <button key={i.id} onClick={() => scrollTo(i.id)} className="text-sm font-bold text-slate-400 hover:text-white transition-colors">{i.l}</button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => navigate('/login')} className="flex items-center gap-2 px-4 py-2 text-xs font-black text-slate-500 hover:text-indigo-400 uppercase tracking-widest transition-colors">
              <Shield size={14} /> Admin
            </button>
            <button onClick={() => scrollTo('contato')} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-500 transition-all">Contato</button>
          </div>
          <button className="md:hidden p-2 text-slate-400" onClick={() => setMenuOpen(!menuOpen)}><Menu size={22} /></button>
        </div>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="md:hidden mt-2 mx-auto max-w-6xl bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
            {['sobre','servicos','portfolio','contato'].map(s => (
              <button key={s} onClick={() => scrollTo(s)} className="text-left text-white font-bold capitalize py-2 border-b border-white/5">
                {s==='servicos'?'Serviços':s==='portfolio'?'Portfólio':s.charAt(0).toUpperCase()+s.slice(1)}
              </button>
            ))}
            <button onClick={() => navigate('/login')} className="text-left text-slate-500 font-bold text-sm uppercase tracking-widest">Área Admin</button>
          </motion.div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={content.cover_photo} alt="Cover" className="w-full h-full object-cover opacity-20" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/60 via-transparent to-[#050505]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505]" />
        </div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="inline-block px-4 py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-8">
              {content.hero_badge}
            </span>
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-display font-bold tracking-tighter text-white mb-6 leading-[0.9]">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400">
                {content.hero_title}
              </span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">{content.hero_subtitle}</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button onClick={() => scrollTo('portfolio')} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-500/30 flex items-center gap-2 group">
                {content.hero_cta_primary} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => scrollTo('contato')} className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all">
                {content.hero_cta_secondary}
              </button>
            </div>
          </motion.div>
        </div>
        <button onClick={() => scrollTo('sobre')} className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-500 hover:text-white transition-colors animate-bounce">
          <ChevronDown size={28} />
        </button>
      </section>

      {/* SOBRE */}
      <section id="sobre" className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <Section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 block">Quem sou eu</span>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tighter mb-6">{content.about_title}</h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-6">{content.about_text1}</p>
              <p className="text-slate-500 leading-relaxed mb-10">{content.about_text2}</p>
              <div className="grid grid-cols-3 gap-6">
                {[{n:content.stat1_value,l:content.stat1_label},{n:content.stat2_value,l:content.stat2_label},{n:content.stat3_value,l:content.stat3_label}].map(s=>(
                  <div key={s.l}>
                    <p className="text-3xl font-display font-bold text-white">{s.n}</p>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-[3rem] bg-gradient-to-br from-indigo-600/20 to-purple-600/10 border border-white/5 overflow-hidden">
                <img src={content.cover_photo} alt="Profile" className="w-full h-full object-cover opacity-60 mix-blend-luminosity" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-6 -right-6 p-6 bg-indigo-600 rounded-3xl shadow-2xl shadow-indigo-600/30"><Code2 size={32} className="text-white" /></div>
            </div>
          </Section>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section id="servicos" className="py-32 px-6 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto">
          <Section className="text-center mb-20">
            <span className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 block">O que ofereço</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tighter">{content.services_title}</h2>
          </Section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((s, i) => (
              <Section key={i}>
                <div className="group p-8 bg-white/[0.02] rounded-[2.5rem] border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all h-full">
                  <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl w-fit mb-6 group-hover:bg-indigo-500/20 transition-all">{s.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{s.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* PORTFÓLIO */}
      <section id="portfolio" className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <Section className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-16">
            <div>
              <span className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 block">Meu trabalho</span>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tighter">{content.portfolio_title}</h2>
            </div>
            <p className="text-slate-400 max-w-xs text-sm leading-relaxed">{content.portfolio_subtitle}</p>
          </Section>
          {gallery.length === 0 ? (
            <Section className="text-center py-20 text-slate-600"><p className="text-lg">Projetos em breve...</p></Section>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gallery.map(item => {
                const extras: string[] = (item.images || []).map((img: any) => typeof img === 'string' ? img : img.url);
                return (
                  <Section key={item.id}>
                    <motion.div whileHover={{ y: -4 }} onClick={() => setSelected(item)}
                      className="group cursor-pointer bg-white/[0.02] rounded-[2.5rem] border border-white/5 overflow-hidden hover:border-indigo-500/20 transition-all">
                      <div className="aspect-video relative overflow-hidden bg-white/5">
                        <img src={item.url} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                          <span className="text-white text-xs font-black uppercase tracking-widest flex items-center gap-2">Ver projeto <ExternalLink size={14} /></span>
                        </div>
                        {extras.length > 0 && (
                          <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-xs font-bold text-white">
                            {1 + extras.length} fotos
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-white text-lg tracking-tight mb-1">{item.title}</h3>
                        {item.description && <p className="text-slate-500 text-sm line-clamp-2">{item.description}</p>}
                      </div>
                    </motion.div>
                  </Section>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CONTATO */}
      <section id="contato" className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <Section className="text-center mb-16">
            <span className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 block">Vamos conversar</span>
            <h2 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tighter mb-6">{content.contact_title}</h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">{content.contact_subtitle}</p>
          </Section>
          <Section>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[
                { href: `mailto:${content.contact_email}`, icon: <Mail size={22}/>, label: 'E-mail', value: content.contact_email },
                { href: content.contact_instagram_url, icon: <Instagram size={22}/>, label: 'Instagram', value: content.contact_instagram },
                { href: content.contact_github_url, icon: <Github size={22}/>, label: 'GitHub', value: content.contact_github },
              ].map(item => (
                <a key={item.label} href={item.href} target="_blank" rel="noreferrer"
                  className="group p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center gap-4 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all">
                  <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl group-hover:bg-indigo-500/20 transition-all">{item.icon}</div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{item.label}</p>
                    <p className="text-white font-bold text-sm truncate max-w-[140px]">{item.value}</p>
                  </div>
                </a>
              ))}
            </div>
            <div className="p-10 bg-gradient-to-br from-indigo-600/20 to-purple-600/10 rounded-[3rem] border border-indigo-500/20 text-center">
              <h3 className="text-2xl font-bold text-white mb-3">Pronto para começar?</h3>
              <p className="text-slate-400 mb-8">Entre em contato e receba um orçamento personalizado sem compromisso.</p>
              <a href={`mailto:${content.contact_email}`} className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-500/30 group">
                {content.contact_cta} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </Section>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-xl font-display font-bold tracking-tighter text-white">NIKLAUS<span className="text-indigo-500">.</span></span>
          <p className="text-slate-600 text-sm">© {new Date().getFullYear()} {content.footer_text}</p>
          <button onClick={() => navigate('/login')} className="text-xs text-slate-700 hover:text-slate-500 transition-colors flex items-center gap-1">
            <Shield size={12} /> Área administrativa
          </button>
        </div>
      </footer>

      {selected && <Lightbox item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
