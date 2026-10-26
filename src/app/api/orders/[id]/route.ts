import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";

const ALLOWED_STATUSES = ["yangi", "qabul qilindi", "yetkazildi", "bekor qilindi"];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId)) {
    return NextResponse.json({ error: "Noto'g'ri ID" }, { status: 400 });
  }

  const { checkAdminKey } = await import("@/lib/admin");
  if (!(await checkAdminKey(req.headers.get("x-admin-key")))) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const body = await req.json();
  const { status } = body as { status?: string };
  if (!status || !ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Noto'g'ri status" }, { status: 400 });
  }

  const [updated] = await db
    .update(orders)
    .set({ status })
    .where(eq(orders.id, orderId))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Buyurtma topilmadi" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
