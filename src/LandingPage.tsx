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
  portfolio_subtitle: 'Cada projeto é uma história de parceria, desafio e resultado. Toque para ver os detalhes.',
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

// Animated section wrapper — margin menor no mobile para não cortar animação
const Section = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ── Lightbox com suporte a swipe mobile ───────────────────────────────────────
const Lightbox = ({ item, onClose }: { item: GalleryItem; onClose: () => void }) => {
  const [idx, setIdx]       = useState(0);
  const touchStartX         = useRef<number>(0);
  const touchStartY         = useRef<number>(0);

  const extraImages: string[] = (item.images || []).map((img: any) =>
    typeof img === 'string' ? img : img.url
  );
  const images = [item.url, ...extraImages].filter(Boolean);

  const prev = () => setIdx(p => (p - 1 + images.length) % images.length);
  const next = () => setIdx(p => (p + 1) % images.length);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft')  prev();
    };
    // Trava scroll do body ao abrir lightbox
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', fn);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', fn);
    };
  }, [images.length]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    if (Math.abs(dx) > 50 && dy < 80) {
      dx < 0 ? next() : prev();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-3 sm:p-6"
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Fechar */}
      <button
        className="absolute top-4 right-4 p-3 bg-white/10 active:bg-white/20 rounded-2xl text-white touch-manipulation z-10"
        onClick={onClose}
        style={{ minWidth: 44, minHeight: 44 }}
      >
        <X size={22} />
      </button>

      <div className="w-full max-w-5xl" onClick={e => e.stopPropagation()}>
        <motion.img
          key={idx}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          src={images[idx]}
          alt={item.title}
          className="w-full max-h-[65vh] object-contain rounded-2xl sm:rounded-3xl"
          referrerPolicy="no-referrer"
          draggable={false}
        />

        {images.length > 1 && (
          <div className="flex items-center justify-between mt-4 px-1">
            <button
              onClick={prev}
              className="p-3 bg-white/10 active:bg-white/20 rounded-2xl text-white touch-manipulation"
              style={{ minWidth: 44, minHeight: 44 }}
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex gap-2 items-center">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`h-2 rounded-full transition-all touch-manipulation ${i === idx ? 'bg-indigo-500 w-6' : 'bg-white/20 w-2'}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="p-3 bg-white/10 active:bg-white/20 rounded-2xl text-white touch-manipulation"
              style={{ minWidth: 44, minHeight: 44 }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        <div className="mt-5 text-center px-4">
          <h3 className="text-lg sm:text-2xl font-bold text-white tracking-tight">{item.title}</h3>
          {item.description && (
            <p className="text-slate-400 mt-2 text-sm sm:text-base max-w-xl mx-auto line-clamp-3">{item.description}</p>
          )}
          <p className="text-slate-600 text-xs mt-2">{idx + 1} / {images.length}</p>
        </div>
      </div>
    </motion.div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate                = useNavigate();
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
    { icon: <Globe size={24} />,      title: content.service1_title, desc: content.service1_desc },
    { icon: <Smartphone size={24} />, title: content.service2_title, desc: content.service2_desc },
    { icon: <Code2 size={24} />,      title: content.service3_title, desc: content.service3_desc },
    { icon: <Layers size={24} />,     title: content.service4_title, desc: content.service4_desc },
  ];

  return (
    // 100dvh = suporte correto para iOS Safari (exclui a barra do browser)
    <div className="min-h-[100dvh] bg-[#050505] text-slate-200 overflow-x-hidden">

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between bg-black/60 border border-white/5 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3">
          <span className="text-lg sm:text-xl font-display font-bold tracking-tighter text-white">
            NIKLAUS<span className="text-indigo-500">.</span>
          </span>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {[{id:'sobre',l:'Sobre'},{id:'servicos',l:'Serviços'},{id:'portfolio',l:'Portfólio'},{id:'contato',l:'Contato'}].map(i => (
              <button key={i.id} onClick={() => scrollTo(i.id)}
                className="text-sm font-bold text-slate-400 hover:text-white transition-colors touch-manipulation">
                {i.l}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <button onClick={() => navigate('/login')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-black text-slate-500 hover:text-indigo-400 uppercase tracking-widest transition-colors touch-manipulation">
              <Shield size={13} /> Admin
            </button>
            <button onClick={() => scrollTo('contato')}
              className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-500 active:bg-indigo-700 transition-all touch-manipulation">
              Contato
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2.5 text-slate-400 active:text-white touch-manipulation"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ minWidth: 44, minHeight: 44 }}
            aria-label="Menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden mt-2 mx-auto max-w-6xl bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden"
          >
            {['sobre','servicos','portfolio','contato'].map(s => (
              <button key={s} onClick={() => scrollTo(s)}
                className="w-full text-left text-white font-bold px-6 py-4 border-b border-white/5 active:bg-white/5 touch-manipulation"
                style={{ minHeight: 52 }}>
                {s==='servicos'?'Serviços':s==='portfolio'?'Portfólio':s.charAt(0).toUpperCase()+s.slice(1)}
              </button>
            ))}
            <button onClick={() => { navigate('/login'); setMenuOpen(false); }}
              className="w-full text-left text-slate-500 font-bold text-xs uppercase tracking-widest px-6 py-4 active:bg-white/5 touch-manipulation"
              style={{ minHeight: 52 }}>
              Área Administrativa
            </button>
          </motion.div>
        )}
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden pt-20">
        {/* Fundo */}
        <div className="absolute inset-0">
          <img src={content.cover_photo} alt="" className="w-full h-full object-cover opacity-20" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/60 via-transparent to-[#050505]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505]" />
        </div>
        {/* Orbs — menores no mobile para não causar lag */}
        <div className="absolute top-1/4 left-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-indigo-600/15 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-purple-600/10 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="inline-block px-3 sm:px-4 py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] mb-6 sm:mb-8">
              {content.hero_badge}
            </span>
            {/* Título — escala progressiva do mobile ao desktop */}
            <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold tracking-tighter text-white mb-5 sm:mb-6 leading-[0.92]">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400">
                {content.hero_title}
              </span>
            </h1>
            <p className="text-slate-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
              {content.hero_subtitle}
            </p>
            {/* Botões — full width no mobile, auto no desktop */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0">
              <button
                onClick={() => scrollTo('portfolio')}
                className="w-full sm:w-auto px-7 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 active:bg-indigo-700 transition-all shadow-2xl shadow-indigo-500/30 flex items-center justify-center gap-2 group touch-manipulation"
              >
                {content.hero_cta_primary}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => scrollTo('contato')}
                className="w-full sm:w-auto px-7 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 active:bg-white/15 transition-all touch-manipulation"
              >
                {content.hero_cta_secondary}
              </button>
            </div>
          </motion.div>
        </div>

        <button
          onClick={() => scrollTo('sobre')}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-500 hover:text-white transition-colors animate-bounce touch-manipulation"
          style={{ minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <ChevronDown size={26} />
        </button>
      </section>

      {/* ── SOBRE ────────────────────────────────────────────────────────── */}
      <section id="sobre" className="py-20 sm:py-28 lg:py-32 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <Section className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Texto */}
            <div>
              <span className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 block">Quem sou eu</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white tracking-tighter mb-5 sm:mb-6 leading-tight">
                {content.about_title}
              </h2>
              <p className="text-slate-400 text-base sm:text-lg leading-relaxed mb-4 sm:mb-6">{content.about_text1}</p>
              <p className="text-slate-500 leading-relaxed mb-8 sm:mb-10">{content.about_text2}</p>
              <div className="grid grid-cols-3 gap-4 sm:gap-6">
                {[
                  {n: content.stat1_value, l: content.stat1_label},
                  {n: content.stat2_value, l: content.stat2_label},
                  {n: content.stat3_value, l: content.stat3_label},
                ].map(s => (
                  <div key={s.l}>
                    <p className="text-2xl sm:text-3xl font-display font-bold text-white">{s.n}</p>
                    <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest mt-1 leading-tight">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Card logo */}
            <div className="relative mt-4 lg:mt-0">
              <div className="aspect-square rounded-[2rem] sm:rounded-[3rem] border border-white/10 overflow-hidden relative">
                <img src={content.cover_photo} alt="" className="w-full h-full object-cover opacity-40" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-[#050505]/50" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/80 via-transparent to-[#050505]/30" />
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-transparent to-purple-600/10" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8">
                  <svg viewBox="0 0 520 140" className="w-full max-w-[260px] sm:max-w-[340px]" xmlns="http://www.w3.org/2000/svg">
                    <text fontFamily="'Outfit', sans-serif" fontWeight="800" fontSize="100" letterSpacing="-4" fill="white" x="0" y="108">
                      NIKLAUS<tspan fill="#6366f1">.</tspan>
                    </text>
                  </svg>
                  <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.35em] sm:tracking-[0.4em] text-white/30">
                    Software Development
                  </p>
                </div>
              </div>
              <div className="absolute -bottom-5 -right-5 sm:-bottom-6 sm:-right-6 p-4 sm:p-5 bg-indigo-600 rounded-2xl sm:rounded-3xl shadow-2xl shadow-indigo-600/30">
                <Code2 size={24} className="text-white" />
              </div>
            </div>
          </Section>
        </div>
      </section>

      {/* ── SERVIÇOS ─────────────────────────────────────────────────────── */}
      <section id="servicos" className="py-20 sm:py-28 lg:py-32 px-4 sm:px-6 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto">
          <Section className="text-center mb-12 sm:mb-16 lg:mb-20">
            <span className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 block">O que ofereço</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white tracking-tighter">
              {content.services_title}
            </h2>
          </Section>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {services.map((s, i) => (
              <Section key={i}>
                <div className="p-6 sm:p-8 bg-white/[0.02] rounded-2xl sm:rounded-[2.5rem] border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 active:bg-indigo-500/5 transition-all h-full touch-manipulation">
                  <div className="p-3 sm:p-4 bg-indigo-500/10 text-indigo-400 rounded-xl sm:rounded-2xl w-fit mb-4 sm:mb-6">
                    {s.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 tracking-tight">{s.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-sm sm:text-base">{s.desc}</p>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* ── PORTFÓLIO ────────────────────────────────────────────────────── */}
      <section id="portfolio" className="py-20 sm:py-28 lg:py-32 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <Section className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 sm:gap-6 mb-10 sm:mb-14 lg:mb-16">
            <div>
              <span className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 block">Meu trabalho</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white tracking-tighter">
                {content.portfolio_title}
              </h2>
            </div>
            <p className="text-slate-400 sm:max-w-[220px] text-sm leading-relaxed">{content.portfolio_subtitle}</p>
          </Section>

          {gallery.length === 0 ? (
            <Section className="text-center py-16 text-slate-600">
              <p>Projetos em breve...</p>
            </Section>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {gallery.map(item => {
                const extras: string[] = (item.images || []).map((img: any) =>
                  typeof img === 'string' ? img : img.url
                );
                return (
                  <Section key={item.id}>
                    <div
                      onClick={() => setSelected(item)}
                      className="cursor-pointer bg-white/[0.02] rounded-2xl sm:rounded-[2.5rem] border border-white/5 overflow-hidden active:border-indigo-500/30 transition-all touch-manipulation"
                    >
                      <div className="aspect-video relative overflow-hidden bg-white/5">
                        <img
                          src={item.url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />
                        {/* Overlay sempre visível no mobile, hover no desktop */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent flex items-end p-4 sm:opacity-0 sm:hover:opacity-100 sm:transition-opacity">
                          <span className="text-white text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
                            Ver projeto <ExternalLink size={12} />
                          </span>
                        </div>
                        {extras.length > 0 && (
                          <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 rounded-full text-xs font-bold text-white">
                            {1 + extras.length} fotos
                          </div>
                        )}
                      </div>
                      <div className="p-4 sm:p-6">
                        <h3 className="font-bold text-white text-base sm:text-lg tracking-tight mb-1">{item.title}</h3>
                        {item.description && (
                          <p className="text-slate-500 text-xs sm:text-sm line-clamp-2">{item.description}</p>
                        )}
                      </div>
                    </div>
                  </Section>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── CONTATO ──────────────────────────────────────────────────────── */}
      <section id="contato" className="py-20 sm:py-28 lg:py-32 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <Section className="text-center mb-10 sm:mb-14 lg:mb-16">
            <span className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 block">Vamos conversar</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white tracking-tighter mb-4 sm:mb-6 leading-tight">
              {content.contact_title}
            </h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto">{content.contact_subtitle}</p>
          </Section>

          <Section>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-10 lg:mb-12">
              {[
                { href: `mailto:${content.contact_email}`, icon: <Mail size={20} />, label: 'E-mail', value: content.contact_email },
                { href: content.contact_instagram_url, icon: <Instagram size={20} />, label: 'Instagram', value: content.contact_instagram },
                { href: content.contact_github_url, icon: <Github size={20} />, label: 'GitHub', value: content.contact_github },
              ].map(item => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group p-4 sm:p-6 bg-white/[0.02] border border-white/5 rounded-2xl sm:rounded-3xl flex items-center gap-3 sm:gap-4 hover:border-indigo-500/30 active:border-indigo-500/40 hover:bg-indigo-500/5 active:bg-indigo-500/5 transition-all touch-manipulation"
                >
                  <div className="p-2.5 sm:p-3 bg-indigo-500/10 text-indigo-400 rounded-xl sm:rounded-2xl shrink-0">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{item.label}</p>
                    <p className="text-white font-bold text-sm truncate">{item.value}</p>
                  </div>
                </a>
              ))}
            </div>

            <div className="p-7 sm:p-10 bg-gradient-to-br from-indigo-600/20 to-purple-600/10 rounded-2xl sm:rounded-[3rem] border border-indigo-500/20 text-center">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">Pronto para começar?</h3>
              <p className="text-slate-400 mb-6 sm:mb-8 text-sm sm:text-base">Entre em contato e receba um orçamento personalizado sem compromisso.</p>
              <a
                href={`mailto:${content.contact_email}`}
                className="inline-flex items-center gap-2 px-7 sm:px-8 py-3.5 sm:py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 active:bg-indigo-700 transition-all shadow-2xl shadow-indigo-500/30 touch-manipulation"
              >
                {content.contact_cta} <ArrowRight size={18} />
              </a>
            </div>
          </Section>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="py-8 sm:py-10 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <span className="text-xl font-display font-bold tracking-tighter text-white">
            NIKLAUS<span className="text-indigo-500">.</span>
          </span>
          <p className="text-slate-600 text-sm text-center">© {new Date().getFullYear()} {content.footer_text}</p>
          <button
            onClick={() => navigate('/login')}
            className="text-xs text-slate-700 hover:text-slate-500 transition-colors flex items-center gap-1 touch-manipulation"
          >
            <Shield size={12} /> Área administrativa
          </button>
        </div>
      </footer>

      {/* ── LIGHTBOX ─────────────────────────────────────────────────────── */}
      {selected && <Lightbox item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
