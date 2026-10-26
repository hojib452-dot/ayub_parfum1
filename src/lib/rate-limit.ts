// PIN urinishlarini cheklash (brute-force himoyasi)
// IP bo'yicha: 5 ta xato urinish -> 15 daqiqa bloklash

type Entry = {
  fails: number;
  blockedUntil: number; // timestamp ms
  alerted: boolean;
};

const MAX_FAILS = 5;
const BLOCK_MS = 15 * 60 * 1000; // 15 daqiqa

const globalStore = globalThis as typeof globalThis & {
  __pinAttempts?: Map<string, Entry>;
};

const store = (globalStore.__pinAttempts ??= new Map<string, Entry>());

export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

// Bloklanganmi? Qolgan soniyalarni qaytaradi (0 = bloklanmagan)
export function checkBlocked(ip: string): number {
  const e = store.get(ip);
  if (!e) return 0;
  const left = e.blockedUntil - Date.now();
  if (left > 0) return Math.ceil(left / 1000);
  return 0;
}

// Xato urinish qayd etish. true qaytarsa — endi bloklandi (alert yuborish kerak)
export function recordFail(ip: string): { blocked: boolean; fails: number } {
  const e = store.get(ip) ?? { fails: 0, blockedUntil: 0, alerted: false };
  e.fails += 1;
  if (e.fails >= MAX_FAILS) {
    e.blockedUntil = Date.now() + BLOCK_MS;
    const shouldAlert = !e.alerted;
    e.alerted = true;
    e.fails = 0; // keyingi tsikl uchun
    store.set(ip, e);
    return { blocked: true, fails: MAX_FAILS };
  }
  store.set(ip, e);
  return { blocked: false, fails: e.fails };
}

export function recordSuccess(ip: string) {
  store.delete(ip);
}
