
import { NextResponse } from 'next/server';
import { getDb, query } from '../../../../lib/db';

export async function POST(request: Request) {
  const db = await getDb();
  
  try {
    const { id, quantity, isBundle, clientId } = await request.json();
    
    // 1. Get Item Data
    const itemRes = await query(
      'SELECT id, rabta, sheets_per_unit AS sheetsPerUnit, sell_price_per_sheet AS sellPrice, number_of_sheets_in_rabta AS totalSheets FROM goods WHERE id = ?',
      [id]
    );
    
    const item: any = itemRes.rows[0];
    
    if (!item) {
      throw new Error('الصنف غير موجود');
    }

    const sheetsToSubtract = isBundle ? quantity * item.sheetsPerUnit : quantity;
    const unitPrice = isBundle ? item.sellPrice * item.sheetsPerUnit : item.sellPrice;

    if (item.totalSheets < sheetsToSubtract) {
      throw new Error('الكمية غير متوفرة بالمخزن');
    }

    const totalPrice = unitPrice * quantity;

    // 2. Execute Updates in a batch (Transaction equivalent in LibSQL)
    await db.batch([
      {
        sql: `UPDATE goods 
              SET 
                number_of_sheets_in_rabta = number_of_sheets_in_rabta - ?,
                rabta = (number_of_sheets_in_rabta - ?) / sheets_per_unit,
                units = (number_of_sheets_in_rabta - ?) / sheets_per_unit
              WHERE id = ?`,
        args: [sheetsToSubtract, sheetsToSubtract, sheetsToSubtract, id]
      },
      {
        sql: `INSERT INTO sales (good_id, client_id, quantity, unit_type, price_per_unit, total_price)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [id, clientId, quantity, isBundle ? 'bundle' : 'sheet', unitPrice, totalPrice]
      }
    ], "write");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Sale Transaction Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
