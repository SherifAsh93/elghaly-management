import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const {
      name,
      code,
      type,
      units,
      sheetsPerUnit,
      buyPricePerSheet,
      sellPricePerSheet,
      thickness,
      height,
      width,
    } = body;

    const safeUnits = parseInt(units) || 0;
    const safeSheets = parseInt(sheetsPerUnit) || 0;
    const totalSheets = safeUnits * safeSheets;

    await query(
      `UPDATE goods SET 
        name = ?, code = ?, type = ?, units = ?, sheets_per_unit = ?, 
        buy_price_per_sheet = ?, sell_price_per_sheet = ?, thickness = ?, height = ?, width = ?,
        rabta = ?, number_of_sheets_in_rabta = ?
      WHERE id = ?`,
      [
        name,
        code,
        type,
        safeUnits,
        safeSheets,
        parseFloat(buyPricePerSheet),
        parseFloat(sellPricePerSheet),
        parseFloat(thickness),
        parseFloat(height),
        parseFloat(width),
        safeUnits,
        totalSheets,
        id,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    await query("DELETE FROM goods WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
