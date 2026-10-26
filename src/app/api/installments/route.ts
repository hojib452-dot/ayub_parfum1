import { NextResponse } from "next/server";
import { db } from "@/db";
import { installments } from "@/db/schema";
import { desc } from "drizzle-orm";
import { checkAdminKey } from "@/lib/admin";

// GET — barcha nasiya shartnomalari (faqat admin)
export async function GET(req: Request) {
  if (!(await checkAdminKey(req.headers.get("x-admin-key")))) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }
  const rows = await db
    .select()
    .from(installments)
    .orderBy(desc(installments.createdAt));
  return NextResponse.json(rows);
}

// POST — yangi nasiya shartnomasi (faqat admin — do'konda rasmiylashtiriladi)
export async function POST(req: Request) {
  try {
    if (!(await checkAdminKey(req.headers.get("x-admin-key")))) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }
    const body = await req.json();
    const {
      customerName,
      phone,
      passport,
      productName,
      totalPrice,
      downPayment,
      months,
      comment,
    } = body;

    if (!customerName?.trim() || !phone?.trim() || !productName?.trim()) {
      return NextResponse.json(
        { error: "Mijoz ismi, telefon va mahsulot nomi shart" },
        { status: 400 }
      );
    }
    const total = Number(totalPrice);
    const down = Number(downPayment);
    const m = Math.max(1, Number(months) || 3);
    if (!total || total <= 0 || down < 0 || down >= total) {
      return NextResponse.json(
        { error: "Narx va boshlang'ich to'lovni to'g'ri kiriting" },
        { status: 400 }
      );
    }
    const monthly = Math.ceil((total - down) / m / 1000) * 1000;

    const [row] = await db
      .insert(installments)
      .values({
        customerName: customerName.trim(),
        phone: phone.trim(),
        passport: passport?.trim() || null,
        productName: productName.trim(),
        totalPrice: total,
        downPayment: down,
        months: m,
        monthlyPayment: monthly,
        comment: comment?.trim() || null,
      })
      .returning();

    return NextResponse.json(row, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}
