import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Code2, Rocket, Shield, Users, 
  ArrowRight, Github, Linkedin, Mail, MessageSquare,
  Smartphone, Globe, Database, Layout, Folder
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { GalleryItem } from './types';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Início', href: '#home' },
    { name: 'Sobre', href: '#about' },
    { name: 'Serviços', href: '#services' },
    { name: 'Portfólio', href: '#portfolio' },
    { name: 'Contato', href: '#contact' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-black/60 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-2xl font-display font-bold tracking-tighter text-white">NIKLAUS<span className="text-indigo-500">.</span></span>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-slate-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-all hover:tracking-widest"
                >
                  {link.name}
                </a>
              ))}
              <Link to="/login" className="bg-white text-black px-6 py-2 rounded-full text-sm font-bold hover:bg-indigo-500 hover:text-white transition-all shadow-xl shadow-white/5">
                Admin
              </Link>
            </div>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white p-2">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/95 backdrop-blur-2xl border-b border-white/10 overflow-hidden"
          >
            <div className="px-4 pt-4 pb-8 space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-slate-300 hover:text-white block px-4 py-4 text-lg font-medium border-b border-white/5 last:border-0"
                >
                  {link.name}
                </a>
              ))}
              <Link to="/login" className="block w-full text-center bg-indigo-600 text-white px-5 py-4 mt-6 rounded-2xl text-lg font-bold">
                Acesso Admin
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = ({ coverPhoto }: { coverPhoto?: string }) => (
  <section id="home" className="relative pt-32 pb-20 lg:pt-56 lg:pb-40 overflow-hidden">
    {/* Atmospheric Background */}
    <div className="absolute top-0 left-0 w-full h-full -z-10">
      {coverPhoto && (
        <div className="absolute inset-0">
          <img 
            src={coverPhoto} 
            alt="Cover" 
            className="w-full h-full object-cover opacity-50" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />
        </div>
      )}
      <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
    </div>
    
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-xs font-bold tracking-widest uppercase mb-8 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          Sistemas de Próxima Geração
        </div>
        <h1 className="text-6xl md:text-8xl font-display font-bold text-white mb-8 leading-[0.9] tracking-tighter">
          DESIGNING THE <br />
          <span className="text-gradient">FUTURE OF TECH</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
          Arquitetura de software impecável, interfaces imersivas e performance sem precedentes. Elevamos sua visão ao estado da arte digital.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <a href="#portfolio" className="w-full sm:w-auto px-10 py-5 bg-white text-black rounded-2xl font-black hover:bg-indigo-500 hover:text-white transition-all shadow-2xl shadow-white/5 flex items-center justify-center gap-3 group">
            EXPLORAR PROJETOS <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
          </a>
          <a href="#contact" className="w-full sm:w-auto px-10 py-5 bg-white/5 text-white border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all backdrop-blur-md flex items-center justify-center gap-2">
            INICIAR CONSULTORIA
          </a>
        </div>
      </motion.div>
    </div>
  </section>
);

