
import React from 'react';
import { useStore } from '../store';
import { UserRole } from '../types';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  ClipboardList, 
  FlaskConical, 
  Pill, 
  BarChart3, 
  LogOut, 
  History,
  Calendar,
  ShieldCheck,
  Package,
  Receipt,
  Stethoscope
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  setActiveView: (view: string) => void;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, setActiveView, onLogout }) => {
  const { currentUser } = useStore();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.LAB] },
    { id: 'users', label: 'Staff Management', icon: Users, roles: [UserRole.ADMIN] },
    { id: 'inventory', label: 'Stock Management', icon: Package, roles: [UserRole.ADMIN] },
    { id: 'patients', label: 'Patients', icon: UserPlus, roles: [UserRole.ADMIN, UserRole.RECEPTION_PHARMACY, UserRole.DOCTOR, UserRole.NURSE] },
    { id: 'appointments', label: 'Appointments', icon: Calendar, roles: [UserRole.ADMIN, UserRole.DOCTOR] },
    { id: 'visits', label: 'Active Visits', icon: ClipboardList, roles: [UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE] },
    { id: 'lab', label: 'Laboratory', icon: FlaskConical, roles: [UserRole.ADMIN, UserRole.LAB, UserRole.DOCTOR] },
    { id: 'pharmacy', label: 'Pharmacy/Billing', icon: Pill, roles: [UserRole.ADMIN, UserRole.RECEPTION_PHARMACY] },
    { id: 'expenses', label: 'Daily Expenses', icon: Receipt, roles: [UserRole.ADMIN, UserRole.RECEPTION_PHARMACY] },
    { id: 'reports', label: 'Reports', icon: BarChart3, roles: [UserRole.ADMIN, UserRole.RECEPTION_PHARMACY] },
    { id: 'logs', label: 'Audit Logs', icon: History, roles: [UserRole.ADMIN] },
  ];

  const filteredMenuItems = menuItems.filter(item => currentUser && item.roles.includes(currentUser.role));

  React.useEffect(() => {
    if (currentUser && !filteredMenuItems.find(m => m.id === activeView)) {
      if (filteredMenuItems.length > 0) {
        setActiveView(filteredMenuItems[0].id);
      }
    }
  }, [currentUser, activeView, filteredMenuItems, setActiveView]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] ring-2 ring-blue-500/20">
            <Stethoscope size={20} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black tracking-tight leading-none">DOCTORS CLINIC</h1>
            <p className="text-[10px] font-bold text-blue-400 mt-1 uppercase tracking-widest leading-none">Medical Center Tula</p>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {filteredMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeView === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          {currentUser?.role === UserRole.ADMIN && (
            <div className="mb-4 px-3 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center gap-2 animate-pulse">
              <ShieldCheck size={14} className="text-blue-400" />
              <span className="text-[10px] font-black uppercase tracking-tighter text-blue-400">System Admin Access</span>
            </div>
          )}
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold ring-2 ring-slate-600">
              {currentUser?.fullName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentUser?.fullName}</p>
              <p className="text-[10px] text-slate-500 truncate font-bold uppercase">{currentUser?.role}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-950/30 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tight">
            {menuItems.find(i => i.id === activeView)?.label || 'Doctors Clinic'}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-xs font-black text-slate-400 px-3 py-1.5 bg-slate-100 rounded-full uppercase tracking-widest">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </header>
        
        <div className="p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
