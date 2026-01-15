import { NextResponse } from "next/server";
import { query } from "../../../lib/db";

export async function GET() {
  try {
    const monthFunc = "strftime('%Y-%m', created_at)";

    const [
      invCount,
      clientCount,
      advanceSum,
      salesSum,
      incomeSum,
      monthlySales,
    ] = await Promise.all([
      query("SELECT COALESCE(SUM(rabta), 0) as total FROM goods").catch(() => ({
        rows: [{ total: 0 }],
      })),
      query("SELECT COUNT(*) as total FROM clients").catch(() => ({
        rows: [{ total: 0 }],
      })),
      query(
        "SELECT COALESCE(SUM(salary_advance), 0) as total FROM employees"
      ).catch(() => ({ rows: [{ total: 0 }] })),
      query("SELECT COALESCE(SUM(total_price), 0) as total FROM sales").catch(
        () => ({ rows: [{ total: 0 }] })
      ),
      query(
        "SELECT COALESCE(SUM((sell_price_per_sheet - buy_price_per_sheet) * number_of_sheets_in_rabta), 0) as total FROM goods"
      ).catch(() => ({ rows: [{ total: 0 }] })),
      query(`
        SELECT ${monthFunc} as month, SUM(total_price) as income 
        FROM sales 
        WHERE created_at IS NOT NULL
        GROUP BY month 
        ORDER BY month DESC 
        LIMIT 6
      `).catch(() => ({ rows: [] })),
    ]);

    return NextResponse.json({
      totalInventory: parseFloat(String(invCount?.rows?.[0]?.total)) || 0,
      totalSales: parseFloat(String(salesSum?.rows?.[0]?.total)) || 0,
      clientCount: parseInt(String(clientCount?.rows?.[0]?.total)) || 0,
      pendingAdvances: parseFloat(String(advanceSum?.rows?.[0]?.total)) || 0,
      expectedIncome: parseFloat(String(incomeSum?.rows?.[0]?.total)) || 0,
      monthlyIncome: (monthlySales?.rows || [])
        .map((row: any) => ({
          month: row.month || "N/A",
          income: parseFloat(String(row.income)) || 0,
        }))
        .reverse(),
    });
  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({
      totalInventory: 0,
      totalSales: 0,
      clientCount: 0,
      pendingAdvances: 0,
      expectedIncome: 0,
      monthlyIncome: [],
    });
  }
}
