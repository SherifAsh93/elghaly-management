
import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        s.id, s.good_id, s.client_id, s.quantity, s.unit_type, 
        s.price_per_unit, s.total_price, s.created_at,
        g.name as good_name, c.name as client_name
      FROM sales s
      JOIN goods g ON s.good_id = g.id
      JOIN clients c ON s.client_id = c.id
      ORDER BY s.created_at DESC
    `);
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
