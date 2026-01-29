import React, { useState } from 'react';
import { useStore } from '../store';
import { User, UserRole } from '../types';
import { UserPlus, Search, Edit2, Trash2, Shield, Building2, UserCircle2, X, MoreVertical, Lock } from 'lucide-react';

const StaffManagement: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, currentUser } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [password, setPassword] = useState('');

  const [newUser, setNewUser] = useState<Partial<User>>({
    fullName: '',
    username: '',
    role: UserRole.DOCTOR,
    department: '',
    active: true
  });

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newUser.fullName && newUser.username && password) {
      await addUser({
        fullName: newUser.fullName!,
        username: newUser.username!,
        role: newUser.role as UserRole,
        department: newUser.department || 'General Practice',
        active: true
      }, password);
      setIsModalOpen(false);
      setNewUser({ role: UserRole.DOCTOR, active: true, fullName: '', username: '', department: '' });
      setPassword('');
    }
  };

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Staff Management</h2>
          <p className="text-slate-500 mt-1">Personnel oversight and facility access control.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 font-bold"
        >
          <UserPlus size={18} />
          Register New Staff
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search staff by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div key={user.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                    <UserCircle2 size={28} />
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => deleteUser(user.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <h3 className="font-bold text-slate-900 text-lg leading-tight">{user.fullName}</h3>
                <p className="text-sm text-slate-500 mb-4 truncate">{user.username}</p>
                
                <div className="space-y-2 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Shield size={14} className="text-blue-500" />
                    <span className="font-semibold uppercase text-[10px] tracking-wider text-slate-400">Role:</span>
                    <span className="font-medium">{user.role}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Building2 size={14} className="text-emerald-500" />
                    <span className="font-semibold uppercase text-[10px] tracking-wider text-slate-400">Dept:</span>
                    <span className="font-medium">{user.department}</span>
                  </div>
                </div>
              </div>
              <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                  user.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                }`}>
                  {user.active ? 'Active' : 'Suspended'}
                </span>
                <p className="text-[10px] text-slate-400 font-bold">ID: {user.id.slice(0, 8)}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <UserCircle2 className="mx-auto text-slate-200 mb-4" size={48} />
            <h3 className="text-lg font-medium text-slate-900">No staff members found</h3>
            <p className="text-slate-500">Add staff records to populate this directory.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">New Staff Registration</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-8 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Full Name</label>
                <input
                  required
                  type="text"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="e.g. Dr. John Smith"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Email Address</label>
                <input
                  required
                  type="email"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="staff@medcore.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Initial Login Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Set staff password"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value as UserRole})}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                  >
                    {Object.values(UserRole).filter(r => r !== UserRole.ADMIN).map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Department</label>
                  <input
                    type="text"
                    value={newUser.department}
                    onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="e.g. Cardiology"
                  />
                </div>
              </div>
              <div className="pt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                >
                  Register Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;