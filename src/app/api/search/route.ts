import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { asc, ilike, or } from "drizzle-orm";
import { ensureSeeded } from "@/lib/data";

// GET /api/search?q=... — mahsulot qidiruv (nom, brend, tavsif bo'yicha)
export async function GET(req: Request) {
  await ensureSeeded();
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (q.length < 2) {
    return NextResponse.json([]);
  }

  const pattern = `%${q}%`;
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      brand: products.brand,
      price: products.price,
      oldPrice: products.oldPrice,
      volume: products.volume,
      imageUrl: products.imageUrl,
      category: products.category,
      origin: products.origin,
      inStock: products.inStock,
    })
    .from(products)
    .where(
      or(
        ilike(products.name, pattern),
        ilike(products.brand, pattern),
        ilike(products.description, pattern)
      )
    )
    .orderBy(asc(products.brand), asc(products.name))
    .limit(20);

  return NextResponse.json(rows);
}
