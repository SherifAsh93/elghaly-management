
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
  salaryAdvance: number; // Note: Ensure this exists in your DB or handle via a separate table
}

export interface Good {
  id: number;
  name: string;
  clientId?: number;
  units: number; // Rabtas
  sheetsPerUnit: number; // Sheets per Rabta
  buyPricePerSheet: number;
  sellPricePerSheet: number;
  type: string;
  code: string;
  rabta: number; 
  numberOfSheetsInRabta: number;
  thickness: number;
  height: number;
  width: number;
  buyPrice: number; // Total buy price or price per rabta
  sellPrice: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Transaction {
  id: number;
  goodId: number;
  quantity: number;
  type: 'sale' | 'purchase';
  date: string;
}
