import { getDb, query as dbQuery } from "./db";
import { Good, Client } from "./types";

/**
 * SERVER-SIDE ACTIONS
 */

export async function getInventory(): Promise<Good[]> {
  const result = await dbQuery(`
    SELECT 
      id, name, units, sheets_per_unit AS "sheetsPerUnit", 
      buy_price_per_sheet AS "buyPricePerSheet", sell_price_per_sheet AS "sellPricePerSheet", 
      created_at AS "createdAt", 
      type, code, rabta, number_of_sheets_in_rabta AS "numberOfSheetsInRabta", 
      thickness, height, width, buy_price AS "buyPrice", sell_price AS "sellPrice"
    FROM goods 
    ORDER BY id DESC
  `);
  // Cast rows to unknown then to Good[] to satisfy TypeScript
  return result.rows as unknown as Good[];
}

export async function getClients(): Promise<Client[]> {
  const result = await dbQuery(
    'SELECT id, name, email, phone, address, type, created_at AS "createdAt" FROM clients ORDER BY name ASC'
  );
  return result.rows as unknown as Client[];
}

export async function executeSale(
  goodId: number,
  qty: number,
  isRabta: boolean
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db.execute("BEGIN TRANSACTION");

    if (isRabta) {
      await db.execute({
        sql: `
          UPDATE goods 
          SET rabta = rabta - ?, 
              units = units - ? 
          WHERE id = ?
        `,
        args: [qty, qty, goodId],
      });
    } else {
      await db.execute({
        sql: `
          UPDATE goods 
          SET number_of_sheets_in_rabta = number_of_sheets_in_rabta - ? 
          WHERE id = ?
        `,
        args: [qty, goodId],
      });
    }

    await db.execute("COMMIT");
  } catch (e) {
    try {
      await db.execute("ROLLBACK");
    } catch (err) {}
    throw e;
  }
}
