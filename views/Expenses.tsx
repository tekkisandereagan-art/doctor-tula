
import React, { useState } from 'react';
import { useStore } from '../store';
import { UserRole, Expense } from '../types';
import { Receipt, Plus, Search, Trash2, Calendar, Coins, Tag, X, FileText } from 'lucide-react';

const Expenses: React.FC = () => {
  const { expenses, addExpense, deleteExpense, currentUser } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    description: '',
    amount: 0,
    category: 'Operational',
    date: new Date().toISOString().split('T')[0]
  });

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newExpense.description && newExpense.amount && newExpense.amount > 0) {
      await addExpense(newExpense);
      setIsModalOpen(false);
      setNewExpense({ description: '', amount: 0, category: 'Operational', date: new Date().toISOString().split('T')[0] });
    }
  };

  const filteredExpenses = expenses.filter(ex => 
    ex.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
    ex.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return `UGX ${amount.toLocaleString()}`;
  };

  const isAdmin = currentUser?.role === UserRole.ADMIN;

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Daily Expenditures</h2>
          <p className="text-slate-500 mt-1">Record and track facility operational costs in UGX.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-rose-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20 font-bold"
        >
          <Plus size={18} />
          Record New Expense
        </button>
      </div>

      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search by description or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Recorded By</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount (UGX)</th>
                {isAdmin && <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map(ex => (
                <tr key={ex.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 text-sm text-slate-500">{new Date(ex.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-800">{ex.description}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-600">
                      {ex.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Tag size={12} /> {ex.staffName || 'Staff'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-black text-rose-600 text-right">
                    {formatCurrency(ex.amount)}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => deleteExpense(ex.id)}
                        className="p-2 text-slate-300 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {filteredExpenses.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center">
               <Receipt size={48} className="text-slate-200 mb-4" />
               <p className="text-slate-400 italic">No expense records found.</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Receipt size={20} className="text-rose-600" />
                Record Daily Expense
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddExpense} className="p-8 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Description</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input 
                    required 
                    type="text" 
                    value={newExpense.description} 
                    onChange={e => setNewExpense({...newExpense, description: e.target.value})} 
                    className="w-full pl-10 pr-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-rose-500" 
                    placeholder="e.g. Utility Bills, Cleaning Supplies" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Amount (UGX)</label>
                  <div className="relative">
                    <Coins className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input 
                      required 
                      type="number" 
                      value={newExpense.amount} 
                      onChange={e => setNewExpense({...newExpense, amount: parseFloat(e.target.value)})} 
                      className="w-full pl-10 pr-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-rose-500 font-bold" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input 
                      required 
                      type="date" 
                      value={newExpense.date} 
                      onChange={e => setNewExpense({...newExpense, date: e.target.value})} 
                      className="w-full pl-10 pr-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-rose-500" 
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Category</label>
                <select 
                  value={newExpense.category} 
                  onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                  className="w-full px-4 py-3 border rounded-xl outline-none bg-white focus:ring-2 focus:ring-rose-500"
                >
                  <option>Operational</option>
                  <option>Utilities</option>
                  <option>Supplies</option>
                  <option>Staff Welfare</option>
                  <option>Maintenance</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 border rounded-xl font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-3 bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-500/20 hover:bg-rose-700 transition-all"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
