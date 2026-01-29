
import React, { useState } from 'react';
import { useStore } from '../store';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { FileText, Coins, Receipt, Printer, Stethoscope, Activity, BarChart3, Calendar, Pill, Beaker, ClipboardCheck, TrendingUp, BriefcaseMedical } from 'lucide-react';

const Reports: React.FC = () => {
  const { visits, inventory, patients, expenses, currentUser } = useStore();
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  const targetDateStr = new Date(filterDate).toDateString();

  const visitsOnDate = visits.filter(v => new Date(v.date).toDateString() === targetDateStr);
  const completedVisits = visitsOnDate.filter(v => v.status === 'Completed' && v.patientId !== 'OTC-CUSTOMER');

  const consultationRevenue = completedVisits.reduce((acc, v) => acc + (v.consultationFee || 20000), 0);
  const labRevenue = completedVisits.reduce((acc, v) => acc + (v.labRequests?.reduce((a, b) => a + b.price, 0) || 0), 0);
  const pharmacyRevenue = completedVisits.reduce((acc, v) => acc + (v.prescription?.reduce((a, b) => a + b.price, 0) || 0), 0);
  const procedureRevenue = completedVisits.reduce((acc, v) => acc + (v.additionalCharges?.reduce((a, b) => a + b.amount, 0) || 0), 0);
  
  const otcRevenue = visitsOnDate
    .filter(v => v.patientId === 'OTC-CUSTOMER' && v.status === 'Completed')
    .reduce((acc, v) => acc + (v.prescription?.reduce((a, b) => a + b.price, 0) || 0), 0);

  const totalRevenue = consultationRevenue + labRevenue + pharmacyRevenue + procedureRevenue + otcRevenue;
  const expensesOnDate = expenses.filter(e => new Date(e.date).toDateString() === targetDateStr);
  const totalExpenses = expensesOnDate.reduce((acc, ex) => acc + ex.amount, 0);

  const formatCurrency = (amount: number) => `UGX ${amount.toLocaleString()}`;

  const pieData = [
    { name: 'Consult', value: consultationRevenue, color: '#3b82f6' },
    { name: 'Lab', value: labRevenue, color: '#a855f7' },
    { name: 'Pharma', value: pharmacyRevenue + otcRevenue, color: '#10b981' },
    { name: 'Proc', value: procedureRevenue, color: '#f59e0b' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md">
            <BarChart3 size={24} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter leading-none">Facility Audit</h2>
            <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-1 opacity-70">Daily Financial Insight</p>
          </div>
        </div>
        <div className="flex gap-2">
           <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="px-3 py-2 border rounded-lg text-[10px] font-black uppercase bg-slate-50 outline-none" />
           <button onClick={() => window.print()} className="px-5 py-2 bg-slate-900 text-white rounded-lg font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 transition-all">
             <Printer size={14} /> Print
           </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
         {[
           { label: 'Total Revenue', value: formatCurrency(totalRevenue), color: 'text-slate-900' },
           { label: 'Consultations', value: `${completedVisits.length} Cases`, color: 'text-blue-600' },
           { label: 'Daily Expenses', value: formatCurrency(totalExpenses), color: 'text-rose-500' },
           { label: 'Net Surplus', value: formatCurrency(totalRevenue - totalExpenses), color: 'text-emerald-600' }
         ].map((stat, i) => (
           <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className={`text-lg font-black tracking-tighter ${stat.color}`}>{stat.value}</p>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
         <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-xs font-black mb-4 uppercase tracking-widest flex items-center gap-2"><Coins size={16} className="text-emerald-500"/> Revenue Split</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie data={pieData} innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{fontSize: '10px'}} />
                    <Legend iconSize={8} wrapperStyle={{fontSize: '10px'}} />
                 </PieChart>
              </ResponsiveContainer>
            </div>
         </div>
         <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col justify-center">
            <h3 className="text-xs font-black mb-6 uppercase tracking-widest flex items-center gap-2"><ClipboardCheck size={16} className="text-blue-500"/> Performance</h3>
            <div className="space-y-3">
               {[
                 { label: 'Average Ticket', val: formatCurrency(totalRevenue / (completedVisits.length || 1)) },
                 { label: 'Lab Conversion', val: `${Math.round((visitsOnDate.length / (completedVisits.length || 1)) * 100)}%` }
               ].map((item, i) => (
                 <div key={i} className="flex justify-between items-center p-3 border rounded-lg bg-slate-50">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                    <span className="text-xs font-black text-slate-900">{item.val}</span>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default Reports;
