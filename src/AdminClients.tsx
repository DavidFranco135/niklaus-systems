import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Mail, Phone, MessageSquare } from 'lucide-react';
import { Client } from './types';

export default function AdminClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({ name: '', contact: '', notes: '' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = () => {
    fetch('/api/clients')
      .then(res => res.json())
      .then(data => setClients(data));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingClient ? `/api/clients/${editingClient.id}` : '/api/clients';
    const method = editingClient ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    setShowModal(false);
    setEditingClient(null);
    setFormData({ name: '', contact: '', notes: '' });
    fetchClients();
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({ name: client.name, contact: client.contact, notes: client.notes });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Deseja excluir este cliente?')) {
      await fetch(`/api/clients/${id}`, { method: 'DELETE' });
      fetchClients();
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold text-white tracking-tighter uppercase">Clientes</h1>
          <p className="text-slate-500 font-medium">Gestão estratégica de parcerias e contatos.</p>
        </div>
        <button 
          onClick={() => {
            setEditingClient(null);
            setFormData({ name: '', contact: '', notes: '' });
            setShowModal(true);
          }}
          className="bg-white text-black px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-indigo-500 hover:text-white transition-all shadow-xl shadow-white/5 uppercase tracking-widest text-xs"
        >
          <Plus size={20} /> Novo Cliente
        </button>
      </div>

      <div className="bg-white/[0.02] rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center gap-6">
          <div className="relative flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="text" 
              placeholder="Localizar cliente por nome ou contato..."
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
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Identificação</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Contato</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Observações</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="font-bold text-white tracking-tight">{client.name}</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Desde {new Date(client.created_at).toLocaleDateString()}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3 text-slate-400">
                      <div className="p-2 bg-white/5 rounded-lg"><Phone size={14} /></div>
                      <span className="text-sm font-medium">{client.contact}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm text-slate-500 truncate max-w-xs font-light italic">{client.notes || 'Sem observações'}</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(client)}
                        className="p-3 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(client.id)}
                        className="p-3 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0a0a0a] w-full max-w-md rounded-[3rem] p-10 border border-white/10 shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-white mb-8 tracking-tight">
              {editingClient ? 'Editar Registro' : 'Novo Registro'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Nome Completo</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-indigo-500 transition-colors"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Contato Estratégico</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-indigo-500 transition-colors"
                  value={formData.contact}
                  onChange={e => setFormData({...formData, contact: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Notas Internas</label>
                <textarea 
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-indigo-500 transition-colors resize-none"
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-4 rounded-2xl border border-white/10 font-bold text-slate-400 hover:bg-white/5 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-6 py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-indigo-500 hover:text-white transition-all shadow-xl shadow-white/5"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
