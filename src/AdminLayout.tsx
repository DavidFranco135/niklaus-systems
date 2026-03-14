import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, Briefcase, Image as ImageIcon,
  Settings, LogOut, ChevronLeft, ChevronRight, DollarSign, Globe
} from 'lucide-react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { cn } from './lib/utils';

const Sidebar = ({ expanded, setExpanded }: { expanded: boolean; setExpanded: (v: boolean) => void }) => {
  const { logout } = useAuth();
  const location   = useLocation();
  const navigate   = useNavigate();

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard',      path: '/admin' },
    { icon: <DollarSign size={20} />,       label: 'Financeiro',     path: '/admin/finance' },
    { icon: <ImageIcon size={20} />,         label: 'Galeria',        path: '/admin/gallery' },
    { icon: <Users size={20} />,             label: 'Clientes',       path: '/admin/clients' },
    { icon: <Briefcase size={20} />,         label: 'Serviços',       path: '/admin/services' },
    { icon: <Globe size={20} />,             label: 'Página Pública', path: '/admin/page' },
    { icon: <Settings size={20} />,          label: 'Configurações',  path: '/admin/settings' },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: expanded ? 280 : 88 }}
      className="h-screen bg-[#0a0a0a] border-r border-white/5 flex flex-col sticky top-0 z-40"
    >
      <div className="p-6 flex items-center justify-between mb-8">
        {expanded && (
          <span className="text-xl font-display font-bold tracking-tighter text-white">
            NIKLAUS<span className="text-indigo-500">.</span>
          </span>
        )}
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2.5 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all ml-auto"
        >
          {expanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {menuItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-4 p-4 rounded-2xl transition-all group relative overflow-hidden',
                active
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              )}
            >
              <div className={cn('transition-transform duration-300 shrink-0', active ? 'scale-110' : 'group-hover:scale-110')}>
                {item.icon}
              </div>
              {expanded && <span className="font-bold tracking-tight whitespace-nowrap">{item.label}</span>}
              {active && (
                <motion.div layoutId="active-pill" className="absolute left-0 w-1 h-6 bg-white rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-white/5">
        <button
          onClick={async () => { await logout(); navigate('/'); }}
          className="w-full flex items-center gap-4 p-4 rounded-2xl text-rose-400 hover:bg-rose-500/10 transition-all group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          {expanded && <span className="font-bold tracking-tight">Encerrar Sessão</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default function AdminLayout() {
  const [expanded, setExpanded] = useState(true);
  const { user, isLoading }     = useAuth();
  const navigate                = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) navigate('/login');
  }, [user, isLoading, navigate]);

  if (isLoading || !user) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#050505] text-slate-200">
      <Sidebar expanded={expanded} setExpanded={setExpanded} />
      <main className="flex-1 p-8 md:p-12 overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
