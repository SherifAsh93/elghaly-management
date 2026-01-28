import {
  ProductItem,
  Sale,
  Purchase,
  Client,
  Employee,
  ClientType,
} from "./types";

let neon: any = null;
let connectionError = false;

// Lazy load neon to prevent initialization errors
const loadNeon = async () => {
  if (!neon && !connectionError) {
    try {
      const { neon: neonImport } = await import("@neondatabase/serverless");
      neon = neonImport;
    } catch (e) {
      console.warn("[v0] Failed to load Neon:", e);
      connectionError = true;
    }
  }
  return neon;
};

const CONNECTION_STRING = import.meta.env.VITE_DATABASE_URL || 
  "postgresql://neondb_owner:npg_UdyKDe9VISi3@ep-late-wind-adswy2v6-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

let sql: any = null;

// Initialize database connection safely with lazy initialization
const initConnection = async () => {
  if (connectionError) return null;
  
  if (!sql) {
    try {
      const neonFn = await loadNeon();
      if (!neonFn) return null;
      sql = neonFn(CONNECTION_STRING);
      console.log("[v0] Database connection initialized successfully");
    } catch (e) {
      console.warn("[v0] Database connection failed, using localStorage fallback:", e);
      connectionError = true;
      return null;
    }
  }
  return sql;
};

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
    // For now, we'll use localStorage as the primary storage
    // Database connection will be initialized asynchronously in the background
    console.log("[v0] Initializing app with localStorage storage");
    
    try {
      const connection = await initConnection();
      if (connection) {
        console.log("[v0] Database connection established");
        // Optional: Create tables if needed, but don't block initialization
        try {
          await connection`
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
        } catch (e) {
          console.warn("[v0] Could not create tables:", e);
        }
      }
    } catch (e) {
      console.warn("[v0] Database setup warning:", e);
    }
  },

  // وظيفة لمسح جميع بيانات النظام (للمدير فقط)
  wipeAllData: async () => {
    const connection = await initConnection();
    if (!connection) {
      localStorage.clear();
      return true;
    }
    
    try {
      await connection`TRUNCATE TABLE sales, purchases, clients, employees, inventory RESTART IDENTITY CASCADE`;
      localStorage.clear();
      return true;
    } catch (e) {
      console.warn("[v0] Wipe data warning:", e);
      localStorage.clear();
      return true;
    }
  },

  inventory: {
    getAll: async (): Promise<ProductItem[]> => {
      const connection = await initConnection();
      if (!connection) {
        return storage.get("inventory") || [];
      }
      
      try {
        const rows = await connection`SELECT * FROM inventory ORDER BY id DESC`;
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
      const connection = await initConnection();
      if (!connection) {
        const items = storage.get("inventory") || [];
        const index = items.findIndex((i: any) => i.code === item.code);
        if (index !== -1) items[index] = item;
        else items.push(item);
        storage.set("inventory", items);
        return;
      }
      
      try {
        await connection`
          INSERT INTO inventory (name, code, type, length, width, thickness, origin, bundles, boards_per_bundle, buy_price, sell_price)
          VALUES (${item.name}, ${item.code}, ${item.type}, ${item.length}, ${item.width}, ${item.thickness}, ${item.origin}, ${item.bundles}, ${item.boardsPerBundle}, ${item.buyPrice}, ${item.sellPrice})
          ON CONFLICT (code) DO UPDATE SET
            name = EXCLUDED.name,
            bundles = EXCLUDED.bundles,
            sell_price = EXCLUDED.sell_price,
            origin = EXCLUDED.origin
        `;
      } catch (e) {
        console.warn("[v0] Inventory save warning:", e);
      }
    },
    saveAll: async (items: ProductItem[]) => {
      for (const item of items) {
        await api.inventory.save(item);
      }
    },
    delete: async (id: string) => {
      const connection = await initConnection();
      if (!connection) {
        const items = storage.get("inventory") || [];
        storage.set("inventory", items.filter((i: any) => i.id !== id));
        return;
      }
      
      try {
        await connection`DELETE FROM inventory WHERE id = ${parseInt(id)}`;
      } catch (e) {
        console.warn("[v0] Inventory delete warning:", e);
      }
    },
  },

  sales: {
    getAll: async (): Promise<Sale[]> => {
      const connection = await initConnection();
      if (!connection) {
        return storage.get("sales") || [];
      }
      
      try {
        const rows = await connection`SELECT * FROM sales ORDER BY sale_date DESC`;
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
      const connection = await initConnection();
      if (!connection) {
        const sales = storage.get("sales") || [];
        sales.push(sale);
        storage.set("sales", sales);
        return;
      }
      
      try {
        await connection`
          INSERT INTO sales (invoice_id, inventory_id, item_name, quantity, unit_type, unit_price, total_price, client_name)
          VALUES (${sale.invoiceId}, ${parseInt(sale.itemId) || null}, ${sale.itemName}, ${sale.quantity}, ${sale.unitType}, ${sale.unitPrice}, ${sale.totalPrice}, ${sale.clientName})
        `;
      } catch (e) {
        console.warn("[v0] Sales add warning:", e);
      }
    },
    delete: async (id: string) => {
      const connection = await initConnection();
      if (!connection) {
        const sales = storage.get("sales") || [];
        storage.set("sales", sales.filter((s: any) => s.id !== id));
        return;
      }
      
      try {
        await connection`DELETE FROM sales WHERE id = ${parseInt(id)}`;
      } catch (e) {
        console.warn("[v0] Sales delete warning:", e);
      }
    },
    saveAll: async (sales: Sale[]) => {
      storage.set("sales", sales);
    },
  },

  clients: {
    getAll: async (): Promise<Client[]> => {
      const connection = await initConnection();
      if (!connection) {
        return storage.get("clients") || [];
      }
      
      try {
        const rows = await connection`SELECT * FROM clients ORDER BY name ASC`;
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
      const connection = await initConnection();
      if (!connection) {
        const clients = storage.get("clients") || [];
        const index = clients.findIndex((c: any) => c.name === client.name);
        if (index !== -1) clients[index] = client;
        else clients.push(client);
        storage.set("clients", clients);
        return;
      }
      
      try {
        await connection`
          INSERT INTO clients (name, phone, address, type) 
          VALUES (${client.name}, ${client.phone}, ${client.address}, ${client.type}) 
          ON CONFLICT (name) DO UPDATE SET 
            phone = EXCLUDED.phone, 
            address = EXCLUDED.address,
            type = EXCLUDED.type
        `;
      } catch (e) {
        console.warn("[v0] Clients save warning:", e);
      }
    },
    saveAll: async (clients: Client[]) => {
      for (const c of clients) await api.clients.save(c);
    },
    delete: async (id: string) => {
      const connection = await initConnection();
      if (!connection) {
        const clients = storage.get("clients") || [];
        storage.set("clients", clients.filter((c: any) => c.id !== id));
        return;
      }
      
      try {
        await connection`DELETE FROM clients WHERE id = ${parseInt(id)}`;
      } catch (e) {
        console.warn("[v0] Clients delete warning:", e);
      }
    },
  },

  employees: {
    getAll: async (): Promise<Employee[]> => {
      const connection = await initConnection();
      if (!connection) {
        return storage.get("employees") || [];
      }
      
      try {
        const rows = await connection`SELECT * FROM employees ORDER BY name ASC`;
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
      const connection = await initConnection();
      if (!connection) {
        const employees = storage.get("employees") || [];
        const index = employees.findIndex((e: any) => e.name === emp.name);
        if (index !== -1) employees[index] = emp;
        else employees.push(emp);
        storage.set("employees", employees);
        return;
      }
      
      try {
        await connection`INSERT INTO employees (name, position, salary, advances) VALUES (${emp.name}, ${emp.position}, ${emp.salary}, ${emp.advances}) ON CONFLICT (name) DO UPDATE SET position = EXCLUDED.position, salary = EXCLUDED.salary, advances = EXCLUDED.advances`;
      } catch (e) {
        console.warn("[v0] Employees save warning:", e);
      }
    },
    saveAll: async (employees: Employee[]) => {
      for (const e of employees) await api.employees.save(e);
    },
    delete: async (id: string) => {
      const connection = await initConnection();
      if (!connection) {
        const employees = storage.get("employees") || [];
        storage.set("employees", employees.filter((e: any) => e.id !== id));
        return;
      }
      
      try {
        await connection`DELETE FROM employees WHERE id = ${parseInt(id)}`;
      } catch (e) {
        console.warn("[v0] Employees delete warning:", e);
      }
    },
  },

  purchases: {
    getAll: async (): Promise<Purchase[]> => {
      const connection = await initConnection();
      if (!connection) {
        return storage.get("purchases") || [];
      }
      
      try {
        const rows = await connection`SELECT * FROM purchases ORDER BY purchase_date DESC`;
        return rows.map((r) => ({
          id: r.id.toString(),
          itemId: r.inventory_id?.toString() || "",
          quantityBundles: Number(r.quantity_bundles),
          cost: Number(r.cost),
          date: r.purchase_date,
          supplier: r.supplier,
        }));
      } catch (e) {
        return storage.get("purchases") || [];
      }
    },
    add: async (p: Purchase) => {
      const connection = await initConnection();
      if (!connection) {
        const purchases = storage.get("purchases") || [];
        purchases.push(p);
        storage.set("purchases", purchases);
        return;
      }
      
      try {
        await connection`INSERT INTO purchases (inventory_id, quantity_bundles, cost, supplier) VALUES (${parseInt(p.itemId)}, ${p.quantityBundles}, ${p.cost}, ${p.supplier})`;
      } catch (e) {
        console.warn("[v0] Purchases add warning:", e);
      }
    },
    delete: async (id: string) => {
      const connection = await initConnection();
      if (!connection) {
        const purchases = storage.get("purchases") || [];
        storage.set("purchases", purchases.filter((p: any) => p.id !== id));
        return;
      }
      
      try {
        await connection`DELETE FROM purchases WHERE id = ${parseInt(id)}`;
      } catch (e) {
        console.warn("[v0] Purchases delete warning:", e);
      }
    },
  },
};
