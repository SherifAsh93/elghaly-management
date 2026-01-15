
import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export async function GET() {
  try {
    const result = await query(`
      SELECT id, name, role, phone, salary, salary_advance AS "salaryAdvance" 
      FROM employees 
      ORDER BY id DESC
    `);
    return NextResponse.json(result.rows || []);
  } catch (error: any) {
    return NextResponse.json({ error: 'Database error: ' + error.message, rows: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, role, phone, salary } = body;
    
    if (!name || !phone) {
      return NextResponse.json({ error: 'الاسم ورقم الهاتف مطلوبان' }, { status: 400 });
    }

    const result = await query(
      'INSERT INTO employees (name, role, phone, salary, salary_advance) VALUES (?, ?, ?, ?, 0)',
      [name, role || '', phone, parseFloat(salary) || 0]
    );
    
    return NextResponse.json({ success: true, id: result.lastID });
  } catch (error: any) {
    return NextResponse.json({ error: 'فشل الإضافة: ' + error.message }, { status: 500 });
  }
}
