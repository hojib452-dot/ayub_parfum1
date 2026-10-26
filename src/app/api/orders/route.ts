import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { desc, inArray } from "drizzle-orm";
import { ensureSeeded } from "@/lib/data";
import { getMemberByPhone } from "@/lib/club";

type IncomingItem = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
};

export async function POST(req: Request) {
  try {
    await ensureSeeded();
    const body = await req.json();
    const {
      customerName,
      phone,
      address,
      comment,
      items,
      clubPhone,
      deliveryType,
      locationLat,
      locationLng,
      paymentMethod,
      installmentMonths,
    } = body as {
      customerName?: string;
      phone?: string;
      address?: string;
      comment?: string;
      items?: IncomingItem[];
      clubPhone?: string;
      deliveryType?: string;
      locationLat?: string;
      locationLng?: string;
      paymentMethod?: string;
      installmentMonths?: number;
    };

    const payment =
      paymentMethod === "karta"
        ? "karta"
        : paymentMethod === "muddatli"
        ? "muddatli"
        : "naqd";
    const instMonths =
      payment === "muddatli"
        ? Number(installmentMonths) === 2
          ? 2
          : 3
        : null;

    const delivery =
      deliveryType === "olib_ketish" ? "olib_ketish" : "yetkazib_berish";

    if (!customerName?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { error: "Ism va telefon to'ldirilishi shart" },
        { status: 400 }
      );
    }
    if (delivery === "yetkazib_berish" && !address?.trim() && !locationLat) {
      return NextResponse.json(
        { error: "Yetkazib berish uchun manzil yoki lokatsiya kerak" },
        { status: 400 }
      );
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Savat bo'sh" }, { status: 400 });
    }

    const subtotal = items.reduce(
      (sum, i) => sum + Math.max(0, i.price) * Math.max(1, i.quantity),
      0
    );

    // Klub chegirmasini server tomonda tekshirish
    let discountPercent = 0;
    const phoneForClub = clubPhone?.trim() || phone;
    const member = await getMemberByPhone(phoneForClub);
    if (member) {
      discountPercent = member.discountPercent;
    }

    const total = Math.round((subtotal * (100 - discountPercent)) / 100);

    const [order] = await db
      .insert(orders)
      .values({
        customerName: customerName.trim(),
        phone: phone.trim(),
        deliveryType: delivery,
        address:
          delivery === "olib_ketish"
            ? "Do'kondan olib ketish"
            : (address?.trim() ?? ""),
        locationLat: locationLat?.trim() || null,
        locationLng: locationLng?.trim() || null,
        paymentMethod: payment,
        installmentMonths: instMonths,
        comment: comment?.trim() || null,
        total,
        discountPercent,
      })
      .returning();

    const itemRows = items.map((i) => ({
      orderId: order.id,
      productId: i.productId,
      productName: i.name,
      price: i.price,
      quantity: Math.max(1, i.quantity),
    }));
    await db.insert(orderItems).values(itemRows);

    // Telegramga xabar yuborish (bloklamasdan)
    const { notifyNewOrder } = await import("@/lib/telegram");
    notifyNewOrder(order, itemRows).catch((e) =>
      console.error("TG notify failed:", e)
    );

    return NextResponse.json(
      { orderId: order.id, discountPercent, total },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Buyurtma yaratishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { checkAdminKey } = await import("@/lib/admin");
  if (!(await checkAdminKey(req.headers.get("x-admin-key")))) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }
  const allOrders = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt));

  const ids = allOrders.map((o) => o.id);
  const items = ids.length
    ? await db.select().from(orderItems).where(inArray(orderItems.orderId, ids))
    : [];

  const result = allOrders.map((o) => ({
    ...o,
    items: items.filter((i) => i.orderId === o.id),
  }));

  return NextResponse.json(result);
}
