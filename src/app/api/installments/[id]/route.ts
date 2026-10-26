import { NextResponse } from "next/server";
import { db } from "@/db";
import { installments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { checkAdminKey } from "@/lib/admin";

// PATCH — to'lov qo'shish yoki statusni o'zgartirish (faqat admin)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const instId = Number(id);
  if (!Number.isInteger(instId)) {
    return NextResponse.json({ error: "Noto'g'ri ID" }, { status: 400 });
  }
  if (!(await checkAdminKey(req.headers.get("x-admin-key")))) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const body = await req.json();
  const rows = await db
    .select()
    .from(installments)
    .where(eq(installments.id, instId));
  const inst = rows[0];
  if (!inst) {
    return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  }

  const updates: Record<string, unknown> = {};

  // To'lov qo'shish
  if (body.addPayment !== undefined) {
    const amount = Number(body.addPayment);
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "To'lov summasini to'g'ri kiriting" },
        { status: 400 }
      );
    }
    const remaining = inst.totalPrice - inst.downPayment - inst.paidAmount;
    const newPaid = inst.paidAmount + Math.min(amount, remaining);
    updates.paidAmount = newPaid;
    // To'liq to'langan bo'lsa statusni yangilaymiz
    if (inst.downPayment + newPaid >= inst.totalPrice) {
      updates.status = "tolangan";
    }
  }

  if (body.status !== undefined) {
    const allowed = ["faol", "tolangan", "muammoli"];
    if (allowed.includes(body.status)) {
      updates.status = body.status;
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "O'zgartirish yo'q" }, { status: 400 });
  }

  const [updated] = await db
    .update(installments)
    .set(updates)
    .where(eq(installments.id, instId))
    .returning();

  return NextResponse.json(updated);
}

// DELETE — shartnomani o'chirish (faqat admin)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const instId = Number(id);
  if (!Number.isInteger(instId)) {
    return NextResponse.json({ error: "Noto'g'ri ID" }, { status: 400 });
  }
  if (!(await checkAdminKey(req.headers.get("x-admin-key")))) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }
  await db.delete(installments).where(eq(installments.id, instId));
  return NextResponse.json({ status: "deleted" });
}
