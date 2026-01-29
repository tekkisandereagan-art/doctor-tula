import React from 'react';
import { useStore } from '../store';
import { UserRole } from '../types';
import { 
  Users, 
  Activity, 
  Calendar, 
  ClipboardCheck,
  UserCheck,
  FlaskConical,
  Package,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC = () => {
  const { patients, visits, appointments, inventory, currentUser } = useStore();

  const isAdmin = currentUser?.role === UserRole.ADMIN;
  const isReception = currentUser?.role === UserRole.RECEPTION_PHARMACY;
  const isDoctor = currentUser?.role === UserRole.DOCTOR;

  const stats = [
    { 
      label: 'Total Patients', 
      value: patients.length, 
      icon: Users, 
      color: 'text-blue-600', 
      bg: 'bg-blue-100' 
    },
    { 
      label: isReception ? 'Today\'s Check-ins' : (isAdmin ? 'Pending Lab Tests' : 'Active Consultations'), 
      value: isReception 
        ? visits.filter(v => new Date(v.date).toDateString() === new Date().toDateString()).length
        : (isAdmin 
          ? visits.reduce((acc, v) => acc + (v.labRequests?.filter(r => r.status === 'Pending').length || 0), 0)
          : visits.filter(v => v.status !== 'Completed').length), 
      icon: isReception ? UserCheck : (isAdmin ? FlaskConical : Activity), 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-100',
      hide: false
    },
    { 
      label: isReception ? 'Recent Revenue' : 'Today\'s Scheduled', 
      value: isReception 
        ? visits.filter(v => v.status === 'Completed').length
        : appointments.filter(a => a.status === 'Scheduled').length, 
      icon: isReception ? CreditCard : Calendar, 
      color: 'text-amber-600', 
      bg: 'bg-amber-100',
      hide: false
    },
    { 
      label: 'Stock Alerts', 
      value: inventory.filter(i => i.stock < 20).length, 
      icon: Package, 
      color: 'text-rose-600', 
      bg: 'bg-rose-100',
      hide: isReception || isDoctor // Hidden for both Pharmacy/Reception and Doctors
    },
  ];

  const filteredStats = stats.filter(s => !s.hide);

  const totalRevenue = visits
    .filter(v => v.status === 'Completed')
    .reduce((acc, v) => acc + (v.prescription?.reduce((pAcc, p) => pAcc + (p.dispensed ? p.price : 0), 0) || 0), 0);

  const chartData = [
    { name: 'Mon', visits: 12 },
    { name: 'Tue', visits: 19 },
    { name: 'Wed', visits: 15 },
    { name: 'Thu', visits: 22 },
    { name: 'Fri', visits: 30 },
    { name: 'Sat', visits: 10 },
    { name: 'Sun', visits: 5 },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Activity size={160} />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Welcome, {currentUser?.fullName}</h2>
            <p className="text-slate-500 mt-1 font-medium">
              {isReception 
                ? 'Reception & Pharmacy portal active. UGX billing enabled.' 
                : (isAdmin ? 'System oversight active. Uganda Shilling (UGX) billing enabled.' : `Logged in as ${currentUser?.role} in ${currentUser?.department}.`)}
            </p>
          </div>
          <div className="flex gap-2">
            <span className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">
              {currentUser?.role?.replace('_', ' ')}
            </span>
            {(isAdmin || isReception) && (
              <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl flex items-center gap-2 font-black text-xs uppercase tracking-widest border border-emerald-100">
                <TrendingUp size={14} />
                UGX {totalRevenue.toLocaleString()} Revenue
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${filteredStats.length} gap-4`}>
        {filteredStats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900 leading-none">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold mb-8 flex items-center gap-2 text-slate-800">
            <Activity className="text-blue-500" size={20} />
            Weekly Facility Summary
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} 
                />
                <Bar dataKey="visits" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ClipboardCheck className="text-emerald-500" size={20} />
              Recent Activity Stream
            </h3>
          </div>
          <div className="space-y-4 flex-1">
            {visits.slice(0, 5).map(v => (
              <div key={v.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white hover:shadow-sm transition-all group cursor-default">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-200 shadow-sm group-hover:border-blue-200 transition-colors">
                    <UserCheck size={16} className="text-slate-400 group-hover:text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">Patient Session #{v.id.slice(-4)}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{v.status.replace('-', ' ')}</p>
                  </div>
                </div>
                <span className="text-[10px] font-black text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100">
                  {new Date(v.date).toLocaleDateString()}
                </span>
              </div>
            ))}
            {visits.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                  <Activity size={24} />
                </div>
                <p className="text-sm text-slate-400 font-medium italic">No recent sessions detected.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;