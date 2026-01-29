
import React, { useState } from 'react';
import { useStore } from '../store';
import { Patient, Visit, UserRole } from '../types';
import { Search, Plus, User, Phone, Mail, Calendar, MapPin, ChevronRight, Activity, X, Stethoscope } from 'lucide-react';

const PatientManagement: React.FC = () => {
  const { patients, addPatient, addVisit, visits, currentUser } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmVisit, setConfirmVisit] = useState<string | null>(null);
  const [autoForward, setAutoForward] = useState(true);

  const [formData, setFormData] = useState<Partial<Patient>>({
    firstName: '',
    lastName: '',
    gender: 'Male',
    phone: '',
    email: '',
    dob: '',
    address: '',
    bloodType: 'O+'
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const createdPatient = await addPatient(formData);
    
    // If auto-forward is enabled, automatically start a visit with 'With-Doctor' status
    if (createdPatient && autoForward) {
      await addVisit({
        patientId: createdPatient.id,
        status: 'With-Doctor'
      });
    }

    setIsModalOpen(false);
    setFormData({ firstName: '', lastName: '', gender: 'Male', phone: '', email: '', dob: '', address: '', bloodType: 'O+' });
  };

  const startVisit = async (patientId: string) => {
    // Explicitly set status to 'With-Doctor' to ensure it appears in the doctor's queue
    await addVisit({
      patientId,
      status: 'With-Doctor'
    });
    setConfirmVisit(null);
  };

  const filteredPatients = patients.filter(p => 
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isDoctor = currentUser?.role === UserRole.DOCTOR;
  const canRegister = currentUser?.role === UserRole.RECEPTION_PHARMACY || currentUser?.role === UserRole.ADMIN;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        {canRegister && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 font-bold w-full md:w-auto"
          >
            <Plus size={18} />
            Register New Patient
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => (
          <div key={patient.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow group">
            <div className="p-6 flex-1">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 leading-tight">
                      {patient.firstName} {patient.lastName}
                    </h3>
                    <p className="text-xs font-bold text-blue-600 mt-0.5 uppercase tracking-tighter">ID: {patient.id?.slice(-8)}</p>
                  </div>
                </div>
                <div className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-[10px] font-black uppercase">
                  {patient.bloodType}
                </div>
              </div>
              
              <div className="space-y-2 mb-6 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone size={14} className="text-slate-400" /> <span>{patient.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar size={14} className="text-slate-400" /> <span>{patient.dob} ({patient.gender})</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin size={14} className="text-slate-400" /> <span className="truncate">{patient.address}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Clinical History</p>
                <div className="flex gap-2">
                   <div className="bg-slate-50 rounded-lg p-3 flex-1 border border-slate-100">
                     <p className="text-[9px] uppercase font-black text-slate-400 tracking-tighter">Previous Visits</p>
                     <p className="text-xl font-black text-slate-800">
                       {visits.filter(v => v.patientId === patient.id).length}
                     </p>
                   </div>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex gap-2">
              <button 
                onClick={() => setConfirmVisit(patient.id)}
                className="flex-1 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Stethoscope size={16} />
                Forward to Doctor
              </button>
              <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {confirmVisit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-2xl w-full max-w-sm p-8 shadow-2xl animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <Activity size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 text-center mb-2">Send to Doctor?</h3>
            <p className="text-slate-500 text-center mb-8 leading-relaxed">
              This will place the patient in the active queue for clinical officers and doctors to review.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmVisit(null)} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
              <button onClick={() => startVisit(confirmVisit)} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all">Yes, Forward</button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">New Patient Registration</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2"><X size={20} /></button>
            </div>
            <form onSubmit={handleRegister} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">First Name</label>
                  <input required type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Enter first name" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Last Name</label>
                  <input required type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Enter last name" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Gender</label>
                  <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as any})} className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500 font-medium">
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Date of Birth</label>
                  <input required type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Phone Number</label>
                  <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="+256..." />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Blood Type</label>
                  <select value={formData.bloodType} onChange={e => setFormData({...formData, bloodType: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500 font-medium">
                    <option>O+</option><option>O-</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Address</label>
                  <textarea rows={2} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Residential location..." />
                </div>
              </div>
              
              <div className="mt-6 flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <input 
                  type="checkbox" 
                  id="forward" 
                  checked={autoForward} 
                  onChange={e => setAutoForward(e.target.checked)} 
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="forward" className="text-sm font-bold text-blue-800 cursor-pointer">
                  Forward to Doctor's queue immediately after registration
                </label>
              </div>

              <div className="mt-8 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]">Complete Registration</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientManagement;
