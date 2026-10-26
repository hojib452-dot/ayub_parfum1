import { NextResponse } from "next/server";
import { db } from "@/db";
import { clubMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { checkAdminKey } from "@/lib/admin";

// PATCH — a'zo darajasini o'zgartirish (faqat admin)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const memberId = Number(id);
  if (!Number.isInteger(memberId)) {
    return NextResponse.json({ error: "Noto'g'ri ID" }, { status: 400 });
  }
  if (!(await checkAdminKey(req.headers.get("x-admin-key")))) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const body = await req.json();
  const updates: Record<string, unknown> = {};
  if (body.discountPercent !== undefined) {
    const d = Number(body.discountPercent);
    if (d !== 30 && d !== 50) {
      return NextResponse.json(
        { error: "Chegirma faqat 30 yoki 50 bo'lishi mumkin" },
        { status: 400 }
      );
    }
    updates.discountPercent = d;
  }
  if (body.name !== undefined) updates.name = String(body.name).trim();

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "O'zgartirish yo'q" }, { status: 400 });
  }

  const [updated] = await db
    .update(clubMembers)
    .set(updates)
    .where(eq(clubMembers.id, memberId))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "A'zo topilmadi" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

// DELETE — a'zoni klubdan chiqarish (faqat admin)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const memberId = Number(id);
  if (!Number.isInteger(memberId)) {
    return NextResponse.json({ error: "Noto'g'ri ID" }, { status: 400 });
  }
  if (!(await checkAdminKey(req.headers.get("x-admin-key")))) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  await db.delete(clubMembers).where(eq(clubMembers.id, memberId));
  return NextResponse.json({ status: "deleted" });
}
