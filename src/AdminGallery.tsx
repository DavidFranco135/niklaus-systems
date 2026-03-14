import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Search, Image as ImageIcon, Video, ExternalLink, Edit2 } from 'lucide-react';
import { GalleryItem } from './types';

export default function AdminGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [newItem, setNewItem] = useState<{
    title: string;
    description: string;
    type: 'image' | 'video';
    url: string;
    images: string[];
  }>({ title: '', description: '', type: 'image', url: '', images: [] });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = () => {
    fetch('/api/gallery')
      .then(res => res.json())
      .then(data => setItems(data));
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = isEditing ? `/api/gallery/${currentId}` : '/api/gallery';
    const method = isEditing ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    });
    
    closeModal();
    fetchItems();
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setCurrentId(null);
    setNewItem({ title: '', description: '', type: 'image', url: '', images: [] });
  };

  const openEdit = (item: GalleryItem) => {
    setIsEditing(true);
    setCurrentId(item.id);
    setNewItem({
      title: item.title,
      description: item.description || '',
      type: item.type,
      url: item.url,
      images: item.images?.map(img => img.url) || []
    });
    setShowModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMain: boolean = true) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const uploadPromises = Array.from(files).map(async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      return res.json();
    });

    try {
      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(r => r.success).map(r => r.url);
      
      if (successfulUploads.length > 0) {
        if (isMain) {
          setNewItem(prev => ({ ...prev, url: successfulUploads[0] }));
        } else {
          setNewItem(prev => ({ ...prev, images: [...prev.images, ...successfulUploads] }));
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const removeImage = (url: string) => {
    setNewItem(prev => ({ ...prev, images: prev.images.filter(img => img !== url) }));
  };

  const handleDelete = async (id: number) => {
    if (confirm('Deseja excluir este item?')) {
      await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
      fetchItems();
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-display font-bold text-white tracking-tighter uppercase">Galeria</h1>
          <p className="text-slate-500 font-medium">Curadoria visual do seu ecossistema digital.</p>
        </div>
        <button 
          onClick={() => {
            setIsEditing(false);
            setNewItem({ title: '', description: '', type: 'image', url: '', images: [] });
            setShowModal(true);
          }}
          className="bg-white text-black px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-indigo-500 hover:text-white transition-all shadow-xl shadow-white/5 uppercase tracking-widest text-xs"
        >
          <Plus size={20} /> Adicionar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {items.map((item) => (
          <div key={item.id} className="bg-white/[0.02] rounded-[2.5rem] border border-white/5 overflow-hidden group hover:border-white/10 transition-all">
            <div className="aspect-video relative overflow-hidden bg-white/5">
              {item.type === 'image' ? (
                <img src={item.url} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/20">
                  <Video size={48} />
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                <button 
                  onClick={() => openEdit(item)}
                  className="p-4 bg-indigo-500 text-white rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-500/20"
                >
                  <Edit2 size={20} />
                </button>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-4 bg-rose-500 text-white rounded-2xl hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/20"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
            <div className="p-6 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-white truncate max-w-[150px] tracking-tight">{item.title}</h3>
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] flex items-center gap-2 mt-1">
                  {item.type === 'image' ? <ImageIcon size={12} /> : <Video size={12} />}
                  {item.type}
                </span>
              </div>
              <a href={item.url} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                <ExternalLink size={18} />
              </a>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0a0a0a] w-full max-w-md rounded-[3rem] p-10 border border-white/10 shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-white mb-8 tracking-tight">
              {isEditing ? 'Editar Ativo' : 'Novo Ativo'}
            </h2>
            <form onSubmit={handleAdd} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Título</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-indigo-500 transition-colors"
                  value={newItem.title}
                  onChange={e => setNewItem({...newItem, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Descrição</label>
                <textarea 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-indigo-500 transition-colors min-h-[100px]"
                  value={newItem.description}
                  onChange={e => setNewItem({...newItem, description: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Tipo</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer"
                  value={newItem.type}
                  onChange={e => setNewItem({...newItem, type: e.target.value as any})}
                >
                  <option value="image" className="bg-[#0a0a0a]">Imagem</option>
                  <option value="video" className="bg-[#0a0a0a]">Vídeo</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Capa (URL ou Upload)</label>
                <div className="flex gap-2">
                  <input 
                    required
                    type="text" 
                    placeholder="https://..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-indigo-500 transition-colors"
                    value={newItem.url}
                    onChange={e => setNewItem({...newItem, url: e.target.value})}
                  />
                  <label className="cursor-pointer p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center">
                    <Plus size={20} />
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => handleFileUpload(e, true)}
                      accept={newItem.type === 'image' ? 'image/*' : 'video/*'}
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Mais Fotos</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {newItem.images.map((img, idx) => (
                    <div key={idx} className="aspect-square relative rounded-lg overflow-hidden border border-white/10">
                      <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <button 
                        type="button"
                        onClick={() => removeImage(img)}
                        className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-all"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square cursor-pointer bg-white/5 border border-dashed border-white/20 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:border-white/40 transition-all">
                    <Plus size={20} />
                    <input 
                      type="file" 
                      multiple
                      className="hidden" 
                      onChange={(e) => handleFileUpload(e, false)}
                      accept="image/*"
                    />
                  </label>
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
                  className="flex-1 px-6 py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-indigo-500 hover:text-white transition-all shadow-xl shadow-white/5"
                >
                  Salvar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
