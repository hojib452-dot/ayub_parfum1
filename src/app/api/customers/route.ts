import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, clubMembers } from "@/db/schema";
import { desc } from "drizzle-orm";
import { checkAdminKey } from "@/lib/admin";
import { normalizePhone } from "@/lib/club";

// GET /api/customers — mijozlar bazasi (faqat admin)
// Barcha buyurtmalarni telefon bo'yicha guruhlab statistika qaytaradi
export async function GET(req: Request) {
  if (!(await checkAdminKey(req.headers.get("x-admin-key")))) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const allOrders = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt));
  const members = await db.select().from(clubMembers);
  const memberByPhone = new Map(members.map((m) => [m.phone, m]));

  type Customer = {
    phone: string;
    displayPhone: string;
    name: string;
    orderCount: number; // faol (bekor qilinmagan) buyurtmalar
    cancelledCount: number;
    totalSpent: number;
    lastOrderAt: string;
    firstOrderAt: string;
    clubMember: null | { id: number; discountPercent: number };
    eligibleForClub: boolean;
  };

  const map = new Map<string, Customer>();

  for (const o of allOrders) {
    const key = normalizePhone(o.phone);
    if (key.length < 7) continue;
    const isCancelled = o.status === "bekor qilindi";

    let c = map.get(key);
    if (!c) {
      const member = memberByPhone.get(key);
      c = {
        phone: key,
        displayPhone: o.phone,
        name: o.customerName,
        orderCount: 0,
        cancelledCount: 0,
        totalSpent: 0,
        lastOrderAt: o.createdAt.toISOString(),
        firstOrderAt: o.createdAt.toISOString(),
        clubMember: member
          ? { id: member.id, discountPercent: member.discountPercent }
          : null,
        eligibleForClub: false,
      };
      map.set(key, c);
    }

    if (isCancelled) {
      c.cancelledCount += 1;
    } else {
      c.orderCount += 1;
      c.totalSpent += o.total;
    }
    // eng so'nggi buyurtmadagi ism/tel (ro'yxat desc tartibda, birinchi uchragani eng yangi)
    if (o.createdAt.toISOString() < c.firstOrderAt) {
      c.firstOrderAt = o.createdAt.toISOString();
    }
  }

  const customers = Array.from(map.values()).map((c) => ({
    ...c,
    eligibleForClub: !c.clubMember && c.orderCount >= 8,
  }));

  // Eng ko'p xarid qilganlar yuqorida
  customers.sort((a, b) => b.orderCount - a.orderCount);

  return NextResponse.json(customers);
}
