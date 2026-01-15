
import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        id, name, units, 
        sheets_per_unit AS "sheetsPerUnit", 
        buy_price_per_sheet AS "buyPricePerSheet", 
        sell_price_per_sheet AS "sellPricePerSheet", 
        rabta, number_of_sheets_in_rabta AS "numberOfSheetsInRabta", 
        thickness, height, width, 
        buy_price AS "buyPrice", 
        sell_price AS "sellPrice", 
        code, type
      FROM goods 
      ORDER BY id DESC
    `);
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json({ error: 'فشل جلب البيانات: ' + error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, code, type, units, sheetsPerUnit, 
      buyPricePerSheet, sellPricePerSheet, thickness, height, width 
    } = body;

    const safeUnits = parseInt(units) || 0;
    const safeSheets = parseInt(sheetsPerUnit) || 0;
    const totalSheets = safeUnits * safeSheets;

    const sql = `
      INSERT INTO goods (
        name, code, type, units, sheets_per_unit, 
        buy_price_per_sheet, sell_price_per_sheet, 
        thickness, height, width, rabta, number_of_sheets_in_rabta
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      name, code, type, safeUnits, safeSheets, 
      parseFloat(buyPricePerSheet) || 0, 
      parseFloat(sellPricePerSheet) || 0, 
      parseFloat(thickness) || 18, 
      parseFloat(height) || 244, 
      parseFloat(width) || 122, 
      safeUnits, 
      totalSheets
    ];

    await query(sql, values);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    const errorMsg = error.message.includes('UNIQUE') ? 'كود الصنف مكرر' : error.message;
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
