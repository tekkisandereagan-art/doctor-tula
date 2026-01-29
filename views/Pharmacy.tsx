
import React, { useState } from 'react';
import { useStore } from '../store';
import { Pill, X, FileText, PlusCircle, Minus, Plus, Stethoscope, Printer, Receipt, Trash2, Coins, Search, CheckCircle, PackageSearch } from 'lucide-react';

const Pharmacy: React.FC = () => {
  const { visits, patients, inventory, updateVisit, sellInventoryItem, addNotification } = useStore();
  const [otcMode, setOtcMode] = useState(false);
  const [otcCart, setOtcCart] = useState<{itemId: string, name: string, qty: number, price: number, dosage: string, route: string}[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [chargeDesc, setChargeDesc] = useState('');
  const [chargeAmt, setChargeAmt] = useState('');
  const [inventorySearch, setInventorySearch] = useState('');

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

  const updateCartQty = (itemId: string, delta: number) => {
    setOtcCart(prev => prev.map(item => {
      if (item.itemId === itemId) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const processOtcSale = async () => {
    if (otcCart.length === 0) return;
    try {
      for (const item of otcCart) {
        await sellInventoryItem(item.itemId, item.qty, customerName || 'Walk-in');
      }
      setOtcCart([]);
      setCustomerName('');
      setOtcMode(false);
      addNotification("OTC Sale complete.");
    } catch (e) {
      addNotification("Sale failed.", "error");
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
    addNotification("Invoice finalized.");
  };

  const filteredInventory = inventory.filter(i => 
    i.stock > 0 && 
    (i.name.toLowerCase().includes(inventorySearch.toLowerCase()) || 
     i.dosage.toLowerCase().includes(inventorySearch.toLowerCase()) || 
     i.route.toLowerCase().includes(inventorySearch.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-1">Billing & Pharmacy</h2>
          <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-1 opacity-70">Revenue & Disbursement</p>
        </div>
        <button onClick={() => setOtcMode(true)} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-md hover:bg-blue-700 transition-all">
          <PlusCircle size={16} /> New OTC Sale
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {pendingVisits.map(visit => {
          const patient = patients.find(p => p.id === visit.patientId);
          return (
            <div key={visit.id} className="bg-white rounded-xl border border-slate-200 p-4 flex justify-between items-center shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black text-lg uppercase group-hover:bg-blue-600">{patient?.firstName[0]}</div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm uppercase tracking-tighter truncate">{patient?.firstName} {patient?.lastName}</h3>
                  <div className="flex gap-2 mt-1">
                     <span className="text-[8px] font-black text-blue-700 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded border border-blue-100">#{visit.id.slice(-4)}</span>
                     <span className="text-[8px] font-black text-amber-700 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded border border-amber-100">{visit.status.replace('-', ' ')}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedVisitId(visit.id)} className="px-5 py-2.5 bg-slate-900 text-white rounded-lg font-black text-[10px] uppercase tracking-widest shadow-sm flex items-center gap-2 hover:bg-blue-600 transition-all">
                <FileText size={14} /> Process Invoice
              </button>
            </div>
          );
        })}
        {pendingVisits.length === 0 && (
          <div className="py-12 text-center bg-white rounded-xl border border-dashed border-slate-200">
             <p className="text-slate-400 font-black uppercase tracking-widest text-[9px]">No pending invoices.</p>
          </div>
        )}
      </div>

      {otcMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col h-[80vh] border">
            <div className="p-5 border-b flex justify-between items-center bg-blue-600 text-white">
              <h3 className="text-lg font-black uppercase tracking-tighter">Direct Stock Sale</h3>
              <button onClick={() => setOtcMode(false)} className="p-2 hover:bg-white/10 rounded-full"><X size={24} /></button>
            </div>
            <div className="flex-1 flex overflow-hidden">
              <div className="w-2/3 p-5 overflow-y-auto bg-white border-r">
                <div className="relative mb-4">
                  <PackageSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input type="text" placeholder="Search stock..." className="w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl outline-none text-xs font-bold" value={inventorySearch} onChange={e => setInventorySearch(e.target.value)} />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {filteredInventory.map(item => (
                    <div key={item.id} onClick={() => addToCart(item)} className="p-3 border rounded-xl flex justify-between items-center hover:border-blue-500 cursor-pointer bg-white group transition-all">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-blue-600"><Pill size={16}/></div>
                        <div>
                          <p className="font-black text-slate-900 uppercase text-[11px]">{item.name}</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase">{item.dosage} • {item.route}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-blue-600 text-sm">{formatCurrency(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-1/3 p-5 bg-slate-50 flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Cart ({otcCart.length})</p>
                  {otcCart.map(i => (
                    <div key={i.itemId} className="bg-white p-3 rounded-lg border flex justify-between items-center shadow-sm">
                      <div className="min-w-0">
                        <p className="font-black text-[10px] uppercase text-slate-800 truncate">{i.name}</p>
                        <p className="text-[10px] font-black text-blue-600">{formatCurrency(i.price * i.qty)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                         <button onClick={() => updateCartQty(i.itemId, -1)} className="p-1 hover:bg-slate-100 rounded text-slate-400"><Minus size={12}/></button>
                         <span className="text-xs font-black w-4 text-center">{i.qty}</span>
                         <button onClick={() => updateCartQty(i.itemId, 1)} className="p-1 hover:bg-slate-100 rounded text-slate-400"><Plus size={12}/></button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="flex justify-between text-lg font-black text-slate-900 mb-4 uppercase tracking-tighter"><span>Total:</span><span className="text-blue-600">{formatCurrency(otcCart.reduce((a, b) => a + (b.qty * b.price), 0))}</span></div>
                  <button onClick={processOtcSale} disabled={otcCart.length === 0} className="w-full py-3 bg-slate-900 text-white rounded-lg font-black uppercase text-[10px] tracking-widest shadow-md">Checkout</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pharmacy;
