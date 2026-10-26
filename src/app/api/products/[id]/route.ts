import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, orderItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { checkAdminKey } from "@/lib/admin";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) {
    return NextResponse.json({ error: "Noto'g'ri ID" }, { status: 400 });
  }
  if (!(await checkAdminKey(req.headers.get("x-admin-key")))) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const body = await req.json();
  const updates: Record<string, unknown> = {};

  if (body.name !== undefined) updates.name = String(body.name).trim();
  if (body.brand !== undefined) updates.brand = String(body.brand).trim();
  if (body.description !== undefined)
    updates.description = String(body.description).trim();
  if (body.category !== undefined) updates.category = String(body.category);
  if (body.productType !== undefined)
    updates.productType =
      body.productType === "kosmetika" ? "kosmetika" : "atir";
  if (body.origin !== undefined) updates.origin = String(body.origin);
  if (body.price !== undefined) updates.price = Number(body.price);
  if (body.oldPrice !== undefined)
    updates.oldPrice = body.oldPrice ? Number(body.oldPrice) : null;
  if (body.volume !== undefined) updates.volume = Number(body.volume);
  if (body.imageUrl !== undefined)
    updates.imageUrl = String(body.imageUrl).trim();
  if (body.imageUrl2 !== undefined)
    updates.imageUrl2 = String(body.imageUrl2).trim() || null;
  if (body.featured !== undefined) updates.featured = Boolean(body.featured);
  if (body.inStock !== undefined) updates.inStock = Boolean(body.inStock);
  if (body.stockFransiya !== undefined)
    updates.stockFransiya = Boolean(body.stockFransiya);
  if (body.stockDubay !== undefined)
    updates.stockDubay = Boolean(body.stockDubay);
  if (body.stockTurkiya !== undefined)
    updates.stockTurkiya = Boolean(body.stockTurkiya);
  if (body.razlivEnabled !== undefined)
    updates.razlivEnabled = Boolean(body.razlivEnabled);
  if (body.razlivPriceMl !== undefined)
    updates.razlivPriceMl =
      body.razlivPriceMl && Number(body.razlivPriceMl) > 0
        ? Number(body.razlivPriceMl)
        : null;
  if (body.costPrice !== undefined)
    updates.costPrice =
      body.costPrice && Number(body.costPrice) > 0
        ? Number(body.costPrice)
        : null;
  if (body.stockQty !== undefined)
    updates.stockQty = Math.max(0, Number(body.stockQty) || 0);

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "O'zgartirish yo'q" }, { status: 400 });
  }

  const [updated] = await db
    .update(products)
    .set(updates)
    .where(eq(products.id, productId))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Mahsulot topilmadi" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) {
    return NextResponse.json({ error: "Noto'g'ri ID" }, { status: 400 });
  }
  if (!(await checkAdminKey(req.headers.get("x-admin-key")))) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  // Buyurtma tarixida ishlatilgan bo'lsa ham o'chirishga ruxsat beramiz,
  // lekin order_items'da product_id FK bor — avval bog'liqlikni tekshiramiz
  const used = await db
    .select({ id: orderItems.id })
    .from(orderItems)
    .where(eq(orderItems.productId, productId))
    .limit(1);

  if (used.length > 0) {
    // Buyurtmalarda ishlatilgan — faqat sotuvdan olib tashlaymiz
    const [hidden] = await db
      .update(products)
      .set({ inStock: false })
      .where(eq(products.id, productId))
      .returning();
    return NextResponse.json({
      status: "hidden",
      message:
        "Bu mahsulot buyurtmalar tarixida bor — o'chirilmadi, sotuvdan olib tashlandi.",
      product: hidden,
    });
  }

  await db.delete(products).where(eq(products.id, productId));
  return NextResponse.json({ status: "deleted" });
}
