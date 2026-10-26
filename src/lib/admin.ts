import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";

// Standart PIN — baza bo'sh bo'lsa ishlatiladi
const DEFAULT_PIN = process.env.ADMIN_KEY || "2025";

// Joriy PIN-kodni olish (bazadan, bo'lmasa standart)
export async function getAdminPin(): Promise<string> {
  try {
    const rows = await db
      .select()
      .from(settings)
      .where(eq(settings.key, "admin_pin"));
    return rows[0]?.value ?? DEFAULT_PIN;
  } catch {
    return DEFAULT_PIN;
  }
}

// PIN-kodni tekshirish
export async function checkAdminKey(
  key: string | null | undefined
): Promise<boolean> {
  if (!key) return false;
  const pin = await getAdminPin();
  return key === pin;
}

// Yangi PIN-kodni saqlash
export async function setAdminPin(newPin: string) {
  await db
    .insert(settings)
    .values({ key: "admin_pin", value: newPin })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: newPin },
    });
}
