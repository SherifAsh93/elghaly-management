import { neon } from "@neondatabase/serverless";

const connectionString =
  "postgresql://neondb_owner:npg_UdyKDe9VISi3@ep-late-wind-adswy2v6-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require";

// إنشاء كائن الاتصال
export const sql = neon(connectionString);

export const db = {
  async query<T>(queryStr: string, params: any[] = []): Promise<T[]> {
    try {
      // استخدام sql.query بدلاً من مناداة sql كدالة مباشرة للمتغيرات
      const result = await (sql as any).query(queryStr, params);

      // التأكد من إرجاع مصفوفة دائماً لتجنب خطأ .map() في الخدمات
      if (!result) return [] as T[];

      // إذا كانت النتيجة كائن يحتوي على صفوف (بنية pg القياسية)
      if (result.rows && Array.isArray(result.rows)) {
        return result.rows as T[];
      }

      // إذا كانت النتيجة مصفوفة مباشرة (بنية neon المبسطة)
      if (Array.isArray(result)) {
        return result as T[];
      }

      return [] as T[];
    } catch (error: any) {
      console.error("Database Error:", error);
      return [] as T[];
    }
  },

  // Function to recreate expenses table if needed
  async recreateExpensesTable() {
    try {
      console.log("Recreating expenses table without category...");

      // Check if table exists first
      const existingTable = await sql`SELECT * FROM expenses LIMIT 1`;
      console.log("Existing expenses table data:", existingTable);

      // Drop existing table
      console.log("Dropping expenses table...");
      await sql`DROP TABLE IF EXISTS expenses`;
      console.log("Expenses table dropped");

      // Create new table without category
      console.log("Creating new expenses table without category...");
      await sql`
        CREATE TABLE expenses (
          id TEXT PRIMARY KEY,
          description TEXT,
          amount DECIMAL DEFAULT 0,
          date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      console.log("New expenses table created without category");

      // Verify table was created
      const verification = await sql`SELECT * FROM expenses LIMIT 1`;
      console.log("Table verification result:", verification);

      console.log("Expenses table recreated successfully without category");
    } catch (error) {
      console.error("Error recreating expenses table:", error);
    }
  },

  async init() {
    console.log("Initializing/Migrating database schema...");
    try {
      // Tagged templates مازالت تعمل بشكل طبيعي لإنشاء الجداول

      // 1. Inventory Table
      await sql`
        CREATE TABLE IF NOT EXISTS inventory (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          code TEXT NOT NULL,
          type TEXT,
          origin TEXT,
          length DECIMAL DEFAULT 0,
          width DECIMAL DEFAULT 0,
          thickness DECIMAL DEFAULT 0,
          bundles INTEGER DEFAULT 0,
          boards_per_bundle INTEGER DEFAULT 0,
          remaining_boards INTEGER DEFAULT 0,
          buy_price DECIMAL DEFAULT 0,
          sell_price DECIMAL DEFAULT 0
        )
      `;

      // 2. Clients Table
      await sql`
        CREATE TABLE IF NOT EXISTS clients (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          phone TEXT,
          address TEXT,
          type TEXT,
          balance DECIMAL DEFAULT 0
        )
      `;

      // 3. Payments Table
      await sql`
        CREATE TABLE IF NOT EXISTS payments (
          id TEXT PRIMARY KEY,
          client_id TEXT REFERENCES clients(id),
          amount DECIMAL DEFAULT 0,
          note TEXT,
          date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      try {
        await sql`ALTER TABLE payments ADD COLUMN IF NOT EXISTS date TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;
      } catch (e) {}

      // 4. Sales Table
      await sql`
        CREATE TABLE IF NOT EXISTS sales (
          id TEXT PRIMARY KEY,
          client_id TEXT REFERENCES clients(id),
          client_name TEXT,
          total_amount DECIMAL DEFAULT 0,
          discount DECIMAL DEFAULT 0,
          final_amount DECIMAL DEFAULT 0,
          paid_amount DECIMAL DEFAULT 0,
          items TEXT,
          status TEXT,
          date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      try {
        await sql`ALTER TABLE sales ADD COLUMN IF NOT EXISTS date TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;
        await sql`ALTER TABLE sales ADD COLUMN IF NOT EXISTS discount DECIMAL DEFAULT 0`;
      } catch (e) {}

      // 5. Purchases Table
      await sql`
        CREATE TABLE IF NOT EXISTS purchases (
          id TEXT PRIMARY KEY,
          product_id TEXT REFERENCES inventory(id),
          supplier_name TEXT,
          item_name TEXT,
          quantity DECIMAL DEFAULT 0,
          unit_price DECIMAL DEFAULT 0,
          total_price DECIMAL DEFAULT 0,
          date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      try {
        await sql`ALTER TABLE purchases ADD COLUMN IF NOT EXISTS date TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;
      } catch (e) {}

      // 6. Employees Table
      await sql`
        CREATE TABLE IF NOT EXISTS employees (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          position TEXT,
          monthly_salary DECIMAL DEFAULT 0,
          advances DECIMAL DEFAULT 0,
          join_date DATE DEFAULT CURRENT_DATE
        )
      `;

      // 7. Expenses Table
      await sql`
        CREATE TABLE IF NOT EXISTS expenses (
          id TEXT PRIMARY KEY,
          description TEXT,
          amount DECIMAL DEFAULT 0,
          date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      // Check if expenses table exists and has correct structure
      try {
        const checkTable = await sql`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = 'expenses'
        `;
        console.log("Expenses table structure:", checkTable);
      } catch (e) {
        console.log("Error checking expenses table:", e);
      }

      try {
        await sql`ALTER TABLE expenses ADD COLUMN IF NOT EXISTS date TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;
      } catch (e) {}

      console.log("Database schema initialized successfully.");
    } catch (error) {
      console.error("Failed to initialize database:", error);
    }
  },
};
