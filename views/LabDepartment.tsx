
import React, { useState } from 'react';
import { useStore } from '../store';
import { Visit, LabTestResult } from '../types';
import { FlaskConical, Search, Beaker, X, Save, ClipboardList, Thermometer, Droplets, Activity, FileText, Clock, Printer, CheckCircle } from 'lucide-react';

const URINALYSIS_TEMPLATE: LabTestResult[] = [
  { parameter: 'Appearance', value: '', unit: '', normalRange: 'Clear' },
  { parameter: 'Color', value: '', unit: '', normalRange: 'Straw' },
  { parameter: 'Specific Gravity', value: '', unit: '', normalRange: '1.005 - 1.030' },
  { parameter: 'pH', value: '', unit: '', normalRange: '4.6 - 8.0' },
  { parameter: 'Glucose', value: '', unit: '', normalRange: 'Negative' },
  { parameter: 'Protein', value: '', unit: '', normalRange: 'Negative' },
  { parameter: 'Nitrite', value: '', unit: '', normalRange: 'Negative' },
  { parameter: 'Leukocytes', value: '', unit: '', normalRange: 'Negative' },
  { parameter: 'Ketones', value: '', unit: '', normalRange: 'Negative' },
  { parameter: 'Bilirubin', value: '', unit: '', normalRange: 'Negative' },
];

const CBC_TEMPLATE: LabTestResult[] = [
  { parameter: 'WBC Count', value: '', unit: 'x10^9/L', normalRange: '4.0 - 11.0' },
  { parameter: 'Hemoglobin (Hb)', value: '', unit: 'g/dL', normalRange: '12.0 - 16.0' },
  { parameter: 'Platelets', value: '', unit: 'x10^9/L', normalRange: '150 - 450' },
  { parameter: 'RBC Count', value: '', unit: 'x10^12/L', normalRange: '4.5 - 5.5' },
  { parameter: 'PCV (Hematocrit)', value: '', unit: '%', normalRange: '37 - 47' },
  { parameter: 'MCV', value: '', unit: 'fL', normalRange: '80 - 100' },
  { parameter: 'MCH', value: '', unit: 'pg', normalRange: '27 - 33' },
  { parameter: 'MCHC', value: '', unit: 'g/dL', normalRange: '32 - 36' },
  { parameter: 'Neutrophils', value: '', unit: '%', normalRange: '40 - 75' },
  { parameter: 'Lymphocytes', value: '', unit: '%', normalRange: '20 - 45' },
  { parameter: 'Monocytes', value: '', unit: '%', normalRange: '2 - 10' },
  { parameter: 'Eosinophils', value: '', unit: '%', normalRange: '1 - 6' },
];

