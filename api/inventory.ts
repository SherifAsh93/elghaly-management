
import { neon } from '@neondatabase/serverless';

export default async function handler(req: any, res: any) {
  const sql = neon(process.env.DATABASE_URL!);

  if (req.method === 'GET') {
    const data = await sql`SELECT * FROM inventory ORDER BY id DESC`;
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const items = req.body;
    // Simple sync logic: Clear and re-insert or Upsert
    // For production, you'd use a more sophisticated upsert logic
    for (const item of items) {
      await sql`
        INSERT INTO inventory (name, code, type, length, width, thickness, origin, bundles, boards_per_bundle, buy_price, sell_price)
        VALUES (${item.name}, ${item.code}, ${item.type}, ${item.length}, ${item.width}, ${item.thickness}, ${item.origin}, ${item.bundles}, ${item.boardsPerBundle}, ${item.buyPrice}, ${item.sellPrice})
        ON CONFLICT (code) DO UPDATE SET
          name = EXCLUDED.name,
          bundles = EXCLUDED.bundles,
          sell_price = EXCLUDED.sell_price
      `;
    }
    return res.status(200).json({ success: true });
  }
}
