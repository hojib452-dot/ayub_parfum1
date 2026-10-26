import { NextResponse } from "next/server";
import { db } from "@/db";
import { visits } from "@/db/schema";
import { desc } from "drizzle-orm";
import { checkAdminKey } from "@/lib/admin";

// GET /api/visits — tashriflar statistikasi (faqat admin)
export async function GET(req: Request) {
  if (!(await checkAdminKey(req.headers.get("x-admin-key")))) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }
  const rows = await db
    .select()
    .from(visits)
    .orderBy(desc(visits.day))
    .limit(30);
  return NextResponse.json(rows);
}
