import { db } from "../lib/db";
import {
  ProductItem,
  Client,
  Employee,
  Sale,
  Purchase,
  Expense,
  ClientPayment,
} from "../types";

export const api = {
  inventory: {
    async getAll() {
      const rows = await db.query<any>(
        "SELECT * FROM inventory ORDER BY name ASC",
      );
      return rows.map((r) => ({
        ...r,
        origin: r.origin || null,
        boardsPerBundle: parseInt(r.boards_per_bundle || 0),
        remainingBoards: parseInt(r.remaining_boards || 0),
        bundles: parseInt(r.bundles || 0),
        buyPrice: parseFloat(r.buy_price || 0),
        sellPrice: parseFloat(r.sell_price || 0),
        length: parseFloat(r.length || 0),
        width: parseFloat(r.width || 0),
        thickness: parseFloat(r.thickness || 0),
      })) as ProductItem[];
    },
    async create(p: Omit<ProductItem, "id">) {
      const id = `p_${Math.random().toString(36).substr(2, 9)}`;
      await db.query(
        "INSERT INTO inventory (id, name, code, type, origin, length, width, thickness, bundles, boards_per_bundle, remaining_boards, buy_price, sell_price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)",
        [
          id,
          p.name,
          p.code,
          p.type,
          p.origin || null,
          p.length,
          p.width,
          p.thickness,
          p.bundles,
          p.boardsPerBundle,
          p.remainingBoards,
          p.buyPrice,
          p.sellPrice,
        ],
      );
      return { ...p, id };
    },
    async update(id: string, p: Partial<ProductItem>) {
      const sets: string[] = [];
      const vals: any[] = [];
      let i = 1;
      if (p.name !== undefined) {
        sets.push(`name = $${i++}`);
        vals.push(p.name);
      }
      if (p.origin !== undefined) {
        sets.push(`origin = $${i++}`);
        vals.push(p.origin || null);
      }
      if (p.sellPrice !== undefined) {
        sets.push(`sell_price = $${i++}`);
        vals.push(p.sellPrice);
      }
      if (p.buyPrice !== undefined) {
        sets.push(`buy_price = $${i++}`);
        vals.push(p.buyPrice);
      }
      if (p.bundles !== undefined) {
        sets.push(`bundles = $${i++}`);
        vals.push(p.bundles);
      }
      if (p.boardsPerBundle !== undefined) {
        sets.push(`boards_per_bundle = $${i++}`);
        vals.push(p.boardsPerBundle);
      }
      if (p.remainingBoards !== undefined) {
        sets.push(`remaining_boards = $${i++}`);
        vals.push(p.remainingBoards);
      }
      if (p.code !== undefined) {
        sets.push(`code = $${i++}`);
        vals.push(p.code);
      }
      vals.push(id);
      await db.query(
        `UPDATE inventory SET ${sets.join(", ")} WHERE id = $${i}`,
        vals,
      );
    },
    async delete(id: string) {
      await db.query("DELETE FROM inventory WHERE id = $1", [id]);
    },
  },
  clients: {
    async getAll() {
      const rows = await db.query<any>(
        "SELECT * FROM clients ORDER BY name ASC",
      );
      return rows.map((r) => ({
        ...r,
        balance: parseFloat(r.balance || 0),
      })) as Client[];
    },
    async create(c: Omit<Client, "id">) {
      const id = `c_${Math.random().toString(36).substr(2, 9)}`;
      await db.query(
        "INSERT INTO clients (id, name, phone, address, type, balance) VALUES ($1, $2, $3, $4, $5, $6)",
        [id, c.name, c.phone, c.address, c.type, c.balance],
      );
      return { ...c, id };
    },
    async update(id: string, c: Partial<Client>) {
      const sets: string[] = [];
      const vals: any[] = [];
      let i = 1;
      if (c.balance !== undefined) {
        sets.push(`balance = $${i++}`);
        vals.push(c.balance);
      }
      vals.push(id);
      await db.query(
        `UPDATE clients SET ${sets.join(", ")} WHERE id = $${i}`,
        vals,
      );
    },
    async delete(id: string) {
      try {
        await db.query("DELETE FROM clients WHERE id = $1", [id]);
      } catch (error) {
        console.error("Error deleting client:", error);
        throw new Error(
          "Cannot delete client - they may have related payments or sales",
        );
      }
    },
  },
  payments: {
    async getAll() {
      const rows = await db.query<any>(
        "SELECT * FROM payments ORDER BY date DESC",
      );
      return rows.map((r) => ({
        ...r,
        clientId: r.client_id,
        amount: parseFloat(r.amount || 0),
      })) as ClientPayment[];
    },
    async create(p: Omit<ClientPayment, "id" | "date">) {
      const id = `pay_${Math.random().toString(36).substr(2, 9)}`;
      await db.query(
        "INSERT INTO payments (id, client_id, amount, note) VALUES ($1, $2, $3, $4)",
        [id, p.clientId, p.amount, p.note],
      );
      return { ...p, id, date: new Date().toISOString() };
    },
    async delete(id: string) {
      await db.query("DELETE FROM payments WHERE id = $1", [id]);
    },
  },
  sales: {
    async getAll() {
      const rows = await db.query<any>(
        "SELECT * FROM sales ORDER BY date DESC",
      );
      return rows.map((r) => ({
        ...r,
        clientId: r.client_id,
        clientName: r.client_name,
        totalAmount: parseFloat(r.total_amount || 0),
        discount: parseFloat(r.discount || 0),
        finalAmount: parseFloat(r.final_amount || 0),
        paidAmount: parseFloat(r.paid_amount || 0),
        items:
          typeof r.items === "string" ? JSON.parse(r.items) : r.items || [],
      })) as Sale[];
    },
    async create(s: Omit<Sale, "id" | "date">) {
      const id = `s_${Math.random().toString(36).substr(2, 9)}`;
      await db.query(
        "INSERT INTO sales (id, client_id, client_name, total_amount, discount, final_amount, paid_amount, items, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
        [
          id,
          s.clientId,
          s.clientName,
          s.totalAmount,
          s.discount,
          s.finalAmount,
          s.paidAmount,
          JSON.stringify(s.items),
          s.status,
        ],
      );

      // Update inventory stock based on bundles and boards
      for (const item of s.items) {
        const prodRows = await db.query<any>(
          "SELECT * FROM inventory WHERE id = $1",
          [item.productId],
        );
        const prod = prodRows[0];
        if (prod) {
          let currentBundles = parseInt(prod.bundles || 0);
          let currentRemaining = parseInt(prod.remaining_boards || 0);
          const boardsPerBundle = parseInt(prod.boards_per_bundle || 1);

          currentBundles -= item.bundlesQuantity;
          currentRemaining -= item.boardsQuantity;

          // Logic to break a bundle if remaining boards go negative
          while (currentRemaining < 0 && currentBundles > 0) {
            currentBundles -= 1;
            currentRemaining += boardsPerBundle;
          }

          await db.query(
            "UPDATE inventory SET bundles = $1, remaining_boards = $2 WHERE id = $3",
            [currentBundles, currentRemaining, item.productId],
          );
        }
      }

      await db.query(
        "UPDATE clients SET balance = balance + $1 WHERE id = $2",
        [s.finalAmount - s.paidAmount, s.clientId],
      );
      return { ...s, id, date: new Date().toISOString() };
    },
    async delete(id: string) {
      await db.query("DELETE FROM sales WHERE id = $1", [id]);
    },
  },
  purchases: {
    async getAll() {
      const rows = await db.query<any>(
        "SELECT * FROM purchases ORDER BY date DESC",
      );
      return rows.map((r) => ({
        ...r,
        productId: r.product_id,
        supplierName: r.supplier_name,
        itemName: r.item_name,
        quantity: parseFloat(r.quantity || 0),
        unitPrice: parseFloat(r.unit_price || 0),
        totalPrice: parseFloat(r.total_price || 0),
        date: r.date,
      })) as Purchase[];
    },
    async create(p: Omit<Purchase, "id" | "date">) {
      const id = `pur_${Math.random().toString(36).substr(2, 9)}`;
      await db.query(
        "INSERT INTO purchases (id, product_id, supplier_name, item_name, quantity, unit_price, total_price) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [
          id,
          p.productId,
          p.supplierName,
          p.itemName,
          p.quantity,
          p.unitPrice,
          p.totalPrice,
        ],
      );
      return { ...p, id, date: new Date().toISOString() };
    },
    async delete(id: string) {
      await db.query("DELETE FROM purchases WHERE id = $1", [id]);
    },
  },
  employees: {
    async getAll() {
      const rows = await db.query<any>(
        "SELECT * FROM employees ORDER BY name ASC",
      );
      return rows.map((r) => ({
        ...r,
        monthlySalary: parseFloat(r.monthly_salary || 0),
        advances: parseFloat(r.advances || 0),
        joinDate: r.join_date,
      })) as Employee[];
    },
    async create(e: Omit<Employee, "id">) {
      const id = `e_${Math.random().toString(36).substr(2, 9)}`;
      await db.query(
        "INSERT INTO employees (id, name, position, monthly_salary, advances, join_date) VALUES ($1, $2, $3, $4, $5, $6)",
        [id, e.name, e.position, e.monthlySalary, e.advances, e.joinDate],
      );
      return { ...e, id };
    },
    async updateAdvances(id: string, amount: number) {
      await db.query(
        "UPDATE employees SET advances = advances + $1 WHERE id = $2",
        [amount, id],
      );
    },
    async delete(id: string) {
      await db.query("DELETE FROM employees WHERE id = $1", [id]);
    },
  },
  expenses: {
    async getAll() {
      const rows = await db.query<any>(
        "SELECT * FROM expenses ORDER BY date DESC",
      );
      return rows.map((r) => ({
        ...r,
        amount: parseFloat(r.amount || 0),
      })) as Expense[];
    },
    async create(e: Omit<Expense, "id" | "date" | "category">) {
      try {
        console.log("API: Starting expense creation...");
        const id = `ex_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();
        console.log("API: Creating expense with data:", {
          id,
          ...e,
          date: now,
        });

        const query =
          "INSERT INTO expenses (id, description, amount, date) VALUES ($1, $2, $3, $4)";
        const params = [id, e.description, e.amount, now];
        console.log("API: Query:", query);
        console.log("API: Params:", params);

        const result = await db.query(query, params);
        console.log("API: Query result:", result);

        console.log("API: Expense created successfully");
        return { ...e, id, date: now };
      } catch (error) {
        console.error("API: Error creating expense:", error);
        throw error;
      }
    },
    async delete(id: string) {
      await db.query("DELETE FROM expenses WHERE id = $1", [id]);
    },
  },
};
