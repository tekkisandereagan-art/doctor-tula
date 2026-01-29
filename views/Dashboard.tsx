
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
      bg: 'bg-blue-50' 
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
      bg: 'bg-emerald-50',
      hide: false
    },
    { 
      label: isReception ? 'Recent Revenue' : 'Today\'s Scheduled', 
      value: isReception 
        ? visits.filter(v => v.status === 'Completed').length
        : appointments.filter(a => a.status === 'Scheduled').length, 
      icon: isReception ? CreditCard : Calendar, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50',
      hide: false
    },
    { 
      label: 'Stock Alerts', 
      value: inventory.filter(i => i.stock < 20).length, 
      icon: Package, 
      color: 'text-rose-600', 
      bg: 'bg-rose-50',
      hide: isReception || isDoctor
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
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Activity size={100} />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight leading-none">Welcome back, {currentUser?.fullName}</h2>
            <p className="text-slate-500 mt-1 font-medium text-xs">
              {isReception 
                ? 'Reception & Pharmacy portal active.' 
                : (isAdmin ? 'System oversight active. UGX billing enabled.' : `Logged in as ${currentUser?.role}.`)}
            </p>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md">
              {currentUser?.role?.replace('_', ' ')}
            </span>
            {(isAdmin || isReception) && (
              <div className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg flex items-center gap-1.5 font-black text-[10px] uppercase tracking-widest border border-emerald-100">
                <TrendingUp size={12} />
                UGX {totalRevenue.toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${filteredStats.length} gap-4`}>
        {filteredStats.map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 hover:shadow-md transition-all">
            <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
              <h3 className="text-xl font-black text-slate-900 leading-none">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold mb-6 flex items-center gap-2 text-slate-800 uppercase tracking-tight">
            <Activity className="text-blue-500" size={16} />
            Weekly Summary
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px'}} 
                />
                <Bar dataKey="visits" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold mb-6 flex items-center gap-2 text-slate-800 uppercase tracking-tight">
            <ClipboardCheck className="text-emerald-500" size={16} />
            Activity Stream
          </h3>
          <div className="space-y-2 flex-1 overflow-y-auto hide-scrollbar max-h-48">
            {visits.slice(0, 5).map(v => (
              <div key={v.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 group cursor-default">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-slate-200">
                    <UserCheck size={14} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-700 leading-tight">Session #{v.id.slice(-4)}</p>
                    <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest">{v.status.replace('-', ' ')}</p>
                  </div>
                </div>
                <span className="text-[8px] font-black text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-100">
                  {new Date(v.date).toLocaleDateString()}
                </span>
              </div>
            ))}
            {visits.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                <p className="text-[10px] text-slate-400 font-medium italic">No recent sessions.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
