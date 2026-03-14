import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, CreditCard, DollarSign, Search, Filter } from 'lucide-react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from './firebase';
import { Service, Stats } from './types';

const FinanceCard = ({ title, value, subValue, icon, color }: any) => (
  <div className="glass-dark p-8 rounded-[2.5rem] relative overflow-hidden group">
    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-700" />
    <div className="flex justify-between items-start mb-6 relative z-10">
      <div className={`p-4 rounded-2xl ${color} bg-opacity-20`}>
        {React.cloneElement(icon, { className: color.replace('bg-', 'text-'), size: 24 })}
      </div>
    </div>
    <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2 relative z-10">{title}</h3>
    <p className="text-3xl font-display font-bold text-white tracking-tight relative z-10">{value}</p>
    {subValue && <p className="text-sm text-slate-400 mt-2 relative z-10">{subValue}</p>}
  </div>
);

export default function AdminFinance() {
  const [services, setServices] = useState<Service[]>([]);
  const [stats, setStats]       = useState<Stats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function load() {
      const snap = await getDocs(query(collection(db, 'services'), orderBy('created_at', 'desc')));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Service));
      setServices(data);

      const clientSnap = await getDocs(collection(db, 'clients'));
      const total    = data.reduce((a, s) => a + (s.total_value || 0), 0);
      const paid     = data.reduce((a, s) => a + (s.paid_value  || 0), 0);
      setStats({
        clients: clientSnap.size,
        services: data.length,
        finances: { total, paid, remaining: total - paid },
      });
    }
    load();
  }, []);

  const filtered = services.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!stats) return (
    <div className="animate-pulse space-y-8">
      <div className="h-10 w-64 bg-white/5 rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1,2,3].map(i => <div key={i} className="h-44 bg-white/5 rounded-[2.5rem]" />)}
      </div>
    </div>
  );

  const pct = stats.finances.total > 0 ? (stats.finances.paid / stats.finances.total) * 100 : 0;

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold text-white tracking-tighter uppercase">Financeiro</h1>
          <p className="text-slate-500 font-medium">Gestão de capital, recebíveis e projeções.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FinanceCard
          title="Receita Total"
          value={`R$ ${stats.finances.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subValue="Valor total de todos os contratos"
          icon={<TrendingUp size={20} />}
          color="bg-indigo-400"
        />
        <FinanceCard
          title="Capital Realizado"
          value={`R$ ${stats.finances.paid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subValue={`${pct.toFixed(1)}% do total recebido`}
          icon={<DollarSign size={20} />}
          color="bg-emerald-400"
        />
        <FinanceCard
          title="A Receber"
          value={`R$ ${stats.finances.remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subValue="Capital pendente de liquidação"
          icon={<CreditCard size={20} />}
          color="bg-amber-400"
        />
      </div>

      <div className="glass-dark rounded-[3rem] border border-white/5 overflow-hidden">
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row items-center gap-6">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Buscar por projeto ou cliente..."
              className="w-full pl-16 pr-6 py-4 rounded-2xl bg-white/5 border border-white/5 text-white focus:border-indigo-500 outline-none transition-colors"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.01]">
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Projeto / Cliente</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Progresso</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Total</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Pago</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Pendente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center text-slate-600">Nenhum registro encontrado.</td>
                </tr>
              )}
              {filtered.map(service => {
                const progress = service.total_value > 0 ? (service.paid_value / service.total_value) * 100 : 0;
                return (
                  <tr key={service.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-6">
                      <div className="font-bold text-white tracking-tight">{service.name}</div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{service.client_name}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden max-w-[100px]">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="h-full bg-indigo-500 rounded-full"
                          />
                        </div>
                        <span className="text-[10px] font-black text-slate-400">{Math.round(progress)}%</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-bold text-white">
                        R$ {service.total_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-bold text-emerald-400">
                        R$ {service.paid_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="text-sm font-bold text-amber-400">
                        R$ {(service.total_value - service.paid_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
