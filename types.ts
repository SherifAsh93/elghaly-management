export type UserRole = "ADMIN" | "SALES";

export interface User {
  username: string;
  role: UserRole;
}

export interface ProductItem {
  id: string;
  name: string;
  code: string;
  type: string;
  origin: string | null;
  length: number;
  width: number;
  thickness: number;
  bundles: number;
  boardsPerBundle: number;
  remainingBoards: number;
  buyPrice: number;
  sellPrice: number;
}

export type PaymentType = "CASH" | "CREDIT";

export interface Client {
  id: string;
  name: string;
  phone: string;
  address: string;
  type: PaymentType;
  balance: number;
}

export interface ClientPayment {
  id: string;
  clientId: string;
  amount: number;
  date: string;
  note: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  bundlesQuantity: number; // عدد الربطات المباعة
  boardsQuantity: number; // عدد الألواح المباعة (فوق الربطات)
  boardsPerBundle: number; // مخزن للعملية الحسابية
  unitPrice: number; // سعر اللوح الواحد
  totalPrice: number;
}

export interface Sale {
  id: string;
  clientId: string;
  clientName: string;
  items: SaleItem[];
  totalAmount: number;
  discount: number;
  finalAmount: number;
  paidAmount: number;
  date: string;
  status: "PAID" | "PARTIAL" | "UNPAID";
}

export interface Purchase {
  id: string;
  productId?: string;
  supplierName: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  date: string;
}

export interface Employee {
  id: string;
  name: string;
  position: string;
  monthlySalary: number;
  advances: number;
  joinDate: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
}

export interface AppState {
  products: ProductItem[];
  clients: Client[];
  sales: Sale[];
  purchases: Purchase[];
  employees: Employee[];
  expenses: Expense[];
  payments: ClientPayment[];
}
