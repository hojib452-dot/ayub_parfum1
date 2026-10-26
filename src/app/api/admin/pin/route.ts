import { NextResponse } from "next/server";
import { checkAdminKey, setAdminPin } from "@/lib/admin";

// POST /api/admin/pin — PIN-kodni o'zgartirish (joriy PIN bilan himoyalangan)
export async function POST(req: Request) {
  try {
    if (!(await checkAdminKey(req.headers.get("x-admin-key")))) {
      return NextResponse.json(
        { error: "Joriy PIN-kod noto'g'ri" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { newPin } = body as { newPin?: string };

    if (!newPin || !/^\d{4}$/.test(newPin)) {
      return NextResponse.json(
        { error: "Yangi PIN-kod aniq 4 ta raqamdan iborat bo'lishi kerak" },
        { status: 400 }
      );
    }

    await setAdminPin(newPin);
    return NextResponse.json({ status: "changed" });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}
