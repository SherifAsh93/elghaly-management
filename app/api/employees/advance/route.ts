
import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';

export async function PUT(request: Request) {
  try {
    const { id, amount } = await request.json();
    
    if (!id || isNaN(parseFloat(amount))) {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
    }

    // SQLite also supports COALESCE
    const result = await query(
      'UPDATE employees SET salary_advance = COALESCE(salary_advance, 0) + ? WHERE id = ?',
      [parseFloat(amount), id]
    );
    
    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'الموظف غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update Advance Error:', error.message);
    return NextResponse.json({ error: 'فشل تحديث السلفة: ' + error.message }, { status: 500 });
  }
}
