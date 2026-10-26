import { NextResponse } from "next/server";
import { checkAdminKey } from "@/lib/admin";
import {
  getSiteSettings,
  saveSiteSettings,
  SECRET_KEYS,
} from "@/lib/settings";

// GET — sayt sozlamalari
// Oddiy foydalanuvchiga: ochiq ma'lumotlar (maxfiy kalitlarsiz)
// Admin kaliti bilan: barcha sozlamalar (Telegram token ham)
export async function GET(req: Request) {
  const data = await getSiteSettings();
  const isAdmin = await checkAdminKey(req.headers.get("x-admin-key"));
  if (isAdmin) {
    return NextResponse.json(data);
  }
  const publicData: Record<string, string> = {};
  for (const [k, v] of Object.entries(data)) {
    if (!SECRET_KEYS.includes(k)) publicData[k] = v;
  }
  return NextResponse.json(publicData);
}

// POST — sozlamalarni yangilash (faqat admin)
export async function POST(req: Request) {
  try {
    if (!(await checkAdminKey(req.headers.get("x-admin-key")))) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 });
    }
    await saveSiteSettings(body as Record<string, string>);
    const updated = await getSiteSettings();
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}
