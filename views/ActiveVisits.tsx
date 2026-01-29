
import React, { useState } from 'react';
import { useStore } from '../store';
import { UserRole, Visit, InventoryItem } from '../types';
import { 
  Stethoscope, FlaskConical, Pill, Clock, User, HeartPulse, Scale,
  FileText, X, ClipboardList, Activity, Droplets, Syringe, History, 
  Thermometer, Wind, Beaker, PlusCircle, Trash2, CheckSquare, Search
} from 'lucide-react';

const ActiveVisits: React.FC = () => {
  const { visits, patients, currentUser, updateVisit, inventory, addNotification } = useStore();
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [activeTab, setActiveTab] = useState<'subjective' | 'objective' | 'investigations' | 'prescription' | 'nursing' | 'history'>('subjective');
  const [doctorForm, setDoctorForm] = useState<Partial<Visit>>({});
  const [labRequestInput, setLabRequestInput] = useState('');
  const [medSearch, setMedSearch] = useState('');
  const [selectedMed, setSelectedMed] = useState<InventoryItem | null>(null);
  const [prescForm, setPrescForm] = useState({ dosage: '', duration: '', route: '' });
  const [fluidInput, setFluidInput] = useState({ intake: '', output: '', remarks: '' });

  const activeVisits = visits.filter(v => v.status !== 'Completed');

  const openVisit = (visit: Visit) => {
    setSelectedVisit(visit);
    setDoctorForm({
      presentingComplaints: visit.presentingComplaints || '',
      historyOfPresentingComplaints: visit.historyOfPresentingComplaints || '',
      physicalExamFindings: visit.physicalExamFindings || '',
      systematicReview: visit.systematicReview || { ent: '', cvs: '', cns: '', git: '', rs: '' },
      diagnosis: visit.diagnosis || '',
      plan: visit.plan || '',
      consultationFee: visit.consultationFee || 20000
    });
    
    if (currentUser?.role === UserRole.NURSE) {
      setActiveTab('nursing');
    } else {
      setActiveTab('subjective');
    }
  };

  const handleUpdate = async (updates: Partial<Visit>) => {
    if (!selectedVisit) return;
    await updateVisit(selectedVisit.id, updates);
    setSelectedVisit({ ...selectedVisit, ...updates });
  };

  const addPrescription = async () => {
    if (!selectedMed || !selectedVisit) return;
    const newPrescription = [
      ...(selectedVisit.prescription || []),
      {
        medicineId: selectedMed.id,
        medicineName: selectedMed.name,
        dosage: prescForm.dosage || selectedMed.dosage,
        route: prescForm.route || selectedMed.route,
        duration: prescForm.duration,
        dispensed: false,
        price: selectedMed.price
      }
    ];
    await handleUpdate({ prescription: newPrescription });
    setSelectedMed(null);
    setPrescForm({ dosage: '', duration: '', route: '' });
    setMedSearch('');
    addNotification(`${selectedMed.name} added to prescription.`);
  };

  const finalizeEncounter = async () => {
    if (!selectedVisit) return;
    await handleUpdate({ ...doctorForm, status: 'Pharmacy-Pending' });
    setSelectedVisit(null);
    addNotification("Encounter finalized.");
  };

  const logVitals = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    // Robust value extraction logic
    const getValue = (name: string) => {
      const el = form.elements.namedItem(name) as HTMLInputElement | null;
      return el ? el.value : '';
    };

    const updates = {
      vitals: {
        bp: getValue('bp'),
        temperature: getValue('temp'),
        pulse: getValue('pulse'),
        weight: getValue('weight'),
        height: getValue('height'), // Guaranteed to exist now
        oxygenSat: getValue('spo2'),
        respiratoryRate: getValue('rr'),
      }
    };
    await handleUpdate(updates);
    addNotification("Vitals updated successfully.");
  };

  const administerMed = async (med: any) => {
    if (!selectedVisit) return;
    const log = {
      medicineName: med.medicineName,
      timestamp: new Date().toISOString(),
      dosage: med.dosage,
      route: med.route,
      givenBy: currentUser?.fullName || 'Nurse'
    };
    await handleUpdate({ administeredMeds: [...(selectedVisit.administeredMeds || []), log] });
    addNotification(`Administered ${med.medicineName}`);
  };

  const addFluidEntry = async () => {
    if (!selectedVisit) return;
    const entry = {
      timestamp: new Date().toISOString(),
      intake: fluidInput.intake,
      output: fluidInput.output,
      remarks: fluidInput.remarks
    };
    await handleUpdate({ fluidBalance: [...(selectedVisit.fluidBalance || []), entry] });
    setFluidInput({ intake: '', output: '', remarks: '' });
    addNotification("Fluid intake/output logged.");
  };

  const filteredMeds = inventory.filter(i => 
    i.name.toLowerCase().includes(medSearch.toLowerCase()) && i.stock > 0
  );

  const requestLab = async () => {
    if (!selectedVisit || !labRequestInput) return;
    const newTest = {
      id: Math.random().toString(36).substr(2, 9),
      testName: labRequestInput,
      status: 'Pending' as const,
      requestedBy: currentUser?.fullName || 'Doctor',
      price: 15000 
    };
    await handleUpdate({ 
      labRequests: [...(selectedVisit.labRequests || []), newTest],
      status: 'Lab-Pending'
    });
    setLabRequestInput('');
    addNotification("Laboratory test requested.");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeVisits.map((visit) => {
          const patient = patients.find(p => p.id === visit.patientId);
          return (
            <div key={visit.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all`}>
                    <User size={28} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 uppercase tracking-tighter">{patient?.firstName} {patient?.lastName}</h3>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">ID: {visit.id.slice(-6)}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${visit.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-600'}`}>
                  {visit.status.replace('-', ' ')}
                </span>
              </div>
              <button onClick={() => openVisit(visit)} className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 transition-all">
                <ClipboardList size={18} /> Open Patient Chart
              </button>
            </div>
          );
        })}
      </div>

      {selectedVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] w-full max-w-6xl shadow-2xl overflow-hidden h-[95vh] flex flex-col">
            <div className="p-8 border-b flex justify-between items-center bg-white">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Stethoscope size={32} /></div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Clinical Station</h3>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Patient: {patients.find(p => p.id === selectedVisit.patientId)?.firstName} {patients.find(p => p.id === selectedVisit.patientId)?.lastName}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                {currentUser?.role === UserRole.DOCTOR && <button onClick={finalizeEncounter} className="px-8 py-3.5 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-700">Finish Session</button>}
                <button onClick={() => setSelectedVisit(null)} className="p-3 text-slate-300 hover:text-slate-600"><X size={28} /></button>
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              <div className="w-56 bg-slate-50 border-r p-6 space-y-3">
                {[
                  { id: 'subjective', label: 'Subjective', icon: FileText, roles: [UserRole.DOCTOR, UserRole.ADMIN] },
                  { id: 'objective', label: 'Objective', icon: HeartPulse, roles: [UserRole.DOCTOR, UserRole.ADMIN] },
                  { id: 'investigations', label: 'Laboratory', icon: Beaker, roles: [UserRole.DOCTOR, UserRole.ADMIN, UserRole.LAB] },
                  { id: 'prescription', label: 'Prescribe', icon: Pill, roles: [UserRole.DOCTOR, UserRole.ADMIN] },
                  { id: 'nursing', label: 'Nursing Station', icon: Thermometer, roles: [UserRole.NURSE, UserRole.DOCTOR, UserRole.ADMIN] },
                  { id: 'history', label: 'Past Visits', icon: History, roles: [UserRole.DOCTOR, UserRole.NURSE, UserRole.ADMIN] }
                ].filter(t => currentUser && t.roles.includes(currentUser.role)).map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full p-4 rounded-2xl flex flex-col items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-white shadow-xl text-blue-600' : 'text-slate-400 hover:bg-white/50'}`}>
                    <tab.icon size={22} /><span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-12 bg-white">
                {activeTab === 'investigations' && (
                  <div className="max-w-4xl space-y-8">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Laboratory Findings</h4>
                      {currentUser?.role === UserRole.DOCTOR && (
                        <div className="flex gap-2">
                          <input 
                            placeholder="Type test name..." 
                            className="p-3 border rounded-xl"
                            value={labRequestInput}
                            onChange={(e) => setLabRequestInput(e.target.value)}
                          />
                          <button onClick={requestLab} className="bg-blue-600 text-white px-4 rounded-xl font-black uppercase text-[10px]">Order Test</button>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      {selectedVisit.labRequests?.map(req => (
                        <div key={req.id} className="bg-white border-2 p-8 rounded-3xl group hover:border-blue-500 transition-all">
                          <div className="flex justify-between items-center mb-4">
                            <p className="text-xl font-black text-slate-900 uppercase tracking-tighter">{req.testName}</p>
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${req.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>{req.status}</span>
                          </div>
                          {req.status === 'Completed' ? (
                             req.structuredResults ? (
                              <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-[10px] font-black uppercase">
                                  <tr><th className="p-3 text-left">Parameter</th><th className="p-3 text-left">Result</th><th className="p-3 text-left">Range</th></tr>
                                </thead>
                                <tbody>
                                  {req.structuredResults.map((r, i) => (
                                    <tr key={i} className="border-b">
                                      <td className="p-3 font-medium">{r.parameter}</td>
                                      <td className="p-3 font-black text-blue-600">{r.value} {r.unit}</td>
                                      <td className="p-3 text-slate-400">{r.normalRange}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                             ) : <p className="p-4 bg-slate-50 rounded-xl font-medium">{req.result}</p>
                          ) : <p className="text-sm italic text-slate-400">Waiting for technician results...</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'prescription' && (
                  <div className="max-w-4xl space-y-8">
                    <h4 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Pharmacotherapy Order</h4>
                    <div className="bg-slate-50 p-6 rounded-3xl border space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                          className="w-full pl-12 pr-4 py-4 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Search medicines in stock..."
                          value={medSearch}
                          onChange={(e) => setMedSearch(e.target.value)}
                        />
                      </div>
                      
                      {medSearch && (
                        <div className="bg-white border rounded-2xl shadow-xl max-h-48 overflow-y-auto">
                          {filteredMeds.map(item => (
                            <div key={item.id} onClick={() => { setSelectedMed(item); setMedSearch(''); }} className="p-4 hover:bg-blue-50 cursor-pointer flex justify-between items-center border-b">
                              <div><p className="font-bold">{item.name}</p><p className="text-xs text-slate-400">{item.dosage} • {item.route}</p></div>
                              <PlusCircle className="text-blue-600" size={20} />
                            </div>
                          ))}
                        </div>
                      )}

                      {selectedMed && (
                        <div className="p-6 bg-white border-2 border-blue-100 rounded-3xl space-y-4 animate-in slide-in-from-top-4">
                          <p className="font-black uppercase text-blue-600">Ordering: {selectedMed.name}</p>
                          <div className="grid grid-cols-2 gap-4">
                            <input className="p-4 border rounded-xl" placeholder="Dosage (e.g. 1x3)" value={prescForm.dosage} onChange={e => setPrescForm({...prescForm, dosage: e.target.value})} />
                            <input className="p-4 border rounded-xl" placeholder="Duration (e.g. 5 days)" value={prescForm.duration} onChange={e => setPrescForm({...prescForm, duration: e.target.value})} />
                          </div>
                          <button onClick={addPrescription} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-200">Add to Prescription</button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      {selectedVisit.prescription?.map((p, i) => (
                        <div key={i} className="flex justify-between items-center p-4 bg-white border rounded-2xl shadow-sm">
                          <div><p className="font-bold text-slate-800 uppercase">{p.medicineName}</p><p className="text-xs text-blue-600">{p.dosage} — {p.duration}</p></div>
                          <button onClick={() => handleUpdate({ prescription: selectedVisit.prescription?.filter((_, idx) => idx !== i) })} className="p-2 text-rose-300 hover:text-rose-600"><Trash2 size={20} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'nursing' && (
                  <div className="space-y-12">
                    <section className="bg-white border-2 p-8 rounded-[2.5rem] shadow-sm">
                      <h4 className="text-xs font-black text-slate-800 uppercase mb-8 flex items-center gap-2 tracking-widest"><Thermometer size={18} /> Vitals Provision Entry</h4>
                      <form onSubmit={logVitals} className="grid grid-cols-2 md:grid-cols-4 gap-8">
                          {[
                            { name: 'bp', label: 'BP (mmHg)', placeholder: '120/80', icon: Activity },
                            { name: 'temp', label: 'Temp (°C)', placeholder: '36.5', icon: Thermometer },
                            { name: 'pulse', label: 'Pulse (BPM)', placeholder: '72', icon: HeartPulse },
                            { name: 'spo2', label: 'SpO2 (%)', placeholder: '98', icon: Droplets },
                            { name: 'rr', label: 'Resp Rate', placeholder: '16', icon: Wind },
                            { name: 'weight', label: 'Weight (kg)', placeholder: '70', icon: Scale },
                            { name: 'height', label: 'Height (cm)', placeholder: '170', icon: Scale },
                          ].map(field => (
                            <div key={field.name} className="space-y-3">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                               <div className="relative">
                                  <field.icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                  <input 
                                    name={field.name} 
                                    defaultValue={(selectedVisit.vitals as any)?.[field.name === 'spo2' ? 'oxygenSat' : field.name === 'temp' ? 'temperature' : field.name]} 
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-2xl font-black text-blue-600 outline-none focus:ring-2 focus:ring-blue-500 shadow-inner" 
                                    placeholder={field.placeholder} 
                                  />
                               </div>
                            </div>
                          ))}
                          <div className="col-span-1 md:col-span-1 flex items-end">
                             <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all">Submit Vitals</button>
                          </div>
                      </form>
                    </section>

                    <section className="bg-white border-2 p-8 rounded-[2.5rem]">
                      <h4 className="text-xs font-black text-slate-800 uppercase mb-6 flex items-center gap-2 tracking-widest"><Syringe size={18} /> Medical Administration Sheet</h4>
                      <div className="space-y-3">
                        {selectedVisit.prescription?.map((med, i) => (
                          <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border hover:border-blue-300 transition-all">
                            <div><p className="font-black text-slate-900 uppercase">{med.medicineName}</p><p className="text-[10px] font-bold text-blue-600 uppercase">{med.dosage} — {med.route}</p></div>
                            <button onClick={() => administerMed(med)} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 flex items-center gap-2"><CheckSquare size={14} /> Mark Given</button>
                          </div>
                        ))}
                      </div>
                      {selectedVisit.administeredMeds && selectedVisit.administeredMeds.length > 0 && (
                        <div className="mt-8 pt-8 border-t">
                          <h5 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Administration History</h5>
                          <div className="space-y-2">
                            {selectedVisit.administeredMeds.map((log, i) => (
                              <div key={i} className="text-xs flex justify-between p-3 bg-white border rounded-xl">
                                <span className="font-bold uppercase">{log.medicineName} ({log.dosage}) via {log.route}</span>
                                <span className="text-slate-400">{new Date(log.timestamp).toLocaleTimeString()} by {log.givenBy}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </section>

                    <section className="bg-white border-2 p-8 rounded-[2.5rem]">
                      <h4 className="text-xs font-black text-slate-800 uppercase mb-6 flex items-center gap-2 tracking-widest"><Droplets size={18} /> Fluid Monitoring Sheet</h4>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <input className="p-4 border rounded-xl" placeholder="Intake (ml)" value={fluidInput.intake} onChange={e => setFluidInput({...fluidInput, intake: e.target.value})} />
                        <input className="p-4 border rounded-xl" placeholder="Output (ml)" value={fluidInput.output} onChange={e => setFluidInput({...fluidInput, output: e.target.value})} />
                        <input className="p-4 border rounded-xl" placeholder="Remarks" value={fluidInput.remarks} onChange={e => setFluidInput({...fluidInput, remarks: e.target.value})} />
                        <button onClick={addFluidEntry} className="bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] shadow-lg">Log Entry</button>
                      </div>
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 uppercase font-black text-slate-400"><tr><th className="p-4">Time</th><th className="p-4">Intake</th><th className="p-4">Output</th><th className="p-4">Remarks</th></tr></thead>
                        <tbody>{selectedVisit.fluidBalance?.map((f, i) => <tr key={i} className="border-b"><td className="p-4">{new Date(f.timestamp).toLocaleTimeString()}</td><td className="p-4 text-emerald-600 font-black">+{f.intake}ml</td><td className="p-4 text-rose-600 font-black">-{f.output}ml</td><td className="p-4 italic">{f.remarks}</td></tr>)}</tbody>
                      </table>
                    </section>
                  </div>
                )}

                {activeTab === 'subjective' && (
                  <div className="max-w-3xl space-y-10">
                    <section>
                      <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Presenting Complaints (PC)</h4>
                      <textarea className="w-full p-6 border-2 border-slate-50 rounded-3xl outline-none focus:border-blue-500 h-40 text-lg font-medium text-slate-800" placeholder="Symptoms..." value={doctorForm.presentingComplaints} onChange={e => setDoctorForm({...doctorForm, presentingComplaints: e.target.value})} />
                    </section>
                    <section>
                      <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Clinical Diagnosis</h4>
                      <input className="w-full p-4 border rounded-2xl font-black text-xl uppercase text-blue-600 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter Diagnosis..." value={doctorForm.diagnosis} onChange={e => setDoctorForm({...doctorForm, diagnosis: e.target.value})} />
                    </section>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveVisits;
