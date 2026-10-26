import { db } from "@/db";
import { settings } from "@/db/schema";

// Sayt sozlamalari — standart qiymatlar
export const DEFAULT_SETTINGS: Record<string, string> = {
  site_address: "Toshkent sh., Chilonzor tumani, Bunyodkor ko'chasi 12",
  site_phone: "+998 90 123 45 67",
  site_phone2: "+998 71 200 00 00",
  site_email: "info@ayubparfum.uz",
  site_telegram: "https://t.me/ayubparfum",
  site_telegram_bot: "https://t.me/ayubparfum_bot",
  site_work_hours: "Har kuni 10:00 — 21:00",
  site_lat: "41.285",
  site_lng: "69.215",
  tg_bot_token: "",
  tg_chat_id: "",
  // Muddatli to'lov sozlamalari
  installment_enabled: "1", // "1" = yoqilgan, "0" = o'chirilgan
  installment_min_price: "300000", // minimal narx
  installment_down_percent: "30", // boshlang'ich to'lov %
  installment_months: "3", // muddat (oy)

  // ===== Sayt kontenti (bannerlar va matnlar) =====
  announce_text: "Marg'ilon bo'ylab yetkazib berish bepul",
  hero_badge: "Premium Atirlar Butigi",
  hero_title1: "Nafislik —",
  hero_title2: "har bir tomchida",
  hero_desc:
    "Dior, Chanel, Creed, Tom Ford — dunyoning eng nufuzli brendlaridan original iforlar. Sizning uslubingizga loyiq hashamat.",
  hero_img: "/images/hero-premium.jpg",
  marquee_text:
    "DIOR|CHANEL|CREED|TOM FORD|VERSACE|YSL|100% ORIGINAL|PREMIUM SIFAT|BEPUL YETKAZISH",
  stat1_value: "5 000+",
  stat1_label: "Mamnun mijozlar",
  stat2_value: "20",
  stat2_label: "Dunyo brendlari",
  stat3_value: "100%",
  stat3_label: "Original mahsulot",
  stat4_value: "24 soat",
  stat4_label: "Yetkazib berish",
  feat1_title: "100% Original",
  feat1_desc:
    "Barcha mahsulotlar rasmiy distribyutorlardan keltiriladi va sertifikatlangan.",
  feat2_title: "Tez yetkazib berish",
  feat2_desc: "Marg'ilon bo'ylab bepul yetkazamiz, boshqa hududlarga 2-3 kunda.",
  feat3_title: "Qulay to'lov",
  feat3_desc: "Naqd, Payme, Click yoki karta orqali — sizga qulay usulda to'lang.",
  feat4_title: "Sovg'a o'rami",
  feat4_desc: "Har bir buyurtma uchun bepul hashamatli sovg'a o'rami taklif qilamiz.",
  club_title: "Ayub Parfum",
  club_desc:
    "8 va undan ortiq xarid qilgan mijozlarimiz klubga qo'shilib, barcha atirlarga 50% gacha doimiy chegirma oladi. Siz ham a'zo bo'ling!",
  cta_title: "Sevimli iforingizni bugun toping",
  cta_desc:
    "Katalogimizda sharqning eng mashhur atirlari — flakon yoki razliv shaklida. Buyurtma bering, 24 soat ichida yetkazamiz.",
  cta_btn: "Xarid qilish",
};

// Maxfiy kalitlar — ochiq API'da qaytarilmaydi
export const SECRET_KEYS = ["tg_bot_token", "tg_chat_id"];

export type SiteSettings = typeof DEFAULT_SETTINGS;

// Barcha sozlamalarni olish (baza + standartlar)
export async function getSiteSettings(): Promise<Record<string, string>> {
  try {
    const rows = await db.select().from(settings);
    const map: Record<string, string> = { ...DEFAULT_SETTINGS };
    for (const row of rows) {
      if (row.key in DEFAULT_SETTINGS && row.value.trim()) {
        map[row.key] = row.value;
      }
    }
    return map;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

// Sozlamalarni saqlash
export async function saveSiteSettings(updates: Record<string, string>) {
  for (const [key, value] of Object.entries(updates)) {
    if (!(key in DEFAULT_SETTINGS)) continue;
    await db
      .insert(settings)
      .values({ key, value: String(value) })
      .onConflictDoUpdate({ target: settings.key, set: { value: String(value) } });
  }
}
