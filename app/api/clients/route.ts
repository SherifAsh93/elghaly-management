
import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export async function GET() {
  try {
    const result = await query(`
      SELECT id, name, email, phone, address, type, created_at AS "createdAt" 
      FROM clients 
      ORDER BY name ASC
    `);
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Client GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, address, type } = body;
    
    const result = await query(
      `INSERT INTO clients (name, email, phone, address, type) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, email || null, phone, address || null, type]
    );
    
    return NextResponse.json({ success: true, id: result.lastID });
  } catch (error: any) {
    console.error('Client POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
