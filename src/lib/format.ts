export function formatPrice(price: number) {
  return new Intl.NumberFormat("uz-UZ").format(price).replace(/,/g, " ") + " so'm";
}

export const CATEGORY_LABELS: Record<string, string> = {
  erkaklar: "Erkaklar uchun",
  ayollar: "Ayollar uchun",
  uniseks: "Uniseks",
  // Kosmetika kategoriyalari
  makiyaj: "💄 Makiyaj",
  "yuz-parvarishi": "🧴 Yuz parvarishi",
  tana: "🧼 Tana parvarishi",
  soch: "💇 Soch parvarishi",
};

export const KOSMETIKA_CATEGORIES = [
  { slug: "makiyaj", label: "💄 Makiyaj" },
  { slug: "yuz-parvarishi", label: "🧴 Yuz parvarishi" },
  { slug: "tana", label: "🧼 Tana parvarishi" },
  { slug: "soch", label: "💇 Soch parvarishi" },
];

// Razliv uchun 1 ml narxi — flakon narxidan kelib chiqib hisoblanadi
// (razliv odatda ml hisobida biroz qimmatroq bo'ladi)
export function razlivPricePerMl(price: number, volume: number) {
  return Math.ceil(((price / volume) * 1.25) / 500) * 500;
}

export function razlivPrice(price: number, volume: number, ml: number) {
  return razlivPricePerMl(price, volume) * ml;
}

// Samarali 1 ml narxi: admin maxsus narx qo'ygan bo'lsa — o'sha,
// aks holda avtomatik hisob. basePrice flakon narxidan farq qilsa
// (masalan Dubay/Turkiya versiyasi), maxsus narx ham proporsional kamayadi.
export function effectiveRazlivPerMl(
  product: {
    price: number;
    volume: number;
    razlivPriceMl?: number | null;
  },
  basePrice?: number
) {
  const bp = basePrice ?? product.price;
  if (product.razlivPriceMl && product.razlivPriceMl > 0) {
    if (bp === product.price) return product.razlivPriceMl;
    // Versiya narxiga proporsional moslashtirish (500 ga yaxlitlash)
    return Math.max(
      500,
      Math.round((product.razlivPriceMl * (bp / product.price)) / 500) * 500
    );
  }
  return razlivPricePerMl(bp, product.volume);
}

export const RAZLIV_OPTIONS = [3, 5, 10, 15, 20, 30];

// ===== Kataloglar (atir kelib chiqishi) =====
export const ORIGIN_LABELS: Record<string, string> = {
  fransiya: "🇫🇷 Fransiya atirlari",
  arab: "🇦🇪 Arab atirlari",
  turkiya: "🇹🇷 Turkiya atirlari",
  "fransiya-moyli": "🫗 Fransiya moyli atirlari",
  ozbekiston: "🇺🇿 O'zbekiston atirlari",
};

export const ORIGIN_SHORT: Record<string, string> = {
  fransiya: "🇫🇷 Fransiya",
  arab: "🇦🇪 Arab",
  turkiya: "🇹🇷 Turkiya",
  "fransiya-moyli": "🫗 Fransiya moyli",
  ozbekiston: "🇺🇿 O'zbekiston",
};

// ===== Fransiya atirlari uchun versiya tanlovi =====
// Mijoz Fransiya atirini 3 xil versiyada olishi mumkin:
// - Fransiya (original) — to'liq narx
// - Dubay (EDP) — original narxning ~18%
// - Turkiya versiyasi — original narxning ~12%
export type PerfumeVersion = "fransiya" | "dubay" | "turkiya";

export const VERSION_INFO: Record<
  PerfumeVersion,
  { label: string; flag: string; desc: string; multiplier: number }
> = {
  fransiya: {
    label: "Fransiya Original",
    flag: "🇫🇷",
    desc: "100% original, Fransiyada ishlab chiqarilgan",
    multiplier: 1,
  },
  dubay: {
    label: "Dubay analogi",
    flag: "🇦🇪",
    desc: "Originalning Dubay analogi — EDP Parfum, bir xil ifor kompozitsiyasi",
    multiplier: 0.18,
  },
  turkiya: {
    label: "Turkiya analogi",
    flag: "🇹🇷",
    desc: "Originalning Turkiya analogi — hamyonbop sifatli versiya",
    multiplier: 0.12,
  },
};

export function versionPrice(basePrice: number, version: PerfumeVersion) {
  const m = VERSION_INFO[version].multiplier;
  return Math.round((basePrice * m) / 5000) * 5000;
}
