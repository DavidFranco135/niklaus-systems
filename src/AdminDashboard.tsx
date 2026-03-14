import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Users, Briefcase, CreditCard,
  Clock, CheckCircle2, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { Stats, Service } from './types';

const StatCard = ({ title, value, icon, color, trend }: any) => (
  <div className="bg-white/[0.03] p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-md">
    <div className="flex justify-between items-start mb-6">
      <div className={`p-4 rounded-2xl ${color} bg-opacity-20`}>
        {React.cloneElement(icon, { className: color.replace('bg-', 'text-'), size: 24 })}
      </div>
      {trend !== undefined && (
        <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black ${trend > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
          {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">{title}</h3>
    <p className="text-3xl font-display font-bold text-white tracking-tight">{value}</p>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [finishedCount, setFinishedCount] = useState(0);

  useEffect(() => {
    async function load() {
      const [clientsSnap, servicesSnap] = await Promise.all([
        getDocs(collection(db, 'clients')),
        getDocs(collection(db, 'services')),
      ]);

      const services = servicesSnap.docs.map(d => d.data() as Service);
      const total    = services.reduce((a, s) => a + (s.total_value || 0), 0);
      const paid     = services.reduce((a, s) => a + (s.paid_value  || 0), 0);
      const finished = services.filter(s => s.status === 'finished').length;

      setFinishedCount(finished);
      setStats({
        clients: clientsSnap.size,
        services: servicesSnap.size,
        finances: { total, paid, remaining: total - paid },
      });
    }
    load();
  }, []);

  if (!stats) return (
    <div className="animate-pulse space-y-8">
      <div className="h-10 w-64 bg-white/5 rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-44 bg-white/5 rounded-[2.5rem]" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-display font-bold text-white tracking-tighter">DASHBOARD</h1>
          <p className="text-slate-500 font-medium">Bem-vindo ao centro de comando Niklaus.</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Status do Sistema</p>
          <div className="flex items-center gap-2 justify-end">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm font-bold text-white">Operacional</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Clientes"  value={stats.clients}  icon={<Users size={20} />}    color="bg-indigo-400" trend={12} />
        <StatCard title="Projetos"  value={stats.services} icon={<Briefcase size={20} />} color="bg-purple-400" trend={5} />
        <StatCard
          title="Receita"
          value={`R$ ${stats.finances.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={<TrendingUp size={20} />}
          color="bg-emerald-400"
          trend={8}
        />
        <StatCard
          title="Pendente"
          value={`R$ ${stats.finances.remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={<CreditCard size={20} />}
          color="bg-amber-400"
          trend={-2}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white/[0.02] p-10 rounded-[3rem] border border-white/5">
          <h3 className="text-xl font-bold text-white mb-8 tracking-tight">Fluxo Financeiro</h3>
          <div className="space-y-10">
            <div>
              <div className="flex justify-between text-sm mb-4">
                <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Capital Realizado</span>
                <span className="font-black text-emerald-400">
                  R$ {stats.finances.paid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.finances.total > 0 ? (stats.finances.paid / stats.finances.total) * 100 : 0}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-4">
                <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Capital Projetado</span>
                <span className="font-black text-indigo-400">
                  R$ {stats.finances.remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.finances.total > 0 ? (stats.finances.remaining / stats.finances.total) * 100 : 0}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-400 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-indigo-600 p-10 rounded-[3rem] shadow-2xl shadow-indigo-600/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <h3 className="text-xl font-bold text-white mb-8 tracking-tight relative z-10">Status Operacional</h3>
          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl border border-white/10">
              <div className="p-3 bg-white/20 rounded-xl text-white"><Clock size={20} /></div>
              <div>
                <p className="text-white font-bold text-lg">{stats.services - finishedCount}</p>
                <p className="text-indigo-100 text-xs font-medium uppercase tracking-widest">Em Desenvolvimento</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl border border-white/10">
              <div className="p-3 bg-white/20 rounded-xl text-white"><CheckCircle2 size={20} /></div>
              <div>
                <p className="text-white font-bold text-lg">{finishedCount}</p>
                <p className="text-indigo-100 text-xs font-medium uppercase tracking-widest">Entregues com Sucesso</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
