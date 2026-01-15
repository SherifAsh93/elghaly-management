import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const { name, role, phone, salary } = body;

    await query(
      "UPDATE employees SET name = ?, role = ?, phone = ?, salary = ? WHERE id = ?",
      [name, role, phone, parseFloat(salary) || 0, id]
    );
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update Employee Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    await query("DELETE FROM employees WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete Employee Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
