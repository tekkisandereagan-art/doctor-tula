
import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './store';
import { UserRole, User } from './types';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import StaffManagement from './views/StaffManagement';
import InventoryManagement from './views/InventoryManagement';
import PatientManagement from './views/PatientManagement';
import ActiveVisits from './views/ActiveVisits';
import Pharmacy from './views/Pharmacy';
import Expenses from './views/Expenses';
import Reports from './views/Reports';
import AuditLogs from './views/AuditLogs';
import LabDepartment from './views/LabDepartment';
import { auth, db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { ShieldCheck, Mail, Stethoscope, Lock, User as UserIcon, Activity } from 'lucide-react';

const Main: React.FC = () => {
  const { currentUser, setCurrentUser, addNotification } = useStore();
  const [activeView, setActiveView] = useState('dashboard');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const ADMIN_EMAIL = 'tekkisandereagan@gmail.com';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (!firebaseUser.emailVerified) {
          setUnverifiedEmail(firebaseUser.email);
          setCurrentUser(null);
          setLoading(false);
          return;
        }

        const normalizedEmail = firebaseUser.email?.toLowerCase() || '';
        
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          let userData: User;

          if (userDoc.exists()) {
            userData = { id: userDoc.id, ...userDoc.data() } as User;
            if (normalizedEmail === ADMIN_EMAIL && userData.role !== UserRole.ADMIN) {
              userData.role = UserRole.ADMIN;
              await setDoc(doc(db, 'users', firebaseUser.uid), { role: UserRole.ADMIN }, { merge: true });
            }
          } else {
            userData = {
              id: firebaseUser.uid,
              username: normalizedEmail,
              fullName: firebaseUser.displayName || normalizedEmail.split('@')[0],
              role: normalizedEmail === ADMIN_EMAIL ? UserRole.ADMIN : UserRole.DOCTOR,
              department: normalizedEmail === ADMIN_EMAIL ? 'Administration' : 'General',
              active: true
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), userData);
          }

          setCurrentUser(userData);
          setUnverifiedEmail(null);
        } catch (err) {
          console.error("Profile Bootstrap Error:", err);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setCurrentUser]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, loginForm.email, loginForm.password);
    } catch (err: any) {
      setLoading(false);
      setError("Authorization failed. Check your staff credentials.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUnverifiedEmail(null);
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  if (loading && !currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (unverifiedEmail && !currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center bg-white p-12 rounded-[2.5rem] shadow-2xl">
          <Mail size={64} className="mx-auto text-blue-600 mb-8" />
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">Email Verification</h2>
          <p className="mb-8 font-medium text-slate-500 italic">Security link dispatched to {unverifiedEmail}.</p>
          <button onClick={handleLogout} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-200">Return to Portal</button>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-0">
        <div className="w-full h-screen flex">
          {/* Left Panel: Visual Impact */}
          <div className="hidden lg:flex w-7/12 bg-slate-900 relative overflow-hidden group">
            <div className="absolute inset-0 bg-medical-tech opacity-60 group-hover:scale-105 transition-transform duration-1000"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-transparent to-blue-900/40"></div>
            <div className="relative z-10 flex flex-col justify-end p-20 w-full h-full">
               <div className="w-20 h-20 bg-blue-600 rounded-[2.5rem] flex items-center justify-center text-white mb-10 shadow-2xl shadow-blue-900">
                  <Activity size={40} />
               </div>
               <h1 className="text-7xl font-black text-white leading-none tracking-tighter uppercase max-w-2xl">
                 Modern Healthcare <br/><span className="text-blue-500">Excellence.</span>
               </h1>
               <p className="text-xl text-slate-300 mt-8 max-w-md font-medium leading-relaxed">
                 Official Electronic Health Records Portal for Doctors Clinic Medical Center Tula.
               </p>
            </div>
          </div>

          {/* Right Panel: Login Form */}
          <div className="w-full lg:w-5/12 bg-white flex flex-col justify-center items-center p-12 md:p-24">
            <div className="w-full max-w-md">
              <div className="lg:hidden mb-12 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                  <Stethoscope size={24} />
                </div>
                <div>
                  <h1 className="text-lg font-black uppercase tracking-tighter leading-none">DOCTORS CLINIC</h1>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Medical Center Tula</p>
                </div>
              </div>

              <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">Staff Portal</h2>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-10">Authorized Personnel Access Only</p>
              
              <form onSubmit={handleAuth} className="space-y-5">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
                   <div className="relative">
                      <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        required 
                        type="email" 
                        value={loginForm.email} 
                        onChange={e => setLoginForm({...loginForm, email: e.target.value})} 
                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-0 rounded-2xl outline-none ring-2 ring-transparent focus:ring-blue-500 font-bold text-slate-800 transition-all shadow-inner" 
                        placeholder="staff@doctorsclinic.com" 
                      />
                   </div>
                </div>
                
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Key</label>
                   <div className="relative">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        required 
                        type="password" 
                        value={loginForm.password} 
                        onChange={e => setLoginForm({...loginForm, password: e.target.value})} 
                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-0 rounded-2xl outline-none ring-2 ring-transparent focus:ring-blue-500 font-bold text-slate-800 transition-all shadow-inner" 
                        placeholder="••••••••" 
                      />
                   </div>
                </div>

                {error && <div className="text-rose-600 text-xs font-black uppercase tracking-widest bg-rose-50 p-4 rounded-xl border border-rose-100">{error}</div>}
                
                <button 
                  type="submit" 
                  className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-blue-600 active:scale-[0.98] transition-all mt-6"
                >
                  Verify Access & Log In
                </button>
              </form>

              <div className="mt-20 pt-10 border-t border-slate-100 flex justify-between items-center">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">© 2025 Doctors Clinic Tula</p>
                <div className="flex gap-4">
                  <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                  <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                  <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard />;
      case 'users': return <StaffManagement />;
      case 'inventory': return <InventoryManagement />;
      case 'patients': return <PatientManagement />;
      case 'visits': return <ActiveVisits />;
      case 'lab': return <LabDepartment />;
      case 'pharmacy': return <Pharmacy />;
      case 'expenses': return <Expenses />;
      case 'reports': return <Reports />;
      case 'logs': return <AuditLogs />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activeView={activeView} setActiveView={setActiveView} onLogout={handleLogout}>
      {renderView()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <Main />
    </StoreProvider>
  );
};

export default App;
