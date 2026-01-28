
export enum UserRole {
  ADMIN = 'ADMIN',
  SALES = 'SALES'
}

export enum ClientType {
  CASH = 'CASH',
  CREDIT = 'CREDIT'
}

export interface ProductItem {
  id: string;
  name: string;
  code: string;
  type: string;
  length: number;
  width: number;
  thickness: number;
  origin: string;
  bundles: number;
  boardsPerBundle: number;
  buyPrice: number;
  sellPrice: number;
}

export interface Purchase {
  id: string;
  itemId: string;
  quantityBundles: number;
  cost: number;
  date: string;
  supplier: string;
}

export interface Sale {
  id: string;
  invoiceId: string; // الحقل الجديد لربط الأصناف ببعضها في فاتورة واحدة
  itemId: string;
  itemName: string;
  quantity: number;
  unitType: 'bundle' | 'board';
  unitPrice: number;
  totalPrice: number;
  date: string;
  clientName: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  address: string;
  type: ClientType; // نوع العميل: كاش أو آجل
}

export interface Employee {
  id: string;
  name: string;
  position: string;
  salary: number;
  advances: number;
}
