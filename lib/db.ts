
import { createClient } from '@libsql/client';

// استخدام القيم من Environment Variables التي ستضعها في Vercel
// إذا لم توجد، سيستخدم ملف محلي للـ Development
const url = process.env.TURSO_DATABASE_URL || 'file:database.sqlite';
const authToken = process.env.TURSO_AUTH_TOKEN || '';

const client = createClient({
  url: url,
  authToken: authToken,
});

export async function getDb() {
  return client;
}

export async function query(text: string, params: any[] = []) {
  try {
    const result = await client.execute({
      sql: text,
      args: params
    });

    return {
      rows: result.rows || [],
      rowCount: result.rowsAffected || 0,
      lastID: result.lastInsertRowid ? Number(result.lastInsertRowid) : null
    };
  } catch (error: any) {
    console.error("Database Query Error:", error);
    throw error;
  }
}
