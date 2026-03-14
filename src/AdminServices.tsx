import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, query
} from 'firebase/firestore';
import { db } from './firebase';
import { Service, Client } from './types';

export default function AdminServices() {
  const [services, setServices]       = useState<Service[]>([]);
  const [clients, setClients]         = useState<Client[]>([]);
  const [showModal, setShowModal]     = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [loading, setLoading]         = useState(false);
  const [formData, setFormData]       = useState({
    client_id: '', client_name: '', name: '', status: 'ongoing', total_value: 0, paid_value: 0,
  });

  useEffect(() => { fetchServices(); fetchClients(); }, []);

  const fetchServices = async () => {
    const snap = await getDocs(query(collection(db, 'services'), orderBy('created_at', 'desc')));
    setServices(snap.docs.map(d => ({ id: d.id, ...d.data() } as Service)));
  };

  const fetchClients = async () => {
    const snap = await getDocs(query(collection(db, 'clients'), orderBy('name', 'asc')));
    setClients(snap.docs.map(d => ({ id: d.id, ...d.data() } as Client)));
  };

  const handleClientChange = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    setFormData(prev => ({ ...prev, client_id: clientId, client_name: client?.name || '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...formData,
      total_value: Number(formData.total_value),
      paid_value: Number(formData.paid_value),
    };
    try {
      if (editingService) {
        await updateDoc(doc(db, 'services', editingService.id), payload);
      } else {
        await addDoc(collection(db, 'services'), {
          ...payload,
          created_at: new Date().toISOString(),
        });
      }
      closeModal();
      fetchServices();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      client_id: service.client_id,
      client_name: service.client_name || '',
      name: service.name,
      status: service.status,
      total_value: service.total_value,
      paid_value: service.paid_value,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este serviço?')) return;
    await deleteDoc(doc(db, 'services', id));
    fetchServices();
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingService(null);
    setFormData({ client_id: '', client_name: '', name: '', status: 'ongoing', total_value: 0, paid_value: 0 });
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-display font-bold text-white tracking-tighter uppercase">Projetos</h1>
          <p className="text-slate-500 font-medium">Acompanhamento de entregas e performance financeira.</p>
        </div>
        <button
          onClick={() => { setEditingService(null); setFormData({ client_id: '', client_name: '', name: '', status: 'ongoing', total_value: 0, paid_value: 0 }); setShowModal(true); }}
          className="bg-white text-black px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-indigo-500 hover:text-white transition-all shadow-xl shadow-white/5 uppercase tracking-widest text-xs"
        >
          <Plus size={20} /> Novo Projeto
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {services.length === 0 && (
          <div className="py-20 text-center text-slate-600">Nenhum projeto cadastrado ainda.</div>
        )}
        {services.map(service => (
          <div
            key={service.id}
            className="bg-white/[0.02] p-10 rounded-[3rem] border border-white/5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-10 group hover:border-white/10 transition-all"
          >
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${
                  service.status === 'finished' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'
                }`}>
                  {service.status === 'finished' ? 'Finalizado' : 'Em Execução'}
                </span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  {new Date(service.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">{service.name}</h3>
              <p className="text-sm text-slate-500 flex items-center gap-2">
                Parceiro: <span className="font-bold text-slate-300 uppercase tracking-widest text-xs">{service.client_name}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 lg:px-12 border-white/5 lg:border-x">
              <div className="text-left lg:text-center">
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">Investimento</p>
                <p className="text-xl font-display font-bold text-white">
                  R$ {service.total_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="text-left lg:text-center">
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">Realizado</p>
                <p className="text-xl font-display font-bold text-emerald-400">
                  R$ {service.paid_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="text-left lg:text-center">
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">Pendente</p>
                <p className="text-xl font-display font-bold text-amber-400">
                  R$ {(service.total_value - service.paid_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleEdit(service)}
                className="p-4 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 rounded-2xl transition-all"
              >
                <Edit2 size={20} />
              </button>
              <button
                onClick={() => handleDelete(service.id)}
                className="p-4 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-2xl transition-all"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#0a0a0a] w-full max-w-md rounded-[3rem] p-10 border border-white/10 shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-white mb-8 tracking-tight">
                {editingService ? 'Ajustar Projeto' : 'Novo Projeto'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Parceiro</label>
                  <select
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer"
                    value={formData.client_id}
                    onChange={e => handleClientChange(e.target.value)}
                  >
                    <option value="" className="bg-[#0a0a0a]">Selecione um cliente</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id} className="bg-[#0a0a0a]">{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Identificação do Projeto</label>
                  <input
                    required
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-indigo-500 transition-colors"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Status Operacional</label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer"
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <option value="ongoing" className="bg-[#0a0a0a]">Em Execução</option>
                    <option value="finished" className="bg-[#0a0a0a]">Finalizado</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Investimento (R$)</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-indigo-500 transition-colors"
                      value={formData.total_value}
                      onChange={e => setFormData({ ...formData, total_value: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Realizado (R$)</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-indigo-500 transition-colors"
                      value={formData.paid_value}
                      onChange={e => setFormData({ ...formData, paid_value: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-6 py-4 rounded-2xl border border-white/10 font-bold text-slate-400 hover:bg-white/5 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-indigo-500 hover:text-white transition-all shadow-xl shadow-white/5 disabled:opacity-60"
                  >
                    {loading ? 'Salvando...' : 'Confirmar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
