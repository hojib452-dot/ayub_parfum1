import { db } from "@/db";
import { settings } from "@/db/schema";
import { formatPrice } from "@/lib/format";

type OrderInfo = {
  id: number;
  customerName: string;
  phone: string;
  deliveryType: string;
  address: string;
  locationLat: string | null;
  locationLng: string | null;
  paymentMethod: string;
  installmentMonths?: number | null;
  comment: string | null;
  total: number;
  discountPercent: number;
};

type ItemInfo = { productName: string; price: number; quantity: number };

async function getTgConfig() {
  try {
    const rows = await db.select().from(settings);
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;
    return {
      token: map["tg_bot_token"] || process.env.TG_BOT_TOKEN || "",
      chatId: map["tg_chat_id"] || process.env.TG_CHAT_ID || "",
    };
  } catch {
    return { token: "", chatId: "" };
  }
}

// Yangi buyurtma haqida Telegramga xabar yuborish
export async function notifyNewOrder(order: OrderInfo, items: ItemInfo[]) {
  const { token, chatId } = await getTgConfig();
  if (!token || !chatId) return; // sozlanmagan bo'lsa jim o'tamiz

  const lines: string[] = [];
  lines.push(`🛍 <b>YANGI BUYURTMA #${order.id}</b>`);
  lines.push("");
  lines.push(`👤 Mijoz: <b>${escapeHtml(order.customerName)}</b>`);
  lines.push(`📞 Tel: ${escapeHtml(order.phone)}`);
  lines.push(
    order.deliveryType === "olib_ketish"
      ? "🏬 Do'kondan olib ketadi"
      : "🚚 Yetkazib berish"
  );
  if (order.deliveryType === "yetkazib_berish" && order.address) {
    lines.push(`📍 Manzil: ${escapeHtml(order.address)}`);
  }
  if (order.locationLat && order.locationLng) {
    lines.push(
      `🗺 Lokatsiya: https://www.google.com/maps?q=${order.locationLat},${order.locationLng}`
    );
  }
  if (order.paymentMethod === "muddatli") {
    const m = order.installmentMonths ?? 3;
    const monthly = Math.ceil(order.total / m / 1000) * 1000;
    lines.push(
      `📅 To'lov: MUDDATLI — ${m} oyga (~${formatPrice(monthly)}/oy)`
    );
    lines.push(`⚠️ Shartnoma rasmiylashtirish kerak!`);
  } else {
    lines.push(
      `💵 To'lov: ${order.paymentMethod === "karta" ? "Joyida karta orqali" : "Joyida naqd"}`
    );
  }
  if (order.comment) {
    lines.push(`💬 Izoh: ${escapeHtml(order.comment)}`);
  }
  lines.push("");
  lines.push("🧴 <b>Mahsulotlar:</b>");
  for (const item of items) {
    lines.push(
      `• ${escapeHtml(item.productName)} × ${item.quantity} — ${formatPrice(item.price * item.quantity)}`
    );
  }
  lines.push("");
  if (order.discountPercent > 0) {
    lines.push(`👑 Club chegirmasi: −${order.discountPercent}%`);
  }
  lines.push(`💰 <b>Jami: ${formatPrice(order.total)}</b>`);

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: lines.join("\n"),
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
  } catch (e) {
    console.error("Telegram notify error:", e);
  }
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Admin uchun xavfsizlik ogohlantirishi
export async function sendAdminAlert(text: string) {
  const { token, chatId } = await getTgConfig();
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }),
    });
  } catch (e) {
    console.error("TG alert error:", e);
  }
}
