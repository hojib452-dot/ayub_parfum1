import { NextResponse } from "next/server";
import { checkAdminKey } from "@/lib/admin";
import {
  checkBlocked,
  getClientIp,
  recordFail,
  recordSuccess,
} from "@/lib/rate-limit";

// POST /api/admin/verify — PIN tekshirish (brute-force himoyasi bilan)
export async function POST(req: Request) {
  const ip = getClientIp(req);

  // Bloklanganmi?
  const blockedSec = checkBlocked(ip);
  if (blockedSec > 0) {
    return NextResponse.json(
      {
        error: `Juda ko'p xato urinish. ${Math.ceil(blockedSec / 60)} daqiqadan keyin qayta urining.`,
        blockedSeconds: blockedSec,
      },
      { status: 429 }
    );
  }

  let pin = "";
  try {
    const body = await req.json();
    pin = String(body.pin ?? "");
  } catch {
    return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });
  }

  const ok = await checkAdminKey(pin);
  if (ok) {
    recordSuccess(ip);
    return NextResponse.json({ status: "ok" });
  }

  const result = recordFail(ip);
  if (result.blocked) {
    // Telegramga ogohlantirish (bloklamasdan, fonda)
    const { sendAdminAlert } = await import("@/lib/telegram");
    sendAdminAlert(
      `🚨 <b>XAVFSIZLIK OGOHLANTIRISHI</b>\n\nKimdir admin panelga 5 marta noto'g'ri PIN kiritdi!\n\n🌐 IP: ${ip}\n🕐 Vaqt: ${new Date().toLocaleString("uz-UZ")}\n\nBu IP 15 daqiqaga bloklandi.`
    ).catch(() => {});
    return NextResponse.json(
      {
        error:
          "5 ta xato urinish — 15 daqiqaga bloklandi. Keyinroq urining.",
        blockedSeconds: 900,
      },
      { status: 429 }
    );
  }

  return NextResponse.json(
    {
      error: `PIN-kod noto'g'ri (${result.fails}/5 urinish)`,
      failsLeft: 5 - result.fails,
    },
    { status: 401 }
  );
}
