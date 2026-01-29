
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Patient, Visit, InventoryItem, AuditLog, Appointment, UserRole, Expense } from './types';
import { db, firebaseConfig } from './firebase';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  signOut as authSignOut
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  where, 
  orderBy,
  setDoc,
  deleteDoc,
  Unsubscribe
} from 'firebase/firestore';

const secondaryApp = initializeApp(firebaseConfig, "SecondaryRegistrationApp");
const secondaryAuth = getAuth(secondaryApp);

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface StoreState {
  currentUser: User | null;
  users: User[];
  patients: Patient[];
  visits: Visit[];
  inventory: InventoryItem[];
  expenses: Expense[];
  auditLogs: AuditLog[];
  appointments: Appointment[];
  notifications: Notification[];
  setCurrentUser: (user: User | null) => void;
  addUser: (user: Partial<User>, password?: string) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  addPatient: (patient: Partial<Patient>) => Promise<Patient | null>;
  addVisit: (visit: Partial<Visit>) => Promise<void>;
  updateVisit: (id: string, updates: Partial<Visit>) => Promise<void>;
  addLog: (action: string, details: string) => Promise<void>;
  addAppointment: (appointment: Partial<Appointment>) => Promise<void>;
  addInventoryItem: (item: Partial<InventoryItem>) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  dispenseMedication: (visitId: string, medicineId: string) => Promise<void>;
  sellInventoryItem: (itemId: string, quantity: number, customerName?: string) => Promise<void>;
  addExpense: (expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeNotification: (id: string) => void;
}

const StoreContext = createContext<StoreState | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeNotification(id), 6000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    if (!currentUser || !currentUser.role) {
      setPatients([]); setVisits([]); setAppointments([]); setUsers([]); setInventory([]); setAuditLogs([]); setExpenses([]);
      return;
    }

    const unsubscribes: Unsubscribe[] = [];
    const isAdmin = currentUser.role === UserRole.ADMIN;

    const syncCollection = (
      colPath: string, 
      setter: (data: any[]) => void, 
      filterField: string | null = null,
      orderField: string | null = null
    ) => {
      try {
        let q = collection(db, colPath);
        
        // Removed the filterField restriction for clinical data to ensure 
        // that visits created by one role (Reception) are visible to others (Doctors/Nurses)
        // Only keep restrictions on sensitive admin-level documents if necessary
        
        if (orderField) {
          q = query(q, orderBy(orderField, 'desc')) as any;
        }

        const unsub = onSnapshot(q, (snapshot) => {
          setter(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, (error) => {
          if (error.code === 'permission-denied') {
            console.warn(`Sync restricted: ${colPath}.`);
            setter([]);
          } else {
            console.error(`Sync error [${colPath}]:`, error.message);
          }
        });
        unsubscribes.push(unsub);
      } catch (e) {
        console.error(`Setup error [${colPath}]:`, e);
      }
    };

    if (isAdmin) {
      syncCollection(`users/${currentUser.id}/staff`, setUsers);
    } else {
      const userRef = doc(db, 'users', currentUser.id);
      const unsub = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          setUsers([{ id: docSnap.id, ...docSnap.data() } as User]);
        }
      }, (err) => {
        if (err.code !== 'permission-denied') console.warn("Self-profile sync failed:", err);
      });
      unsubscribes.push(unsub);
    }
    
    // Patients, Visits, and Appointments are now synced globally for all clinical staff
    syncCollection('patients', setPatients);
    syncCollection('visits', setVisits);
    syncCollection('appointments', setAppointments);
    syncCollection('inventory', setInventory);
    syncCollection('expenses', setExpenses, null, 'date');

    if (isAdmin) {
      syncCollection('auditLogs', setAuditLogs, null, 'timestamp');
    } else {
      setAuditLogs([]);
    }

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [currentUser]);

  const addLog = async (action: string, details: string) => {
    if (!currentUser) return;
    try {
      await addDoc(collection(db, 'auditLogs'), {
        timestamp: new Date().toISOString(),
        userId: currentUser.id,
        userEmail: currentUser.username,
        action,
        details
      });
    } catch (e) { 
      console.debug('Log write failed.'); 
    }
  };

  const addUser = async (userData: Partial<User>, password?: string) => {
    if (!currentUser || currentUser.role !== UserRole.ADMIN) {
      addNotification("Unauthorized: System Admin role required.", "error");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, userData.username!, password!);
      const firebaseUser = userCredential.user;
      await sendEmailVerification(firebaseUser);
      const staffId = firebaseUser.uid;
      const data = { ...userData, id: staffId, active: true, createdAt: new Date().toISOString() };
      await Promise.all([
        setDoc(doc(db, 'users', currentUser.id, 'staff', staffId), data),
        setDoc(doc(db, 'users', staffId), data)
      ]);
      await authSignOut(secondaryAuth);
      addNotification(`Staff ${userData.fullName} registered.`);
    } catch (e: any) { addNotification(e.message, "error"); }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    try {
      await updateDoc(doc(db, 'users', id), updates);
      if (currentUser?.role === UserRole.ADMIN) {
        try { await updateDoc(doc(db, 'users', currentUser.id, 'staff', id), updates); } catch (e) {}
      }
      addNotification(`Staff updated.`);
    } catch (e: any) { addNotification(e.message, "error"); }
  };

  const deleteUser = async (id: string) => {
    if (!currentUser || currentUser.role !== UserRole.ADMIN) return;
    try {
      await deleteDoc(doc(db, 'users', id));
      await deleteDoc(doc(db, 'users', currentUser.id, 'staff', id));
      addNotification(`Staff removed.`, 'info');
    } catch (e: any) { addNotification(e.message, "error"); }
  };

  const addPatient = async (patient: Partial<Patient>): Promise<Patient | null> => {
    try {
      const docRef = await addDoc(collection(db, 'patients'), { ...patient, createdBy: currentUser?.id, createdAt: new Date().toISOString() });
      addNotification(`Patient added.`);
      return { id: docRef.id, ...patient } as Patient;
    } catch (e: any) { 
      addNotification(e.message, "error"); 
      return null;
    }
  };

  const addVisit = async (visit: Partial<Visit>) => {
    try {
      await addDoc(collection(db, 'visits'), { ...visit, staffId: currentUser?.id, date: new Date().toISOString() });
      addNotification(`Visit started.`);
    } catch (e: any) { addNotification(e.message, "error"); }
  };

  const updateVisit = async (id: string, updates: Partial<Visit>) => {
    try {
      await updateDoc(doc(db, 'visits', id), updates as any);
      addNotification(`Record updated.`);
    } catch (e: any) { addNotification(e.message, "error"); }
  };

  const addAppointment = async (appointment: Partial<Appointment>) => {
    try {
      await addDoc(collection(db, 'appointments'), { ...appointment, staffId: currentUser?.id });
      addNotification(`Appointment scheduled.`);
    } catch (e: any) { addNotification(e.message, "error"); }
  };

  const addInventoryItem = async (item: Partial<InventoryItem>) => {
    if (!currentUser || currentUser.role !== UserRole.ADMIN) return;
    try {
      await addDoc(collection(db, 'inventory'), item);
      addLog('INVENTORY_ADDED', `Added ${item.name}`);
      addNotification(`Stock item ${item.name} added.`);
    } catch (e: any) { addNotification(e.message, "error"); }
  };

  const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>) => {
    try {
      await updateDoc(doc(db, 'inventory', id), updates as any);
      addNotification(`Stock updated.`);
    } catch (e: any) { addNotification(e.message, "error"); }
  };

  const deleteInventoryItem = async (id: string) => {
    if (!currentUser || currentUser.role !== UserRole.ADMIN) return;
    try {
      await deleteDoc(doc(db, 'inventory', id));
      addNotification(`Stock item removed.`);
    } catch (e: any) { addNotification(e.message, "error"); }
  };

  const dispenseMedication = async (visitId: string, medicineId: string) => {
    try {
      const visitRef = doc(db, 'visits', visitId);
      const visit = visits.find(v => v.id === visitId);
      if (!visit || !visit.prescription) return;

      const newPrescription = visit.prescription.map(p => 
        p.medicineId === medicineId ? { ...p, dispensed: true } : p
      );
      
      await updateDoc(visitRef, { prescription: newPrescription });
      
      const invItem = inventory.find(i => i.id === medicineId);
      if (invItem && invItem.stock > 0) {
        await updateDoc(doc(db, 'inventory', medicineId), { stock: invItem.stock - 1 });
        addLog('MED_DISPENSED', `Dispensed ${invItem.name} for Visit ${visitId}. Stock reduced.`);
      }
      addNotification(`Medication dispensed & stock updated.`);
    } catch (e: any) {
      addNotification(`Dispensing failed: ${e.message}`, "error");
    }
  };

  const sellInventoryItem = async (itemId: string, quantity: number, customerName: string = "Walk-in Customer") => {
    try {
      const invItem = inventory.find(i => i.id === itemId);
      if (!invItem) throw new Error("Item not found");
      if (invItem.stock < quantity) throw new Error("Insufficient stock");

      const totalPrice = invItem.price * quantity;
      
      await updateDoc(doc(db, 'inventory', itemId), { 
        stock: invItem.stock - quantity 
      });

      await addDoc(collection(db, 'visits'), {
        patientId: "OTC-CUSTOMER",
        date: new Date().toISOString(),
        status: 'Completed',
        diagnosis: `OTC Sale to ${customerName}`,
        prescription: [{
          medicineId: itemId,
          medicineName: invItem.name,
          dosage: invItem.dosage,
          duration: "N/A",
          dispensed: true,
          price: totalPrice
        }],
        staffId: currentUser?.id
      });

      addLog('OTC_SALE', `Direct sale: ${quantity}x ${invItem.name} to ${customerName}. Revenue: UGX ${totalPrice.toLocaleString()}`);
      addNotification(`Sale completed for ${invItem.name}.`);
    } catch (e: any) {
      addNotification(`Sale failed: ${e.message}`, "error");
    }
  };

  const addExpense = async (expense: Partial<Expense>) => {
    try {
      await addDoc(collection(db, 'expenses'), {
        ...expense,
        staffId: currentUser?.id,
        staffName: currentUser?.fullName,
        date: expense.date || new Date().toISOString()
      });
      addLog('EXPENSE_ADDED', `Expense recorded: ${expense.description} - UGX ${expense.amount?.toLocaleString()}`);
      addNotification("Daily expense recorded.");
    } catch (e: any) { addNotification(e.message, "error"); }
  };

  const deleteExpense = async (id: string) => {
    if (!currentUser || currentUser.role !== UserRole.ADMIN) return;
    try {
      await deleteDoc(doc(db, 'expenses', id));
      addNotification("Expense record deleted.");
    } catch (e: any) { addNotification(e.message, "error"); }
  };

  return (
    <StoreContext.Provider value={{
      currentUser, users, patients, visits, inventory, auditLogs, appointments, notifications, expenses,
      setCurrentUser, addUser, updateUser, deleteUser, addPatient, addVisit, updateVisit, 
      addLog, addAppointment, addInventoryItem, deleteInventoryItem, updateInventoryItem, 
      dispenseMedication, sellInventoryItem, addNotification, removeNotification, addExpense, deleteExpense
    }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {notifications.map(n => (
          <div 
            key={n.id} 
            className={`pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl animate-in slide-in-from-right-4 duration-300 border-l-4 ${
              n.type === 'success' ? 'bg-white border-emerald-500' :
              n.type === 'error' ? 'bg-white border-rose-500' :
              n.type === 'info' ? 'bg-white border-blue-500' : 'bg-white border-slate-500'
            }`}
          >
            <p className="text-sm font-semibold text-slate-800">{n.message}</p>
            <button onClick={() => removeNotification(n.id)} className="text-slate-300 hover:text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        ))}
      </div>
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
