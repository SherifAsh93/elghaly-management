
import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export async function GET() {
  try {
    const autoInc = 'INTEGER PRIMARY KEY AUTOINCREMENT';
    const timestamp = 'DATETIME';

    // Clients Table
    await query(`
      CREATE TABLE IF NOT EXISTS clients (
        id ${autoInc},
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT NOT NULL,
        address TEXT,
        type TEXT DEFAULT 'Cash',
        created_at ${timestamp} DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Employees Table
    await query(`
      CREATE TABLE IF NOT EXISTS employees (
        id ${autoInc},
        name TEXT NOT NULL,
        role TEXT,
        phone TEXT,
        salary REAL DEFAULT 0,
        salary_advance REAL DEFAULT 0
      );
    `);

    // Goods Table
    await query(`
      CREATE TABLE IF NOT EXISTS goods (
        id ${autoInc},
        name TEXT NOT NULL,
        code TEXT UNIQUE,
        type TEXT,
        units INTEGER DEFAULT 0,
        sheets_per_unit INTEGER DEFAULT 0,
        buy_price_per_sheet REAL DEFAULT 0,
        sell_price_per_sheet REAL DEFAULT 0,
        thickness REAL,
        height REAL DEFAULT 244,
        width REAL DEFAULT 122,
        rabta INTEGER DEFAULT 0,
        number_of_sheets_in_rabta INTEGER DEFAULT 0,
        buy_price REAL DEFAULT 0,
        sell_price REAL DEFAULT 0,
        created_at ${timestamp} DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Sales Table
    await query(`
      CREATE TABLE IF NOT EXISTS sales (
        id ${autoInc},
        good_id INTEGER,
        client_id INTEGER,
        quantity INTEGER NOT NULL,
        unit_type TEXT NOT NULL,
        price_per_unit REAL NOT NULL,
        total_price REAL NOT NULL,
        created_at ${timestamp} DEFAULT CURRENT_TIMESTAMP
      );
    `);

    return NextResponse.json({ success: true, message: `تم تجهيز قاعدة بيانات SQLite بنجاح` });
  } catch (error: any) {
    console.error('Setup Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
