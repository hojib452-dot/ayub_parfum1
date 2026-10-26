import { db } from "@/db";
import { clubMembers, orders } from "@/db/schema";
import { eq, ne } from "drizzle-orm";

// Telefonni normallashtirish: faqat raqamlar, oxirgi 9 ta raqam
// (+998 90 123 45 67 -> 901234567)
export function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.slice(-9);
}

// Chegirma darajalari:
// 10+ xarid -> 50%, 8-9 xarid -> 30%, aks holda a'zo bo'la olmaydi
export function discountForOrderCount(count: number) {
  if (count >= 10) return 50;
  if (count >= 8) return 30;
  return 0;
}

export const MIN_ORDERS_FOR_CLUB = 8;

// Telefon raqam bo'yicha bekor qilinmagan buyurtmalar sonini hisoblash
export async function countOrdersByPhone(phone: string) {
  const normalized = normalizePhone(phone);
  if (normalized.length < 7) return 0;
  const rows = await db
    .select({ phone: orders.phone })
    .from(orders)
    .where(ne(orders.status, "bekor qilindi"));
  return rows.filter((r) => normalizePhone(r.phone) === normalized).length;
}

export async function getMemberByPhone(phone: string) {
  const normalized = normalizePhone(phone);
  if (normalized.length < 7) return null;
  const rows = await db
    .select()
    .from(clubMembers)
    .where(eq(clubMembers.phone, normalized));
  return rows[0] ?? null;
}
