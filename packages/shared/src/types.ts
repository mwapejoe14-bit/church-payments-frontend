export type UserRole = "user" | "admin";
export type PaymentType =
  | "tithe"
  | "offering"
  | "special"
  | "school"
  | "uniform"
  | "lunch"
  | "bus";
export type Provider = "MTN" | "Airtel" | "Zamtel";
export type TxStatus = "pending" | "success" | "failed";
export type MemberType = "church" | "pta" | "both";
export type ApprovalStatus = "pending" | "approved" | "rejected";
export type Term = "term1" | "term2" | "term3";
export type FeeType = "school" | "uniform" | "lunch" | "bus";
export type BatchStatus = "pending" | "partial" | "success" | "failed";

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  memberType?: MemberType;
  preferredProvider?: Provider | null;
  approvalStatus?: ApprovalStatus;
  childrenIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Child {
  _id: string;
  name: string;
  studentNumber: string;
  grade: number;
  parents: string[] | User[];
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface FeeItem {
  type: FeeType;
  amount: number;
}

export interface FeeStructure {
  _id: string;
  grade: number;
  term: Term;
  year: number;
  fees: FeeItem[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  name: string;
  score: number;
  grade: string;
}

export interface Result {
  _id: string;
  childId: string | Pick<Child, "_id" | "name" | "grade" | "studentNumber">;
  term: Term;
  year: number;
  subjects: Subject[];
  average: number;
  position?: number;
  teacherRemarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  _id: string;
  userId:
    | string
    | {
        _id: string;
        name: string;
        email: string;
        phone: string;
      };
  amount: number;
  type: PaymentType;
  category: "church" | "pta";
  childId?: string | Pick<Child, "_id" | "name" | "grade">;
  batchId?: string | null;
  term?: Term | null;
  year?: number | null;
  provider: Provider;
  phoneNumber: string;
  status: TxStatus;
  transactionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentBatch {
  _id: string;
  userId: string;
  childId: string;
  batchId: string;
  term: Term;
  year: number;
  transactionIds: string[] | Transaction[];
  totalAmount: number;
  status: BatchStatus;
  provider: Provider;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthPayload {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  approvalStatus?: ApprovalStatus;
  memberType?: MemberType;
  token: string;
}

export interface ApiSuccess<T> {
  success: true;
  message?: string;
  count?: number;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: UserRole;
}

export interface ExtendedRegisterPayload extends RegisterPayload {
  memberType?: MemberType;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface PaymentPayload {
  amount: number;
  type: PaymentType;
  provider: Provider;
  phoneNumber: string;
  childId?: string;
  term?: Term;
  year?: number;
}

export interface BatchPaymentPayload {
  childId: string;
  term: Term;
  year: number;
  provider: Provider;
  phoneNumber: string;
  items: { type: FeeType; amount: number }[];
}

export interface DashboardSummary {
  totalTransactions: number;
  totalAmount: number;
  totalTithes: number;
  totalOfferings: number;
  totalPTA: number;
  recentTransactions?: Transaction[];
}

export interface MonthlyReport {
  month: string;
  year: number;
  totalAmount: number;
  breakdown: {
    tithe: number;
    offering: number;
    pta: number;
  };
}

export interface ReportRow {
  _id: string;
  total: number;
  count: number;
  type?: PaymentType;
  provider?: Provider;
}