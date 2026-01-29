
import React, { useState } from 'react';
import { useStore } from '../store';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
// Added BarChart3 to imports to avoid conflict with recharts BarChart
import { FileText, Download, Filter, Coins, Receipt, ArrowUpCircle, ArrowDownCircle, Wallet, Printer, Stethoscope, Activity, CreditCard, Share2, BarChart3 } from 'lucide-react';

const Reports: React.FC = () => {
  const { visits, inventory, patients, expenses, currentUser } = useStore();
  const todayStr = new Date().toDateString();

  // Financial Logic
  const visitsToday = visits.filter(v => new Date(v.date).toDateString() === todayStr);
  const completedVisitsToday = visitsToday.filter(v => v.status === 'Completed');

  const dailyRevenue = completedVisitsToday.reduce((acc, v) => acc + (
    (v.consultationFee || 20000) + 
    (v.labRequests?.reduce((a, b) => a + b.price, 0) || 0) +
    (v.prescription?.reduce((a, b) => a + b.price, 0) || 0) +
    (v.additionalCharges?.reduce((a, b) => a + b.amount, 0) || 0)
  ), 0);

  const expensesToday = expenses.filter(e => new Date(e.date).toDateString() === todayStr);
  const dailyExpensesTotal = expensesToday.reduce((acc, ex) => acc + ex.amount, 0);
  const dailyNetProfit = dailyRevenue - dailyExpensesTotal;

  const handleDownloadPDF = () => {
    window.print();
  };

  const formatCurrency = (amt: number) => `UGX ${amt.toLocaleString()}`;

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 items-center print:hidden">
        <div className="flex items-center gap-6 flex-1 w-full">
          <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-blue-200">
            {/* Use BarChart3 icon instead of BarChart to avoid type conflict with recharts */}
            <BarChart3 size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none mb-1">Facility Intelligence</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time Financial & Operational Oversight</p>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={handleDownloadPDF}
            className="flex-1 md:flex-none px-10 py-5 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-blue-600 active:scale-95 transition-all"
          >
            <Download size={20} /> Generate & Download PDF Report
          </button>
        </div>
      </div>

      <div id="daily-report-document" className="space-y-10 print:p-0">
        {/* Professional Document Header (Hidden in Web, Visible in PDF) */}
        <div className="hidden print:flex flex-col mb-12 border-b-8 border-slate-900 pb-12">
           <div className="flex justify-between items-start mb-10">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white">
                  <Stethoscope size={44} />
                </div>
                <div>
                  <h1 className="text-5xl font-black uppercase tracking-tighter leading-none">DOCTORS CLINIC</h1>
                  <p className="text-sm font-black text-blue-600 uppercase tracking-[0.4em] mt-3">Medical Center Tula • Daily Facility Audit</p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-slate-900 text-white px-6 py-3 rounded-xl inline-block mb-4">
                  <p className="text-[10px] font-black uppercase tracking-widest">Official Report</p>
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Generated: {new Date().toLocaleString('en-GB')}</p>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Officer: {currentUser?.fullName}</p>
              </div>
           </div>
           <div className="grid grid-cols-4 gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <div className="text-center border-r border-slate-200">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Visits Today</p>
                <p className="text-xl font-black">{visitsToday.length}</p>
              </div>
              <div className="text-center border-r border-slate-200">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">New Patients</p>
                <p className="text-xl font-black">{patients.filter(p => new Date(p.createdAt).toDateString() === todayStr).length}</p>
              </div>
              <div className="text-center border-r border-slate-200">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Revenue Status</p>
                <p className="text-xl font-black text-emerald-600">Healthy</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Audit Type</p>
                <p className="text-xl font-black uppercase">Daily</p>
              </div>
           </div>
        </div>

        {/* Financial Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-[2rem] border-2 border-slate-50 shadow-sm flex flex-col justify-between h-48">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><ArrowUpCircle size={18} /></div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gross Revenue</h4>
            </div>
            <p className="text-4xl font-black text-emerald-600 tracking-tighter">{formatCurrency(dailyRevenue)}</p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] border-2 border-slate-50 shadow-sm flex flex-col justify-between h-48">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><ArrowDownCircle size={18} /></div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Expenditure</h4>
            </div>
            <p className="text-4xl font-black text-rose-600 tracking-tighter">{formatCurrency(dailyExpensesTotal)}</p>
          </div>
          <div className="bg-slate-900 p-8 rounded-[2rem] shadow-2xl shadow-slate-200 flex flex-col justify-between h-48">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg"><Wallet size={18} /></div>
              <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Net Position</h4>
            </div>
            <p className="text-4xl font-black text-white tracking-tighter">{formatCurrency(dailyNetProfit)}</p>
          </div>
        </div>

        {/* Detailed Metrics Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-12 rounded-[2.5rem] border border-slate-200 shadow-sm">
             <h3 className="text-2xl font-black mb-10 text-slate-800 uppercase tracking-tighter border-b pb-6 flex items-center gap-4">
               <Activity size={24} className="text-blue-500" /> Operational Audit
             </h3>
             <div className="space-y-1">
                <div className="flex justify-between py-6 border-b border-slate-50">
                   <span className="font-bold text-slate-500 uppercase text-xs tracking-widest">New Patient Registrations</span>
                   <span className="font-black text-slate-900 text-xl">{patients.filter(p => new Date(p.createdAt).toDateString() === todayStr).length}</span>
                </div>
                <div className="flex justify-between py-6 border-b border-slate-50">
                   <span className="font-bold text-slate-500 uppercase text-xs tracking-widest">Sessions Initiated (All Depts)</span>
                   <span className="font-black text-slate-900 text-xl">{visitsToday.length}</span>
                </div>
                <div className="flex justify-between py-6 border-b border-slate-50">
                   <span className="font-bold text-slate-500 uppercase text-xs tracking-widest">Sessions Finalized & Billed</span>
                   <span className="font-black text-emerald-600 text-xl">{completedVisitsToday.length}</span>
                </div>
                <div className="flex justify-between py-6">
                   <span className="font-bold text-slate-500 uppercase text-xs tracking-widest">Pharmacy Prescriptions Filled</span>
                   <span className="font-black text-slate-900 text-xl">{visitsToday.reduce((a, b) => a + (b.prescription?.length || 0), 0)}</span>
                </div>
             </div>
          </div>

          <div className="bg-white p-12 rounded-[2.5rem] border border-slate-200 shadow-sm">
             <h3 className="text-2xl font-black mb-10 text-slate-800 uppercase tracking-tighter border-b pb-6 flex items-center gap-4">
               <CreditCard size={24} className="text-emerald-500" /> Revenue Distribution
             </h3>
             <div className="space-y-1">
                <div className="flex justify-between py-6 border-b border-slate-50">
                   <span className="font-bold text-slate-500 uppercase text-xs tracking-widest">Consultation & Facility Entry</span>
                   <span className="font-black text-slate-900 text-xl">{formatCurrency(completedVisitsToday.reduce((a, b) => a + (b.consultationFee || 20000), 0))}</span>
                </div>
                <div className="flex justify-between py-6 border-b border-slate-50">
                   <span className="font-bold text-slate-500 uppercase text-xs tracking-widest">Pharmacotherapy (Dispensing)</span>
                   <span className="font-black text-slate-900 text-xl">{formatCurrency(completedVisitsToday.reduce((a, b) => a + (b.prescription?.reduce((pa, pb) => pa + pb.price, 0) || 0), 0))}</span>
                </div>
                <div className="flex justify-between py-6 border-b border-slate-50">
                   <span className="font-bold text-slate-500 uppercase text-xs tracking-widest">Laboratory Diagnostics</span>
                   <span className="font-black text-slate-900 text-xl">{formatCurrency(completedVisitsToday.reduce((a, b) => a + (b.labRequests?.reduce((la, lb) => la + lb.price, 0) || 0), 0))}</span>
                </div>
                <div className="flex justify-between py-6">
                   <span className="font-bold text-slate-500 uppercase text-xs tracking-widest">Sundry & Minor Procedures</span>
                   <span className="font-black text-slate-900 text-xl">{formatCurrency(completedVisitsToday.reduce((a, b) => a + (b.additionalCharges?.reduce((aa, ab) => aa + ab.amount, 0) || 0), 0))}</span>
                </div>
             </div>
          </div>
        </div>

        {/* Expenses List */}
        <div className="bg-white p-12 rounded-[3rem] border-2 border-slate-50 shadow-sm print:shadow-none print:border-slate-200">
          <div className="flex justify-between items-center mb-10 border-b pb-6">
            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Daily Expenditure Ledger</h3>
            <span className="px-5 py-2 bg-rose-50 text-rose-600 rounded-full font-black text-[10px] uppercase tracking-widest">Audit Total: {formatCurrency(dailyExpensesTotal)}</span>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] border-b">
                <th className="py-6 px-4">Expense Description</th>
                <th className="py-6 px-4">Allocation Category</th>
                <th className="py-6 px-4 text-right">Debit Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {expensesToday.map(ex => (
                <tr key={ex.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-6 px-4 font-bold text-slate-700">{ex.description}</td>
                  <td className="py-6 px-4 uppercase text-[10px] text-slate-400 font-black tracking-widest">{ex.category}</td>
                  <td className="py-6 px-4 text-right font-black text-rose-600 text-lg">{formatCurrency(ex.amount)}</td>
                </tr>
              ))}
              {expensesToday.length === 0 && (
                <tr><td colSpan={3} className="py-20 text-center italic text-slate-300 font-medium">No facility expenditures recorded for today.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer Audit Note */}
        <div className="pt-20 text-center border-t border-dashed border-slate-200">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em] mb-4">Official Document • Doctors Clinic Medical Center Tula</p>
          <div className="flex justify-center gap-20 mt-12 print:flex">
             <div className="w-48 border-t-2 border-slate-900 pt-4">
                <p className="text-[9px] font-black uppercase tracking-widest">Sign: Facility Head</p>
             </div>
             <div className="w-48 border-t-2 border-slate-900 pt-4">
                <p className="text-[9px] font-black uppercase tracking-widest">Sign: Finance Dept</p>
             </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          aside, header, .print\\:hidden, button { display: none !important; }
          main { margin: 0 !important; padding: 0 !important; width: 100% !important; background: white !important; overflow: visible !important; }
          #root { display: block !important; }
          #daily-report-document { 
            display: block !important; 
            width: 100%; 
            padding: 0;
            background: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .rounded-[2.5rem], .rounded-[3rem], .rounded-[2rem] { border-radius: 1rem !important; }
          .bg-slate-900 { background-color: #0f172a !important; color: white !important; }
          .text-emerald-600 { color: #059669 !important; }
          .text-rose-600 { color: #e11d48 !important; }
          .text-blue-600 { color: #2563eb !important; }
        }
      `}</style>
    </div>
  );
};

export default Reports;
