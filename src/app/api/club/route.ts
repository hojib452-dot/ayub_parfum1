import { NextResponse } from "next/server";
import { db } from "@/db";
import { clubMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  countOrdersByPhone,
  discountForOrderCount,
  getMemberByPhone,
  normalizePhone,
  MIN_ORDERS_FOR_CLUB,
} from "@/lib/club";

// GET /api/club?phone=... — a'zolikni tekshirish (savatda chegirma uchun)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone") ?? "";

  if (normalizePhone(phone).length < 7) {
    return NextResponse.json(
      { member: null, error: "Telefon raqamni to'liq kiriting" },
      { status: 400 }
    );
  }

  const member = await getMemberByPhone(phone);
  if (!member) {
    const orderCount = await countOrdersByPhone(phone);
    return NextResponse.json({
      member: null,
      orderCount,
      needed: Math.max(0, MIN_ORDERS_FOR_CLUB - orderCount),
    });
  }

  return NextResponse.json({
    member: {
      name: member.name,
      discountPercent: member.discountPercent,
      orderCount: member.orderCount,
    },
  });
}

// POST /api/club — klubga qo'shilish arizasi
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone } = body as { name?: string; phone?: string };

    if (!name?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { error: "Ism va telefon raqam to'ldirilishi shart" },
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

    // Allaqachon a'zomi?
    const existing = await getMemberByPhone(phone);
    const orderCount = await countOrdersByPhone(phone);
    const discount = discountForOrderCount(orderCount);

    if (existing) {
      // Agar xaridlar soni oshgan bo'lsa — darajani yangilaymiz
      if (discount > existing.discountPercent) {
        const [updated] = await db
          .update(clubMembers)
          .set({ discountPercent: discount, orderCount })
          .where(eq(clubMembers.id, existing.id))
          .returning();
        return NextResponse.json({
          status: "upgraded",
          member: {
            name: updated.name,
            discountPercent: updated.discountPercent,
            orderCount: updated.orderCount,
          },
        });
      }
      return NextResponse.json({
        status: "already_member",
        member: {
          name: existing.name,
          discountPercent: existing.discountPercent,
          orderCount: existing.orderCount,
        },
      });
    }

    if (orderCount < MIN_ORDERS_FOR_CLUB) {
      return NextResponse.json(
        {
          status: "not_eligible",
          orderCount,
          needed: MIN_ORDERS_FOR_CLUB - orderCount,
          error: `Klubga qo'shilish uchun kamida ${MIN_ORDERS_FOR_CLUB} ta xarid kerak. Sizda hozircha ${orderCount} ta xarid bor.`,
        },
        { status: 403 }
      );
    }

    const [member] = await db
      .insert(clubMembers)
      .values({
        name: name.trim(),
        phone: normalized,
        discountPercent: discount,
        orderCount,
      })
      .returning();

    return NextResponse.json(
      {
        status: "joined",
        member: {
          name: member.name,
          discountPercent: member.discountPercent,
          orderCount: member.orderCount,
        },
      },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Xatolik yuz berdi. Qayta urinib ko'ring." },
      { status: 500 }
    );
  }
}
