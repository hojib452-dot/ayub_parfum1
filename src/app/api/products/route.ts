import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { asc } from "drizzle-orm";
import { ensureSeeded } from "@/lib/data";
import { checkAdminKey } from "@/lib/admin";

export async function GET() {
  await ensureSeeded();
  const rows = await db.select().from(products).orderBy(asc(products.id));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!(await checkAdminKey(req.headers.get("x-admin-key")))) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const {
      name,
      brand,
      description,
      productType,
      category,
      origin,
      price,
      oldPrice,
      volume,
      imageUrl,
      imageUrl2,
      featured,
      inStock,
      razlivEnabled,
      razlivPriceMl,
      costPrice,
      stockQty,
    } = body;

    if (!name?.trim() || !brand?.trim() || !price || !volume) {
      return NextResponse.json(
        { error: "Nomi, brendi, narxi va hajmi to'ldirilishi shart" },
        { status: 400 }
      );
    }

    const [created] = await db
      .insert(products)
      .values({
        name: name.trim(),
        brand: brand.trim(),
        description: description?.trim() || "",
        productType: productType === "kosmetika" ? "kosmetika" : "atir",
        category: category || "erkaklar",
        origin: origin || "fransiya",
        price: Number(price),
        oldPrice: oldPrice ? Number(oldPrice) : null,
        volume: Number(volume),
        imageUrl:
          imageUrl?.trim() ||
          "https://images.pexels.com/photos/16239693/pexels-photo-16239693.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        imageUrl2: imageUrl2?.trim() || null,
        featured: Boolean(featured),
        inStock: inStock !== false,
        razlivEnabled: razlivEnabled !== false,
        razlivPriceMl:
          razlivPriceMl && Number(razlivPriceMl) > 0
            ? Number(razlivPriceMl)
            : null,
        costPrice:
          costPrice && Number(costPrice) > 0 ? Number(costPrice) : null,
        stockQty: Math.max(0, Number(stockQty) || 1),
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}
