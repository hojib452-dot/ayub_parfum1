import { NextResponse } from "next/server";
import { db } from "@/db";
import { visits } from "@/db/schema";
import { sql } from "drizzle-orm";

// POST /api/track — tashrif qayd etish (kuniga 1 marta har sessiya uchun)
export async function POST() {
  try {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    await db
      .insert(visits)
      .values({ day: today, count: 1 })
      .onConflictDoUpdate({
        target: visits.day,
        set: { count: sql`${visits.count} + 1` },
      });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
