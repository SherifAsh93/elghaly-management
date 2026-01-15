import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL || "file:database.sqlite";
const authToken = process.env.TURSO_AUTH_TOKEN || "";

// Create a single instance to be reused
const client = createClient({
  url: url,
  authToken: authToken,
});

export async function getDb() {
  return client;
}

export async function query(text: string, params: any[] = []) {
  try {
    // Critical Protection: In production on Vercel, we must have a Turso URL.
    // If we are using a local file in production, it means environment variables are missing.
    if (url.startsWith("file:") && process.env.NODE_ENV === "production") {
      throw new Error(
        "نظام قاعدة البيانات السحابية غير معد بشكل صحيح. يرجى إضافة TURSO_DATABASE_URL في إعدادات Vercel."
      );
    }

    const result = await client.execute({
      sql: text,
      args: params,
    });

    return {
      rows: result.rows || [],
      rowCount: Number(result.rowsAffected) || 0,
      lastID: result.lastInsertRowid ? Number(result.lastInsertRowid) : null,
    };
  } catch (error: any) {
    console.error("Database Query Error:", error.message);
    throw error;
  }
}
