
export enum UserRole {
  ADMIN = 'ADMIN',
  DOCTOR = 'DOCTOR',
  NURSE = 'NURSE',
  LAB = 'LAB',
  RECEPTION_PHARMACY = 'RECEPTION_PHARMACY'
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  department: string;
  active: boolean;
  lastLogin?: string;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string;
  address: string;
  bloodType?: string;
  allergies?: string[];
  createdAt: string;
}

export interface LabTestResult {
  parameter: string;
  value: string;
  unit: string;
  normalRange: string;
}

export interface Visit {
  id: string;
  patientId: string;
  date: string;
  status: 'Checked-In' | 'With-Nurse' | 'With-Doctor' | 'Lab-Pending' | 'Pharmacy-Pending' | 'Completed';
  vitals?: {
    bp: string;
    temperature: string;
    pulse: string;
    weight: string;
    height: string;
    oxygenSat?: string;
    respiratoryRate?: string;
  };
  
  nurseNotes?: string;
  fluidBalance?: Array<{
    timestamp: string;
    intake: string;
    output: string;
    remarks: string;
  }>;
  administeredMeds?: Array<{
    medicineName: string;
    timestamp: string;
    dosage: string;
    route?: string;
    givenBy: string;
  }>;
  
  presentingComplaints?: string;
  historyOfPresentingComplaints?: string;
  physicalExamFindings?: string;
  systematicReview?: {
    ent?: string;
    cvs?: string;
    cns?: string;
    git?: string; // Abdominal Review
    rs?: string;  // Respiratory
    general?: string;
  };
  diagnosis?: string;
  plan?: string;
  nextReviewDate?: string;
  consultationFee?: number;
  
  additionalCharges?: Array<{
    description: string;
    amount: number;
  }>;
  
  prescription?: Array<{
    medicineId: string;
    medicineName: string;
    dosage: string;
    route?: string;
    duration: string;
    dispensed: boolean;
    price: number;
    quantity?: number; // Added for sales tracking
  }>;
  labRequests?: Array<{
    id: string;
    testName: string;
    status: 'Pending' | 'Completed';
    result?: string;
    structuredResults?: LabTestResult[];
    price: number;
    requestedBy: string;
    resultDate?: string;
  }>;
  staffId: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  price: number;
  dosage: string;
  route: string;
  expiryDate: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  staffId: string;
  staffName: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  details: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  dateTime: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}