const Services = () => {
  const services = [
    {
      icon: <Smartphone className="text-indigo-400" size={32} />,
      title: 'Mobile Apps',
      desc: 'Experiências mobile fluidas com React Native e Swift, focadas em retenção.'
    },
    {
      icon: <Globe className="text-purple-400" size={32} />,
      title: 'Web Platforms',
      desc: 'Sistemas web de alta performance com Next.js e arquiteturas serverless.'
    },
    {
      icon: <Database className="text-blue-400" size={32} />,
      title: 'Cloud Systems',
      desc: 'Infraestrutura escalável e segura para processamento massivo de dados.'
    },
    {
      icon: <Layout className="text-emerald-400" size={32} />,
      title: 'Product Design',
      desc: 'Design estratégico que une estética minimalista e usabilidade extrema.'
    }
  ];

  return (
    <section id="services" className="py-32 bg-[#080808] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 tracking-tighter">NOSSAS <br />ESPECIALIDADES</h2>
            <p className="text-slate-400 text-lg">Dominamos as tecnologias mais avançadas para entregar resultados que superam expectativas.</p>
          </div>
          <div className="hidden md:block h-px flex-1 bg-white/10 mx-12 mb-6" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((s, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className="p-10 rounded-[2.5rem] border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group"
            >
              <div className="mb-8 p-5 bg-white/5 rounded-3xl w-fit group-hover:scale-110 transition-transform">{s.icon}</div>
              <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">{s.title}</h3>
              <p className="text-slate-500 leading-relaxed font-light">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Portfolio = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    fetch('/api/gallery')
      .then(res => res.json())
      .then(data => setItems(data));
  }, []);

  return (
    <section id="portfolio" className="py-32 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 tracking-tighter uppercase">Showcase</h2>
          <div className="w-24 h-1 bg-indigo-500 mx-auto rounded-full" />
        </div>
        
        {items.length === 0 ? (
          <div className="text-center py-32 bg-white/[0.02] rounded-[3rem] border border-dashed border-white/10">
            <p className="text-slate-500 font-light italic">Aguardando novos lançamentos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {items.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group cursor-pointer"
                onClick={() => setSelectedItem(item)}
              >
                {/* Folder Tab Effect */}
                <div className="flex items-end ml-8">
                  <div className="h-8 w-32 bg-white/5 border-t border-l border-r border-white/10 rounded-t-2xl flex items-center justify-center gap-2">
                    <Folder size={12} className="text-indigo-400" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">PROJETO</span>
                  </div>
                </div>

                <div className="relative aspect-[16/10] overflow-hidden rounded-[2.5rem] rounded-tl-none mb-8 bg-slate-900 border border-white/10 group-hover:border-indigo-500/50 transition-colors shadow-2xl">
                  {item.type === 'image' ? (
                    <img 
                      src={item.url} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Rocket className="text-white/10" size={80} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-12">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center">
                        <ArrowRight size={20} />
                      </div>
                      <span className="text-white font-bold tracking-widest text-sm uppercase">Explorar Case</span>
                    </div>
                  </div>
                </div>

                <div className="px-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-3xl font-display font-bold text-white mb-2 tracking-tight group-hover:text-indigo-400 transition-colors">{item.title}</h3>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                          {item.type}
                        </span>
                        <span className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">
                          {new Date(item.created_at).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {item.description && (
                    <p className="text-slate-400 leading-relaxed font-light line-clamp-2 text-sm">
                      {item.description}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8"
          >
            <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setSelectedItem(null)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-6xl bg-[#0a0a0a] rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl flex flex-col lg:flex-row max-h-[90vh]"
            >
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-6 right-6 z-10 p-4 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all"
              >
                <X size={24} />
              </button>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-12">
                <div className="space-y-8">
                  <div className="aspect-video rounded-[2rem] overflow-hidden bg-white/5">
                    {selectedItem.type === 'image' ? (
                      <img src={selectedItem.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Rocket size={100} className="text-white/10" />
                      </div>
                    )}
                  </div>
                  
                  {selectedItem.images && selectedItem.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedItem.images.map((img) => (
                        <div key={img.id} className="aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/5">
                          <img src={img.url} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full lg:w-[400px] bg-white/[0.02] border-l border-white/5 p-8 lg:p-12 overflow-y-auto custom-scrollbar">
                <div className="space-y-8">
                  <div>
                    <span className="text-indigo-400 font-bold tracking-[0.3em] uppercase text-[10px] mb-2 block">Projeto</span>
                    <h2 className="text-3xl font-display font-bold text-white tracking-tight">{selectedItem.title}</h2>
                  </div>
                  
                  {selectedItem.description && (
                    <div>
                      <span className="text-slate-500 font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Sobre o Projeto</span>
                      <p className="text-slate-400 leading-relaxed font-light whitespace-pre-wrap">
                        {selectedItem.description}
                      </p>
                    </div>
                  )}

                  <div className="pt-8 border-t border-white/5">
                    <button 
                      onClick={() => {
                        setSelectedItem(null);
                        window.location.href = '#contact';
                      }}
                      className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all"
                    >
                      SOLICITAR ORÇAMENTO
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

const Contact = () => (
  <section id="contact" className="py-32 bg-[#080808] border-t border-white/5">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div>
          <h2 className="text-5xl md:text-7xl font-display font-bold text-white mb-8 tracking-tighter">VAMOS <br />CONSTRUIR?</h2>
          <p className="text-slate-400 text-xl mb-12 font-light leading-relaxed">
            Seja um MVP ou uma plataforma global, estamos prontos para o desafio. Entre em contato e transforme sua ideia em código.
          </p>
          <div className="space-y-8">
            <div className="flex items-center gap-6 group">
              <div className="p-5 bg-white/5 rounded-[1.5rem] text-indigo-400 border border-white/5 group-hover:bg-indigo-500 group-hover:text-white transition-all"><Mail size={24} /></div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">E-mail</p>
                <p className="text-white font-medium text-lg">contato@niklaus.tech</p>
              </div>
            </div>
            <div className="flex items-center gap-6 group">
              <div className="p-5 bg-white/5 rounded-[1.5rem] text-emerald-400 border border-white/5 group-hover:bg-emerald-500 group-hover:text-white transition-all"><MessageSquare size={24} /></div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">WhatsApp</p>
                <p className="text-white font-medium text-lg">+55 (11) 99999-9999</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 p-12 rounded-[4rem] backdrop-blur-md">
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">Nome</label>
                <input type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-indigo-500 transition-colors" placeholder="Seu nome" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">Telefone</label>
                <input type="tel" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-indigo-500 transition-colors" placeholder="+55 (11) 99999-9999" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">E-mail</label>
              <input type="email" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-indigo-500 transition-colors" placeholder="seu@email.com" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">Mensagem</label>
              <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-indigo-500 transition-colors resize-none" placeholder="Conte-nos sobre seu projeto" />
            </div>
            <button className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-2xl shadow-white/5">
              Enviar Mensagem
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="py-20 bg-[#050505] border-t border-white/5">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-12">
        <div>
          <span className="text-3xl font-display font-bold text-white tracking-tighter">NIKLAUS<span className="text-indigo-500">.</span></span>
          <p className="text-slate-500 mt-4 text-sm font-light">© 2024 Niklaus Engineering. Crafted with precision.</p>
        </div>
        <div className="flex gap-4">
          {[Github, Linkedin, Mail].map((Icon, i) => (
            <a key={i} href="#" className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
              <Icon size={24} />
            </a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default function LandingPage() {
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data));
  }, []);

  return (
    <div className="min-h-screen selection:bg-indigo-500 selection:text-white">
      <Navbar />
      <Hero coverPhoto={settings.cover_photo} />
      <section id="about" className="py-32 bg-[#050505] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-24">
            <div className="flex-1 relative">
              <div className="relative z-10 rounded-[4rem] overflow-hidden border border-white/10 shadow-2xl">
                <img src="https://picsum.photos/seed/niklaus-dark/1000/1200" alt="About Niklaus" className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-1000" referrerPolicy="no-referrer" />
              </div>
              <div className="absolute -top-12 -left-12 w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px] -z-10" />
            </div>
            <div className="flex-1">
              <span className="text-indigo-400 font-bold tracking-[0.3em] uppercase text-xs mb-6 block">A Vanguarda</span>
              <h2 className="text-5xl md:text-7xl font-display font-bold text-white mb-8 tracking-tighter leading-tight">CÓDIGO QUE <br />RESPIRA DESIGN.</h2>
              <p className="text-slate-400 text-xl mb-10 leading-relaxed font-light">
                Não somos apenas uma software house. Somos um laboratório de inovação onde a estética encontra a funcionalidade bruta. Cada linha de código é escrita com o propósito de criar impacto.
              </p>
              <div className="grid grid-cols-2 gap-12">
                <div>
                  <h4 className="text-5xl font-display font-bold text-white mb-2">50+</h4>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Sistemas Ativos</p>
                </div>
                <div>
                  <h4 className="text-5xl font-display font-bold text-white mb-2">08+</h4>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Países Atendidos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Services />
      <Portfolio />
      <Contact />
      <Footer />
    </div>
  );
}