const LabDepartment: React.FC = () => {
  const { visits, patients, updateVisit, addNotification } = useStore();
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [viewingTest, setViewingTest] = useState<{visit: Visit, test: any} | null>(null);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [structuredResults, setStructuredResults] = useState<LabTestResult[]>([]);
  const [resultText, setResultText] = useState('');
  const [templateType, setTemplateType] = useState<'Generic' | 'CBC' | 'Urinalysis'>('Generic');

  const labVisits = visits.filter(v => v.labRequests && v.labRequests.some(r => r.status === 'Pending'));
  const completedLabVisits = visits.filter(v => v.labRequests && v.labRequests.some(r => r.status === 'Completed'));

  const handleOpenEntry = (visit: Visit, test: any) => {
    setSelectedVisit(visit);
    setEditingTestId(test.id);
    const name = test.testName.toUpperCase();
    if (name.includes('URINALYSIS')) {
      setTemplateType('Urinalysis');
      setStructuredResults([...URINALYSIS_TEMPLATE]);
    } else if (name.includes('CBC') || name.includes('COMPLETE BLOOD COUNT') || name.includes('FBC') || name.includes('HEMOGRAM')) {
      setTemplateType('CBC');
      setStructuredResults([...CBC_TEMPLATE]);
    } else {
      setTemplateType('Generic');
      setResultText('');
    }
  };

  const handleSave = async () => {
    if (!selectedVisit || !editingTestId) return;
    const updated = selectedVisit.labRequests?.map(r => r.id === editingTestId ? {
      ...r, 
      status: 'Completed' as const, 
      result: templateType !== 'Generic' ? `Formal ${templateType} Report` : resultText,
      structuredResults: templateType !== 'Generic' ? structuredResults : undefined, 
      resultDate: new Date().toISOString()
    } : r);
    
    // Check if all tests are completed
    const allDone = updated?.every(r => r.status === 'Completed');
    const newStatus = allDone ? 'With-Doctor' : selectedVisit.status;

    await updateVisit(selectedVisit.id, { 
      labRequests: updated, 
      status: newStatus 
    });
    setEditingTestId(null);
    addNotification(`Diagnostic data for ${templateType === 'Generic' ? 'Test' : templateType} dispatched.`);
  };

  return (
    <div className="space-y-10">
      <div className="bg-white p-12 rounded-[2.5rem] border shadow-2xl shadow-slate-200/50 flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-blue-500/30">
              <FlaskConical size={32} />
           </div>
           <div>
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">Diagnostic Center</h2>
              <p className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em] mt-1 opacity-70">Technician Result Portal & Validation</p>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="text-right hidden md:block">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Analyses</p>
              <p className="text-2xl font-black text-slate-900 leading-none mt-1">{labVisits.length} Pending</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
        <section>
          <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6 flex items-center gap-2"><Clock size={16}/> New Test Requests</h3>
          <div className="grid grid-cols-1 gap-6">
            {labVisits.map(visit => {
              const patient = patients.find(p => p.id === visit.patientId);
              return (
                <div key={visit.id} className="bg-white rounded-[2rem] border p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 shadow-md hover:shadow-xl transition-all group">
                  <div className="flex items-center gap-8">
                    <div className="w-20 h-20 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center font-black text-3xl uppercase shadow-lg group-hover:bg-blue-600 transition-all">{patient?.firstName[0]}</div>
                    <div>
                      <h3 className="font-black text-slate-900 uppercase text-2xl tracking-tighter leading-none">{patient?.firstName} {patient?.lastName}</h3>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-3 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 inline-block">SESSION: {visit.id.slice(-6)}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {visit.labRequests?.filter(r => r.status === 'Pending').map(test => (
                      <button key={test.id} onClick={() => handleOpenEntry(visit, test)} className="px-8 py-5 bg-slate-900 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-widest flex items-center gap-4 hover:bg-blue-600 transition-all shadow-2xl">
                        <Beaker size={20} /> Process {test.testName}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            {labVisits.length === 0 && <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200 text-slate-300 font-black uppercase tracking-widest text-[10px]">No pending diagnostic requests</div>}
          </div>
        </section>

        <section>
          <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6 flex items-center gap-2"><Activity size={16}/> Recently Completed Analyses</h3>
          <div className="grid grid-cols-1 gap-4">
            {completedLabVisits.map(visit => {
              const patient = patients.find(p => p.id === visit.patientId);
              return visit.labRequests?.filter(r => r.status === 'Completed').map(test => (
                <div key={test.id} className="bg-white rounded-2xl border p-6 flex justify-between items-center shadow-sm hover:border-emerald-500 transition-all group">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-black uppercase">{patient?.firstName[0]}</div>
                    <div>
                      <p className="font-black text-slate-800 uppercase text-sm">{patient?.firstName} {patient?.lastName}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Test: {test.testName} • Date: {test.resultDate ? new Date(test.resultDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                  <button onClick={() => setViewingTest({visit, test})} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center gap-2">
                    <FileText size={16} /> View Lab Results
                  </button>
                </div>
              ));
            })}
          </div>
        </section>
      </div>

      {editingTestId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl">
          <div className="bg-white rounded-[3rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
             <div className="p-10 border-b flex justify-between items-center bg-white">
               <div className="flex items-center gap-6">
                 <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[1.2rem] flex items-center justify-center shadow-inner"><ClipboardList size={32}/></div>
                 <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">Formal Lab Report Entry</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Patient: <span className="text-blue-600 font-black">{patients.find(p => p.id === selectedVisit?.patientId)?.firstName} {patients.find(p => p.id === selectedVisit?.patientId)?.lastName}</span></p>
                 </div>
               </div>
               <button onClick={() => setEditingTestId(null)} className="p-3 text-slate-300 hover:text-slate-600 transition-colors"><X size={32} /></button>
             </div>
             
             <div className="p-12 overflow-y-auto flex-1 bg-slate-50/50">
                {templateType !== 'Generic' ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-10 bg-blue-600 p-6 rounded-[1.5rem] shadow-xl shadow-blue-500/20 text-white">
                       <Activity size={28} />
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.3em]">Protocol Auto-Matched</p>
                          <h4 className="text-xl font-black uppercase tracking-tight leading-none mt-1">{templateType} Clinical Template</h4>
                       </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="grid grid-cols-4 gap-6 px-8 mb-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Diagnostic Parameter</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Value</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Standard Range</span>
                      </div>
                      {structuredResults.map((r, i) => (
                        <div key={i} className="flex items-center gap-6 bg-white p-6 rounded-[1.5rem] border-2 border-slate-100 hover:border-blue-600 transition-all shadow-sm">
                          <label className="w-1/4 text-sm font-black text-slate-700 uppercase leading-none">{r.parameter}</label>
                          <input 
                            className="w-1/4 p-4 border-2 border-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-black text-blue-600 text-center text-lg shadow-inner bg-slate-50/30"
                            value={r.value}
                            onChange={e => {
                              const nr = [...structuredResults];
                              nr[i].value = e.target.value;
                              setStructuredResults(nr);
                            }}
                            placeholder="---"
                          />
                          <span className="w-1/4 text-[11px] font-black text-slate-400 uppercase">{r.unit || 'n/a'}</span>
                          <span className="w-1/4 text-[11px] font-black text-slate-300 text-right uppercase tracking-tighter">{r.normalRange}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Comprehensive Diagnostic Findings</label>
                    <textarea 
                      className="w-full h-80 p-10 border-[3px] border-slate-100 rounded-[2.5rem] outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-2xl text-slate-800 shadow-inner bg-white" 
                      placeholder="Detail the laboratory observations and final results here..." 
                      value={resultText} 
                      onChange={e => setResultText(e.target.value)} 
                    />
                  </div>
                )}
             </div>

             <div className="p-10 border-t bg-white flex justify-end gap-4">
                <button onClick={() => setEditingTestId(null)} className="px-10 py-5 bg-slate-50 text-slate-500 rounded-[1.2rem] font-black uppercase text-xs tracking-widest hover:bg-slate-100 transition-all">Discard Entry</button>
                <button onClick={handleSave} className="px-14 py-5 bg-blue-600 text-white rounded-[1.2rem] font-black uppercase text-xs tracking-widest shadow-2xl shadow-blue-200 flex items-center gap-4 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all">
                  <Save size={20} /> Authorize & Dispatch Result
                </button>
             </div>
          </div>
        </div>
      )}

      {viewingTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl">
          <div className="bg-white rounded-[3rem] w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border-8 border-white">
             <div className="p-10 border-b flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 bg-emerald-600 text-white rounded-[1.2rem] flex items-center justify-center shadow-xl shadow-emerald-200"><FileText size={32}/></div>
                   <div>
                      <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">Diagnostic Record View</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{viewingTest.test.testName} • Recorded {viewingTest.test.resultDate ? new Date(viewingTest.test.resultDate).toLocaleString() : 'N/A'}</p>
                   </div>
                </div>
                <button onClick={() => setViewingTest(null)} className="p-3 text-slate-300 hover:text-slate-900 transition-colors"><X size={32} /></button>
             </div>
             
             <div className="p-12 overflow-y-auto flex-1 bg-white">
                {viewingTest.test.structuredResults ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-4 px-4 py-2 bg-slate-50 rounded-xl mb-4 font-black uppercase text-[10px] text-slate-400 tracking-widest">
                       <span>Parameter</span>
                       <span className="text-center">Value</span>
                       <span>Unit</span>
                       <span className="text-right">Normal Range</span>
                    </div>
                    {viewingTest.test.structuredResults.map((r: any, i: number) => (
                      <div key={i} className="grid grid-cols-4 gap-4 px-4 py-4 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <span className="font-bold text-slate-700 text-sm uppercase">{r.parameter}</span>
                        <span className="font-black text-blue-600 text-sm text-center bg-blue-50 rounded-lg py-1">{r.value}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{r.unit || '---'}</span>
                        <span className="text-[10px] font-bold text-slate-300 text-right uppercase tracking-tighter">{r.normalRange}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-10 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b pb-4">Detailed Laboratory Remarks</h5>
                    <p className="text-xl font-bold text-slate-800 leading-relaxed whitespace-pre-wrap">{viewingTest.test.result}</p>
                  </div>
                )}
             </div>

             <div className="p-10 border-t bg-slate-50 flex justify-end">
                <button onClick={() => window.print()} className="px-10 py-5 bg-slate-900 text-white rounded-[1.2rem] font-black uppercase text-xs tracking-widest shadow-xl hover:bg-blue-600 transition-all flex items-center gap-3">
                   <Printer size={18} /> Print Diagnostics
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabDepartment;
