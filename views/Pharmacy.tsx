
import React, { useState } from 'react';
import { useStore } from '../store';
// Added CheckCircle to imports
import { Pill, X, FileText, PlusCircle, Minus, Plus, Stethoscope, Printer, Receipt, Trash2, Coins, Search, CheckCircle } from 'lucide-react';

const Pharmacy: React.FC = () => {
  const { visits, patients, inventory, updateVisit, sellInventoryItem, addNotification } = useStore();
  const [otcMode, setOtcMode] = useState(false);
  const [otcCart, setOtcCart] = useState<{itemId: string, name: string, qty: number, price: number, dosage: string, route: string}[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [chargeDesc, setChargeDesc] = useState('');
  const [chargeAmt, setChargeAmt] = useState('');

  const pendingVisits = visits.filter(v => v.patientId !== 'OTC-CUSTOMER' && v.status !== 'Completed');

  const formatCurrency = (amount: number) => `UGX ${amount.toLocaleString()}`;

  const addToCart = (item: any) => {
    const existing = otcCart.find(i => i.itemId === item.id);
    if (existing) {
      setOtcCart(otcCart.map(i => i.itemId === item.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setOtcCart([...otcCart, { itemId: item.id, name: item.name, qty: 1, price: item.price, dosage: item.dosage, route: item.route }]);
    }
  };

  const processOtcSale = async () => {
    if (otcCart.length === 0) return;
    try {
      for (const item of otcCart) {
        // Updated call to match store implementation or logic
        await sellInventoryItem(item.itemId, item.qty, customerName || 'Walk-in');
      }
      setOtcCart([]);
      setCustomerName('');
      setOtcMode(false);
      addNotification("Direct OTC Sale finalized and stock updated.");
    } catch (e) {
      addNotification("OTC Sale failed. Check stock levels.", "error");
    }
  };

  const getProfile = (id: string) => {
    const visit = visits.find(v => v.id === id);
    const patient = patients.find(p => p.id === visit?.patientId);
    return { visit, patient };
  };

  const current = selectedVisitId ? getProfile(selectedVisitId) : null;

  const handleUpdateBill = async () => {
    if (!current?.visit || !chargeDesc || !chargeAmt) return;
    const newCharge = { description: chargeDesc, amount: parseFloat(chargeAmt) };
    const updatedCharges = [...(current.visit.additionalCharges || []), newCharge];
    await updateVisit(current.visit.id, { additionalCharges: updatedCharges });
    setChargeDesc('');
    setChargeAmt('');
    addNotification("Bill updated with additional service.");
  };

  const removeItem = async (index: number) => {
    if (!current?.visit) return;
    const updated = current.visit.additionalCharges?.filter((_, i) => i !== index);
    await updateVisit(current.visit.id, { additionalCharges: updated });
  };

  const finalizePayment = async () => {
    if (!current?.visit) return;
    await updateVisit(current.visit.id, { status: 'Completed' });
    setSelectedVisitId(null);
    addNotification("Payment confirmed and visit closed.");
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white p-10 rounded-[2rem] border shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Billing Station</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Official Revenue & Disbursement Portal</p>
        </div>
        <button onClick={() => setOtcMode(true)} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-blue-200">
          <PlusCircle size={18} /> New Direct Stock Sale
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {pendingVisits.map(visit => {
          const patient = patients.find(p => p.id === visit.patientId);
          return (
            <div key={visit.id} className="bg-white rounded-3xl border p-8 flex justify-between items-center shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-2xl">{patient?.firstName[0]}</div>
                <div>
                  <h3 className="font-black text-slate-900 text-xl uppercase tracking-tighter">{patient?.firstName} {patient?.lastName}</h3>
                  <div className="flex gap-4 mt-2">
                     <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">SESS: {visit.id.slice(-6)}</span>
                     <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-100">{visit.status.replace('-', ' ')}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedVisitId(visit.id)} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-blue-600 transition-all">
                <FileText size={16} /> Generate Invoice & Finalize
              </button>
            </div>
          );
        })}
      </div>

      {otcMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col h-[85vh]">
            <div className="p-8 border-b flex justify-between items-center bg-blue-600 text-white">
              <h3 className="text-xl font-black uppercase tracking-tighter">Direct Point of Sale</h3>
              <button onClick={() => setOtcMode(false)} className="p-2"><X size={24} /></button>
            </div>
            <div className="flex-1 flex overflow-hidden">
              <div className="w-1/2 p-8 overflow-y-auto bg-white border-r">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Available Dispensary Inventory</p>
                <div className="space-y-3">
                  {inventory.filter(i => i.stock > 0).map(item => (
                    <div key={item.id} onClick={() => addToCart(item)} className="p-5 border-2 border-slate-50 rounded-2xl flex justify-between items-center hover:border-blue-500 cursor-pointer group transition-all">
                      <div><p className="font-black text-slate-800 uppercase text-sm group-hover:text-blue-600">{item.name}</p><p className="text-[10px] font-bold text-slate-400 uppercase">{item.dosage} • {item.route}</p></div>
                      <div className="text-right">
                        <p className="font-black text-blue-600">{formatCurrency(item.price)}</p>
                        <p className="text-[9px] font-black text-slate-300 uppercase">Stock: {item.stock}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-1/2 p-8 bg-slate-50 flex flex-col">
                <div className="mb-6"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Customer Details</label><input className="w-full p-4 border rounded-2xl font-bold bg-white outline-none focus:ring-2 focus:ring-blue-500 mt-2" placeholder="e.g. John Doe (Walk-in)" value={customerName} onChange={e => setCustomerName(e.target.value)} /></div>
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                  {otcCart.map(i => (
                    <div key={i.itemId} className="bg-white p-4 rounded-2xl border flex justify-between items-center shadow-sm">
                      <div className="flex items-center gap-4">
                        <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center font-black text-blue-600 text-xs">{i.qty}</span>
                        <div><p className="font-black text-xs uppercase text-slate-800">{i.name}</p><p className="text-[9px] font-bold text-slate-400">{i.dosage}</p></div>
                      </div>
                      <span className="font-black text-sm text-slate-900">{formatCurrency(i.qty * i.price)}</span>
                    </div>
                  ))}
                  {otcCart.length === 0 && <div className="text-center py-20 opacity-20"><Search size={48} className="mx-auto mb-2"/><p className="font-black uppercase text-[10px]">Cart is empty</p></div>}
                </div>
                <div className="mt-8 border-t-4 border-slate-200 pt-6">
                  <div className="flex justify-between text-2xl font-black text-slate-900 mb-8 uppercase tracking-tighter"><span>Total Due:</span><span className="text-blue-600">{formatCurrency(otcCart.reduce((a, b) => a + (b.qty * b.price), 0))}</span></div>
                  <button onClick={processOtcSale} disabled={otcCart.length === 0} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl disabled:opacity-50 hover:bg-emerald-700 active:scale-95 transition-all">Receive Payment & Finalize</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedVisitId && current && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[3rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
            <div className="p-8 border-b flex justify-between items-center bg-slate-50 print:hidden">
              <h3 className="text-xl font-black uppercase tracking-tighter">Official Facility Invoice</h3>
              <div className="flex gap-3">
                <button onClick={() => window.print()} className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 shadow-sm"><Printer size={16} /> Print Template</button>
                <button onClick={() => setSelectedVisitId(null)} className="p-3 text-slate-300 hover:text-slate-600 transition-colors"><X size={28} /></button>
              </div>
            </div>

            <div id="printable-invoice" className="flex-1 overflow-y-auto p-16 space-y-12 bg-white">
              <div className="flex justify-between items-start border-b-8 border-slate-900 pb-10">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-blue-600 rounded-[2.5rem] flex items-center justify-center text-white"><Stethoscope size={40} /></div>
                  <div><h1 className="text-4xl font-black uppercase tracking-tighter leading-none">DOCTORS CLINIC</h1><p className="text-sm font-black text-blue-600 uppercase tracking-[0.4em] mt-2">Medical Center Tula</p></div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">INV NO: #{current.visit?.id.slice(-8)}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">DATE: {new Date(current.visit?.date || '').toLocaleDateString('en-GB')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-12">
                <div><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Billed To:</p><h2 className="text-3xl font-black uppercase tracking-tighter">{current.patient?.firstName} {current.patient?.lastName}</h2><p className="text-sm font-bold text-slate-500 uppercase mt-1">{current.patient?.phone} • {current.patient?.gender}</p></div>
                <div className="text-right"><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Facility Service Note:</p><p className="text-sm font-medium italic text-slate-600">Diagnosis: {current.visit?.diagnosis || 'N/A'}</p></div>
              </div>

              <div className="border-4 border-slate-50 rounded-[2.5rem] overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 uppercase text-[10px] font-black tracking-widest text-slate-400">
                    <tr><th className="px-10 py-6">Service / Item Description</th><th className="px-10 py-6 text-right">Charge (UGX)</th></tr>
                  </thead>
                  <tbody className="divide-y font-bold text-slate-800">
                    <tr><td className="px-10 py-6">Standard Consultation & Facility Entry</td><td className="px-10 py-6 text-right font-black">{formatCurrency(current.visit?.consultationFee || 20000)}</td></tr>
                    {current.visit?.labRequests?.map(l => (
                      <tr key={l.id} className="text-slate-600"><td className="px-10 py-6 uppercase">Laboratory: {l.testName} {l.status === 'Completed' ? '✓' : '(Pending)'}</td><td className="px-10 py-6 text-right">{formatCurrency(l.price)}</td></tr>
                    ))}
                    {current.visit?.prescription?.map((m, idx) => (
                      <tr key={idx} className="text-slate-600"><td className="px-10 py-6 uppercase">Pharmacy: {m.medicineName} ({m.dosage})</td><td className="px-10 py-6 text-right">{formatCurrency(m.price)}</td></tr>
                    ))}
                    {current.visit?.additionalCharges?.map((c, i) => (
                      <tr key={i} className="text-blue-700 bg-blue-50/20 group">
                        <td className="px-10 py-6 uppercase">{c.description}</td>
                        <td className="px-10 py-6 text-right flex items-center justify-end gap-3">
                          {formatCurrency(c.amount)}
                          <button onClick={() => removeItem(i)} className="print:hidden p-2 text-rose-300 hover:text-rose-600 transition-colors"><Trash2 size={16}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-900 text-white font-black">
                    <tr><td className="px-10 py-10 text-2xl uppercase tracking-tighter">Grand Total Due:</td><td className="px-10 py-10 text-4xl text-right tracking-tighter">
                      {formatCurrency(
                        (current.visit?.consultationFee || 20000) +
                        (current.visit?.labRequests?.reduce((a, b) => a + b.price, 0) || 0) +
                        (current.visit?.prescription?.reduce((a, b) => a + b.price, 0) || 0) +
                        (current.visit?.additionalCharges?.reduce((a, b) => a + b.amount, 0) || 0)
                      )}
                    </td></tr>
                  </tfoot>
                </table>
              </div>
              <div className="pt-10 text-center"><p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">Thank you for choosing Doctors Clinic Medical Center Tula</p></div>
            </div>

            <div className="p-10 bg-slate-50 border-t flex flex-col gap-6 print:hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="col-span-1 space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Detail</label><div className="relative"><Receipt className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16}/><input placeholder="e.g. Scanning, Minor Surgery" className="w-full pl-10 pr-4 py-3 border rounded-xl font-bold bg-white" value={chargeDesc} onChange={e => setChargeDesc(e.target.value)} /></div></div>
                <div className="col-span-1 space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount (UGX)</label><div className="relative"><Coins className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16}/><input type="number" placeholder="0" className="w-full pl-10 pr-4 py-3 border rounded-xl font-bold bg-white" value={chargeAmt} onChange={e => setChargeAmt(e.target.value)} /></div></div>
                <button onClick={handleUpdateBill} className="py-4 bg-slate-800 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-blue-600 transition-all">Add to Bill</button>
              </div>
              <button onClick={finalizePayment} className="w-full py-6 bg-emerald-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl shadow-emerald-200 active:scale-95 transition-all flex items-center justify-center gap-3">
                <CheckCircle size={24} /> Confirm Payment & Close Visit
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`@media print { body * { visibility: hidden; } #printable-invoice, #printable-invoice * { visibility: visible; } #printable-invoice { position: fixed; left: 0; top: 0; width: 100%; height: 100%; margin: 0; padding: 1.5cm; z-index: 1000; } }`}</style>
    </div>
  );
};

export default Pharmacy;
