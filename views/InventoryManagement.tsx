
import React, { useState } from 'react';
import { useStore } from '../store';
import { InventoryItem } from '../types';
import { Package, Plus, Search, Trash2, Pill, X, Coins, Navigation } from 'lucide-react';

const InventoryManagement: React.FC = () => {
  const { inventory, addInventoryItem, deleteInventoryItem } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: '', category: 'Analgesics', stock: 0, unit: 'Tablets', price: 0, dosage: '', route: 'Oral', expiryDate: ''
  });

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    await addInventoryItem(newItem);
    setIsModalOpen(false);
    setNewItem({ name: '', category: 'Analgesics', stock: 0, unit: 'Tablets', price: 0, dosage: '', route: 'Oral', expiryDate: '' });
  };

  const filtered = inventory.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="bg-white p-10 rounded-[2rem] border shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div><h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none mb-1">Stock Management</h2><p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Doctors Clinic Facility Inventory</p></div>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-8 py-4 rounded-2xl flex items-center gap-2 hover:bg-blue-700 transition-all font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-500/20"><Plus size={18} /> Register New Medicine</button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input type="text" placeholder="Filter medicines or supplies..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-6 py-4 border-2 border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div key={item.id} className="bg-white rounded-[2rem] border p-8 hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all"><Pill size={24} /></div>
              <button onClick={() => deleteInventoryItem(item.id)} className="p-2 text-slate-200 hover:text-rose-600 transition-colors"><Trash2 size={20} /></button>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tighter">{item.name}</h3>
            <div className="flex flex-wrap gap-2 mb-6">
               <span className="px-3 py-1 bg-slate-100 text-[9px] font-black uppercase tracking-widest rounded-full">{item.category}</span>
               <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest rounded-full">{item.dosage}</span>
               <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-full">{item.route}</span>
            </div>
            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-50">
              <div><p className="text-[9px] font-black uppercase text-slate-300 tracking-widest mb-1">Stock Level</p><p className="font-black text-slate-800 text-lg leading-none">{item.stock} <span className="text-[10px] text-slate-400 font-bold">{item.unit}</span></p></div>
              <div><p className="text-[9px] font-black uppercase text-slate-300 tracking-widest mb-1">Unit Price</p><p className="font-black text-blue-600 text-lg leading-none">UGX {item.price.toLocaleString()}</p></div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-8 border-b flex justify-between items-center bg-white">
               <h3 className="text-xl font-black uppercase tracking-tighter">Inventory Enrollment</h3>
               <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-300 hover:text-slate-600"><X size={28} /></button>
            </div>
            <form onSubmit={handleAddItem} className="p-10 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Medicine / Supply Name</label>
                  <input required type="text" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="w-full p-4 border-2 border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" placeholder="e.g. Paracetamol" />
                </div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label><select value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-white outline-none font-bold"><option>Analgesics</option><option>Antibiotics</option><option>Antimalarials</option><option>Supplements</option><option>Supplies</option></select></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admin Route</label><select value={newItem.route} onChange={e => setNewItem({...newItem, route: e.target.value})} className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-white outline-none font-bold"><option>Oral</option><option>IV</option><option>IM</option><option>Topical</option><option>Subcutaneous</option><option>Other</option></select></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dosage Strengh</label><input required type="text" value={newItem.dosage} onChange={e => setNewItem({...newItem, dosage: e.target.value})} className="w-full p-4 border-2 border-slate-100 rounded-2xl outline-none font-bold" placeholder="e.g. 500mg, 1g" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit Price (UGX)</label><input required type="number" value={newItem.price} onChange={e => setNewItem({...newItem, price: parseFloat(e.target.value)})} className="w-full p-4 border-2 border-slate-100 rounded-2xl outline-none font-bold" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Initial Stock</label><input required type="number" value={newItem.stock} onChange={e => setNewItem({...newItem, stock: parseInt(e.target.value)})} className="w-full p-4 border-2 border-slate-100 rounded-2xl outline-none font-bold" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expiry Date</label><input required type="date" value={newItem.expiryDate} onChange={e => setNewItem({...newItem, expiryDate: e.target.value})} className="w-full p-4 border-2 border-slate-100 rounded-2xl outline-none font-bold" /></div>
              </div>
              <div className="pt-8 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest">Discard</button>
                <button type="submit" className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all">Enroll Stock Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;
