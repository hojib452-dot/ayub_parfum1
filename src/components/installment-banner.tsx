"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";

export type InstallmentConfig = {
  enabled: boolean;
  minPrice: number;
  downPercent: number;
  months: number;
};

// Modul darajasidagi kesh — sahifadagi barcha kartochkalar bitta so'rovdan foydalanadi
let cachedConfig: InstallmentConfig | null = null;
let configPromise: Promise<InstallmentConfig | null> | null = null;

function fetchConfig(): Promise<InstallmentConfig | null> {
  if (cachedConfig) return Promise.resolve(cachedConfig);
  if (!configPromise) {
    configPromise = fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return null;
        cachedConfig = {
          enabled: d.installment_enabled === "1",
          minPrice: Number(d.installment_min_price) || 300000,
          downPercent: Number(d.installment_down_percent) || 30,
          months: Number(d.installment_months) || 3,
        };
        return cachedConfig;
      })
      .catch(() => null);
  }
  return configPromise;
}

export function useInstallmentConfig() {
  const [config, setConfig] = useState<InstallmentConfig | null>(cachedConfig);
  useEffect(() => {
    if (!config) {
      fetchConfig().then((c) => {
        if (c) setConfig(c);
      });
    }
  }, [config]);
  return config;
}

export function InstallmentBanner({ price }: { price: number }) {
  const config = useInstallmentConfig();

  if (!config || !config.enabled || price < config.minPrice) return null;

  const down = Math.ceil((price * config.downPercent) / 100 / 1000) * 1000;
  const monthly = Math.ceil((price - down) / config.months / 1000) * 1000;

  return (
    <div className="mt-6 rounded-2xl border-2 border-violet-300 bg-gradient-to-br from-violet-50 to-indigo-50/60 p-5">
      <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.12em] text-violet-800">
        📅 Muddatli to&apos;lov — {config.months} oyga, o&apos;z narxiga!
      </p>
      <p className="mt-1.5 text-xs font-light text-zinc-600">
        Hech qanday ustama yo&apos;q — 1 so&apos;m ham ortiqcha
        to&apos;lamaysiz. Faqat Club a&apos;zolari va doimiy mijozlar uchun.
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-white/90 px-2 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
            Boshlang&apos;ich ({config.downPercent}%)
          </p>
          <p className="mt-1 text-sm font-bold text-violet-700">
            {formatPrice(down)}
          </p>
        </div>
        <div className="rounded-xl bg-white/90 px-2 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
            Oyiga × {config.months}
          </p>
          <p className="mt-1 text-sm font-bold text-violet-700">
            {formatPrice(monthly)}
          </p>
        </div>
        <div className="rounded-xl bg-white/90 px-2 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
            Jami
          </p>
          <p className="mt-1 text-sm font-bold text-emerald-700">
            {formatPrice(price)}
          </p>
        </div>
      </div>
      <p className="mt-3 text-[11px] font-light italic text-zinc-500">
        * Rasmiylashtirish do&apos;konda: pasport + telefon raqam.
        Ma&apos;lumot uchun qo&apos;ng&apos;iroq qiling yoki buyurtma izohida
        &ldquo;muddatli to&apos;lov&rdquo; deb yozing.
      </p>
    </div>
  );
}
