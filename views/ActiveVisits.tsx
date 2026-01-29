
import React, { useState } from 'react';
import { useStore } from '../store';
import { UserRole, Visit, InventoryItem } from '../types';
import { 
  Stethoscope, FlaskConical, Pill, Clock, User, HeartPulse, Scale,
  FileText, X, ClipboardList, Activity, Droplets, Syringe, History, 
  Thermometer, Wind, Beaker, PlusCircle, Trash2, CheckSquare, Search,
  ClipboardCheck, Package, Save
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

  const activeVisits = visits.filter(v => v.status !== 'Completed');

  const openVisit = (visit: Visit) => {
    setSelectedVisit(visit);
    setDoctorForm({
      presentingComplaints: visit.presentingComplaints || '',
      historyOfPresentingComplaints: visit.historyOfPresentingComplaints || '',
      physicalExamFindings: visit.physicalExamFindings || '',
      systematicReview: visit.systematicReview || { ent: '', cvs: '', cns: '', git: '', rs: '', general: '' },
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
    if (selectedMed.stock <= 0) {
      addNotification("Insufficient stock available.", "error");
      return;
    }

    const newPrescription = [
      ...(selectedVisit.prescription || []),
      {
        medicineId: selectedMed.id,
        medicineName: selectedMed.name,
        dosage: prescForm.dosage || selectedMed.dosage,
        route: prescForm.route || selectedMed.route,
        duration: prescForm.duration,
        dispensed: false,
        price: selectedMed.price,
        quantity: 1 
      }
    ];
    await handleUpdate({ prescription: newPrescription });
    setSelectedMed(null);
    setPrescForm({ dosage: '', duration: '', route: '' });
    setMedSearch('');
    addNotification(`${selectedMed.name} prescribed.`);
  };

  const finalizeEncounter = async () => {
    if (!selectedVisit) return;
    await handleUpdate({ ...doctorForm, status: 'Pharmacy-Pending' });
    setSelectedVisit(null);
    addNotification("Clinical encounter completed.");
  };

  const filteredMeds = inventory.filter(i => 
    i.name.toLowerCase().includes(medSearch.toLowerCase()) ||
    i.category.toLowerCase().includes(medSearch.toLowerCase())
  ).slice(0, 5);

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
    addNotification("Test requested.");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-1">Clinical Portal</h2>
          <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-1 opacity-70">Active Consultations</p>
        </div>
        <div className="flex gap-2">
           <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 flex items-center gap-2 font-black text-[10px] uppercase tracking-widest">
              <Activity size={14} /> {activeVisits.length} Sessions
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeVisits.map((visit) => {
          const patient = patients.find(p => p.id === visit.patientId);
          return (
            <div key={visit.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-all group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xl uppercase group-hover:bg-blue-600">
                  {patient?.firstName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-slate-900 uppercase tracking-tighter text-sm truncate">{patient?.firstName} {patient?.lastName}</h3>
                  <div className="flex gap-2 mt-1">
                     <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded border border-blue-100">#{visit.id.slice(-4)}</span>
                     <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded border border-amber-100">{visit.status.replace('-', ' ')}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => openVisit(visit)} className="w-full py-2.5 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-sm">
                <ClipboardList size={16} /> Open Records
              </button>
            </div>
          );
        })}
        {activeVisits.length === 0 && (
           <div className="col-span-full py-16 text-center bg-white rounded-xl border border-dashed border-slate-200">
              <p className="text-slate-400 font-black uppercase tracking-widest text-[9px]">No active clinical encounters.</p>
           </div>
        )}
      </div>

      {selectedVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden h-[85vh] flex flex-col border">
            <div className="p-5 border-b flex justify-between items-center bg-white">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-blue-600 text-white rounded-lg shadow-lg"><Stethoscope size={24} /></div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter leading-none">EHR PORTAL</h3>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                    Patient: <span className="text-blue-600">{patients.find(p => p.id === selectedVisit.patientId)?.firstName} {patients.find(p => p.id === selectedVisit.patientId)?.lastName}</span>
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {currentUser?.role === UserRole.DOCTOR && (
                  <button onClick={finalizeEncounter} className="px-6 py-2.5 bg-rose-600 text-white rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all shadow-md">
                    Finish Session
                  </button>
                )}
                <button onClick={() => setSelectedVisit(null)} className="p-2 text-slate-300 hover:text-slate-900 transition-colors"><X size={24} /></button>
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              <div className="w-48 bg-slate-50 border-r p-4 space-y-2">
                {[
                  { id: 'subjective', label: 'Subjective', icon: FileText, roles: [UserRole.DOCTOR, UserRole.ADMIN] },
                  { id: 'objective', label: 'Objective', icon: HeartPulse, roles: [UserRole.DOCTOR, UserRole.ADMIN] },
                  { id: 'investigations', label: 'Diagnostics', icon: Beaker, roles: [UserRole.DOCTOR, UserRole.ADMIN, UserRole.LAB] },
                  { id: 'prescription', label: 'Prescriptions', icon: Pill, roles: [UserRole.DOCTOR, UserRole.ADMIN] },
                  { id: 'nursing', label: 'Nursing', icon: Thermometer, roles: [UserRole.NURSE, UserRole.DOCTOR, UserRole.ADMIN] },
                  { id: 'history', label: 'History', icon: History, roles: [UserRole.DOCTOR, UserRole.NURSE, UserRole.ADMIN] }
                ].filter(t => currentUser && t.roles.includes(currentUser.role)).map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full p-3 rounded-lg flex items-center gap-3 transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-200 hover:text-slate-600'}`}>
                    <tab.icon size={16} /><span className="text-[9px] font-black uppercase tracking-widest">{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-8 bg-white">
                {activeTab === 'subjective' && (
                  <div className="max-w-3xl space-y-6">
                    <div>
                      <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Chief Complaints</h4>
                      <textarea className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-32 text-sm font-medium bg-slate-50 shadow-inner" placeholder="Enter findings..." value={doctorForm.presentingComplaints} onChange={e => setDoctorForm({...doctorForm, presentingComplaints: e.target.value})} />
                    </div>
                    <div>
                      <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Final Diagnosis</h4>
                      <input className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-lg font-black uppercase text-blue-600 shadow-sm" placeholder="e.g. MALARIA" value={doctorForm.diagnosis} onChange={e => setDoctorForm({...doctorForm, diagnosis: e.target.value})} />
                    </div>
                  </div>
                )}
                {/* ... other tabs would follow similar tightening ... */}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveVisits;
