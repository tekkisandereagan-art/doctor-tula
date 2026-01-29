
import React, { useState } from 'react';
import { useStore } from '../store';
import { Visit, LabTestResult } from '../types';
import { FlaskConical, Search, Beaker, X, Save } from 'lucide-react';

const URINALYSIS_TEMPLATE: LabTestResult[] = [
  { parameter: 'Appearance', value: '', unit: '', normalRange: 'Clear' },
  { parameter: 'Color', value: '', unit: '', normalRange: 'Straw' },
  { parameter: 'Specific Gravity', value: '', unit: '', normalRange: '1.005 - 1.030' },
  { parameter: 'pH', value: '', unit: '', normalRange: '4.6 - 8.0' },
  { parameter: 'Glucose', value: '', unit: '', normalRange: 'Negative' },
  { parameter: 'Protein', value: '', unit: '', normalRange: 'Negative' },
  { parameter: 'Nitrite', value: '', unit: '', normalRange: 'Negative' },
  { parameter: 'Leukocytes', value: '', unit: '', normalRange: 'Negative' },
  { parameter: 'Bilirubin', value: '', unit: '', normalRange: 'Negative' },
  { parameter: 'Ketones', value: '', unit: '', normalRange: 'Negative' },
];

const LabDepartment: React.FC = () => {
  const { visits, patients, updateVisit, addNotification } = useStore();
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [structuredResults, setStructuredResults] = useState<LabTestResult[]>([]);
  const [resultText, setResultText] = useState('');
  const [isStructured, setIsStructured] = useState(false);

  const labVisits = visits.filter(v => v.labRequests && v.labRequests.some(r => r.status === 'Pending'));

  const handleOpenEntry = (visit: Visit, test: any) => {
    setSelectedVisit(visit);
    setEditingTestId(test.id);
    const name = test.testName.toUpperCase();
    if (name.includes('URINALYSIS')) {
      setIsStructured(true);
      setStructuredResults([...URINALYSIS_TEMPLATE]);
    } else {
      setIsStructured(false);
      setResultText('');
    }
  };

  const handleSave = async () => {
    if (!selectedVisit || !editingTestId) return;
    const updated = selectedVisit.labRequests?.map(r => r.id === editingTestId ? {
      ...r, status: 'Completed' as const, result: isStructured ? 'See Structured Results' : resultText,
      structuredResults: isStructured ? structuredResults : undefined, resultDate: new Date().toISOString()
    } : r);
    await updateVisit(selectedVisit.id, { labRequests: updated, status: 'With-Doctor' });
    setEditingTestId(null);
    addNotification("Test results uploaded and sent to doctor.");
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-2xl border flex items-center justify-between mb-8 shadow-sm">
        <div><h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Laboratory Station</h2><p className="text-slate-500 font-medium">Diagnostic testing and resulting queue.</p></div>
        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><FlaskConical size={32} /></div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {labVisits.map(visit => {
          const patient = patients.find(p => p.id === visit.patientId);
          return (
            <div key={visit.id} className="bg-white rounded-3xl border p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm hover:shadow-md transition-all">
              <div>
                <h3 className="font-black text-slate-900 uppercase text-xl tracking-tighter">{patient?.firstName} {patient?.lastName}</h3>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">Visit ID: {visit.id.slice(-6)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {visit.labRequests?.filter(r => r.status === 'Pending').map(test => (
                  <button key={test.id} onClick={() => handleOpenEntry(visit, test)} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 transition-all">
                    <Beaker size={16} /> Enter Result: {test.testName}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        {labVisits.length === 0 && (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed text-slate-300">
            <FlaskConical size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-black uppercase tracking-widest text-xs">Waiting for test requests...</p>
          </div>
        )}
      </div>

      {editingTestId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
             <div className="p-8 border-b flex justify-between items-center">
               <h3 className="text-xl font-black uppercase tracking-tighter">Diagnostic Data Entry</h3>
               <button onClick={() => setEditingTestId(null)} className="p-2 text-slate-300 hover:text-slate-600 transition-colors"><X size={24} /></button>
             </div>
             
             <div className="p-8 overflow-y-auto flex-1 bg-slate-50/50">
                {isStructured ? (
                  <div className="space-y-4">
                    <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-6">Template: Urinalysis Dipstick/Microscopic</p>
                    <div className="grid grid-cols-1 gap-4">
                      {structuredResults.map((r, i) => (
                        <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-2xl border shadow-sm">
                          <label className="w-1/3 text-xs font-black text-slate-500 uppercase">{r.parameter}</label>
                          <input 
                            className="flex-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                            value={r.value}
                            onChange={e => {
                              const nr = [...structuredResults];
                              nr[i].value = e.target.value;
                              setStructuredResults(nr);
                            }}
                            placeholder="Enter finding..."
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">General Result Findings</label>
                    <textarea 
                      className="w-full h-48 p-6 border rounded-3xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-lg" 
                      placeholder="Type diagnostic findings here..." 
                      value={resultText} 
                      onChange={e => setResultText(e.target.value)} 
                    />
                  </div>
                )}
             </div>

             <div className="p-8 border-t bg-white flex justify-end gap-3">
                <button onClick={() => setEditingTestId(null)} className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest">Cancel</button>
                <button onClick={handleSave} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center gap-2 hover:bg-blue-700 active:scale-95 transition-all">
                  <Save size={18} /> Complete & Dispatch
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabDepartment;
