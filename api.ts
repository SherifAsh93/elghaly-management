import { neon } from "@neondatabase/serverless";
import {
  ProductItem,
  Sale,
  Purchase,
  Client,
  Employee,
  ClientType,
} from "./types";

const CONNECTION_STRING =
  "postgresql://neondb_owner:npg_UdyKDe9VISi3@ep-late-wind-adswy2v6-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const sql = neon(CONNECTION_STRING);

const storage = {
  get: (key: string) => {
    const data = localStorage.getItem(`ghaly_${key}`);
    return data ? JSON.parse(data) : null;
  },
  set: (key: string, data: any) => {
    localStorage.setItem(`ghaly_${key}`, JSON.stringify(data));
  },
};

export const api = {
  initDatabase: async () => {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS inventory (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            code VARCHAR(100) UNIQUE,
            type VARCHAR(100),
            length DECIMAL(10, 2),
            width DECIMAL(10, 2),
            thickness DECIMAL(10, 2),
            origin VARCHAR(100),
            bundles DECIMAL(15, 4) DEFAULT 0,
            boards_per_bundle INTEGER DEFAULT 0,
            buy_price DECIMAL(15, 2),
            sell_price DECIMAL(15, 2)
        );
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS sales (
            id SERIAL PRIMARY KEY,
            invoice_id VARCHAR(50),
            inventory_id INTEGER REFERENCES inventory(id) ON DELETE SET NULL,
            item_name VARCHAR(255),
            quantity DECIMAL(10, 2),
            unit_type VARCHAR(20),
            unit_price DECIMAL(15, 2),
            total_price DECIMAL(15, 2),
            sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            client_name VARCHAR(255)
        );
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS purchases (
            id SERIAL PRIMARY KEY,
            inventory_id INTEGER REFERENCES inventory(id) ON DELETE SET NULL,
            quantity_bundles DECIMAL(15, 4),
            cost DECIMAL(15, 2),
            purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            supplier VARCHAR(255)
        );
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS clients (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) UNIQUE NOT NULL,
            phone VARCHAR(50),
            address TEXT,
            type VARCHAR(20) DEFAULT 'CASH'
        );
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS employees (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) UNIQUE NOT NULL,
            position VARCHAR(100),
            salary DECIMAL(15, 2),
            advances DECIMAL(15, 2) DEFAULT 0
        );
      `;
    } catch (e) {
      console.error("Migration Error:", e);
    }
  },

  // وظيفة لمسح جميع بيانات النظام (للمدير فقط)
  wipeAllData: async () => {
    try {
      await sql`TRUNCATE TABLE sales, purchases, clients, employees, inventory RESTART IDENTITY CASCADE`;
      localStorage.clear();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  inventory: {
    getAll: async (): Promise<ProductItem[]> => {
      try {
        const rows = await sql`SELECT * FROM inventory ORDER BY id DESC`;
        const data = rows.map((r) => ({
          id: r.id.toString(),
          name: r.name,
          code: r.code,
          type: r.type,
          length: Number(r.length),
          width: Number(r.width),
          thickness: Number(r.thickness),
          origin: r.origin,
          bundles: Number(r.bundles),
          boardsPerBundle: Number(r.boards_per_bundle),
          buyPrice: Number(r.buy_price),
          sellPrice: Number(r.sell_price),
        }));
        storage.set("inventory", data);
        return data;
      } catch (e) {
        return storage.get("inventory") || [];
      }
    },
    save: async (item: ProductItem) => {
      await sql`
        INSERT INTO inventory (name, code, type, length, width, thickness, origin, bundles, boards_per_bundle, buy_price, sell_price)
        VALUES (${item.name}, ${item.code}, ${item.type}, ${item.length}, ${item.width}, ${item.thickness}, ${item.origin}, ${item.bundles}, ${item.boardsPerBundle}, ${item.buyPrice}, ${item.sellPrice})
        ON CONFLICT (code) DO UPDATE SET
          name = EXCLUDED.name,
          bundles = EXCLUDED.bundles,
          sell_price = EXCLUDED.sell_price,
          origin = EXCLUDED.origin
      `;
    },
    saveAll: async (items: ProductItem[]) => {
      for (const item of items) {
        await api.inventory.save(item);
      }
    },
    delete: async (id: string) => {
      await sql`DELETE FROM inventory WHERE id = ${parseInt(id)}`;
    },
  },

  sales: {
    getAll: async (): Promise<Sale[]> => {
      try {
        const rows = await sql`SELECT * FROM sales ORDER BY sale_date DESC`;
        return rows.map((r) => ({
          id: r.id.toString(),
          invoiceId: r.invoice_id || r.id.toString(),
          itemId: r.inventory_id?.toString() || "",
          itemName: r.item_name,
          quantity: Number(r.quantity),
          unitType: r.unit_type as "bundle" | "board",
          unitPrice: Number(r.unit_price),
          totalPrice: Number(r.total_price),
          date: r.sale_date,
          clientName: r.client_name,
        }));
      } catch (e) {
        return storage.get("sales") || [];
      }
    },
    add: async (sale: Sale) => {
      await sql`
        INSERT INTO sales (invoice_id, inventory_id, item_name, quantity, unit_type, unit_price, total_price, client_name)
        VALUES (${sale.invoiceId}, ${parseInt(sale.itemId) || null}, ${sale.itemName}, ${sale.quantity}, ${sale.unitType}, ${sale.unitPrice}, ${sale.totalPrice}, ${sale.clientName})
      `;
    },
    delete: async (id: string) => {
      await sql`DELETE FROM sales WHERE id = ${parseInt(id)}`;
    },
    saveAll: async (sales: Sale[]) => {
      storage.set("sales", sales);
    },
  },

  clients: {
    getAll: async (): Promise<Client[]> => {
      try {
        const rows = await sql`SELECT * FROM clients ORDER BY name ASC`;
        return rows.map((r) => ({
          id: r.id.toString(),
          name: r.name,
          phone: r.phone,
          address: r.address,
          type: (r.type as ClientType) || ClientType.CASH,
        }));
      } catch (e) {
        return storage.get("clients") || [];
      }
    },
    save: async (client: Client) => {
      await sql`
        INSERT INTO clients (name, phone, address, type) 
        VALUES (${client.name}, ${client.phone}, ${client.address}, ${client.type}) 
        ON CONFLICT (name) DO UPDATE SET 
          phone = EXCLUDED.phone, 
          address = EXCLUDED.address,
          type = EXCLUDED.type
      `;
    },
    saveAll: async (clients: Client[]) => {
      for (const c of clients) await api.clients.save(c);
    },
    delete: async (id: string) => {
      await sql`DELETE FROM clients WHERE id = ${parseInt(id)}`;
    },
  },

  employees: {
    getAll: async (): Promise<Employee[]> => {
      try {
        const rows = await sql`SELECT * FROM employees ORDER BY name ASC`;
        return rows.map((r) => ({
          id: r.id.toString(),
          name: r.name,
          position: r.position,
          salary: Number(r.salary),
          advances: Number(r.advances),
        }));
      } catch (e) {
        return storage.get("employees") || [];
      }
    },
    save: async (emp: Employee) => {
      await sql`INSERT INTO employees (name, position, salary, advances) VALUES (${emp.name}, ${emp.position}, ${emp.salary}, ${emp.advances}) ON CONFLICT (name) DO UPDATE SET position = EXCLUDED.position, salary = EXCLUDED.salary, advances = EXCLUDED.advances`;
    },
    saveAll: async (employees: Employee[]) => {
      for (const e of employees) await api.employees.save(e);
    },
    delete: async (id: string) => {
      await sql`DELETE FROM employees WHERE id = ${parseInt(id)}`;
    },
  },

  purchases: {
    getAll: async (): Promise<Purchase[]> => {
      try {
        const rows =
          await sql`SELECT * FROM purchases ORDER BY purchase_date DESC`;
        return rows.map((r) => ({
          id: r.id.toString(),
          itemId: r.inventory_id?.toString() || "",
          quantityBundles: Number(r.quantity_bundles),
          cost: Number(r.cost),
          date: r.purchase_date,
          supplier: r.supplier,
        }));
      } catch (e) {
        return [];
      }
    },
    add: async (p: Purchase) => {
      await sql`INSERT INTO purchases (inventory_id, quantity_bundles, cost, supplier) VALUES (${parseInt(p.itemId)}, ${p.quantityBundles}, ${p.cost}, ${p.supplier})`;
    },
    delete: async (id: string) => {
      await sql`DELETE FROM purchases WHERE id = ${parseInt(id)}`;
    },
  },
};
