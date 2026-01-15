
export type ClientType = 'Cash' | 'Credit';

export interface Client {
  id: number;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  type: ClientType;
  createdAt?: string;
  updatedAt?: string;
}

export interface Employee {
  id: number;
  name: string;
  role: string;
  phone: string;
  salary: number; // Base Salary
  salaryAdvance: number;
}

export interface Good {
  id: number;
  name: string;
  clientId?: number;
  units: number;
  sheetsPerUnit: number;
  buyPricePerSheet: number;
  sellPricePerSheet: number;
  type: string;
  code: string;
  rabta: number; 
  numberOfSheetsInRabta: number;
  thickness: number;
  height: number;
  width: number;
  buyPrice: number;
  sellPrice: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Sale {
  id: number;
  good_id: number;
  client_id: number;
  good_name: string;
  client_name: string;
  quantity: number;
  unit_type: 'bundle' | 'sheet';
  price_per_unit: number;
  total_price: number;
  created_at: string;
}

export interface Transaction {
  id: number;
  goodId: number;
  quantity: number;
  type: 'sale' | 'purchase';
  date: string;
}
