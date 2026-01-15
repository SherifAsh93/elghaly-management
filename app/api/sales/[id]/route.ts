import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const result = await query("DELETE FROM sales WHERE id = ?", [id]);

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "العملية غير موجودة" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete Sale Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
