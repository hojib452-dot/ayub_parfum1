import { NextResponse } from "next/server";
import { db } from "@/db";
import { clubMembers } from "@/db/schema";
import { desc } from "drizzle-orm";
import { checkAdminKey } from "@/lib/admin";
import { normalizePhone, countOrdersByPhone } from "@/lib/club";

// GET — barcha klub a'zolari (faqat admin)
export async function GET(req: Request) {
  if (!(await checkAdminKey(req.headers.get("x-admin-key")))) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }
  const members = await db
    .select()
    .from(clubMembers)
    .orderBy(desc(clubMembers.joinedAt));
  return NextResponse.json(members);
}

// POST — admin tomonidan qo'lda a'zo qo'shish
export async function POST(req: Request) {
  try {
    if (!(await checkAdminKey(req.headers.get("x-admin-key")))) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }
    const body = await req.json();
    const { name, phone, discountPercent } = body as {
      name?: string;
      phone?: string;
      discountPercent?: number;
    };

    if (!name?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { error: "Ism va telefon to'ldirilishi shart" },
        { status: 400 }
      );
    }
    const normalized = normalizePhone(phone);
    if (normalized.length < 7) {
      return NextResponse.json(
        { error: "Telefon raqamni to'liq kiriting" },
        { status: 400 }
      );
    }
    const discount = discountPercent === 50 ? 50 : 30;
    const orderCount = await countOrdersByPhone(phone);

    const [member] = await db
      .insert(clubMembers)
      .values({
        name: name.trim(),
        phone: normalized,
        discountPercent: discount,
        orderCount,
      })
      .onConflictDoUpdate({
        target: clubMembers.phone,
        set: { name: name.trim(), discountPercent: discount },
      })
      .returning();

    return NextResponse.json(member, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}
