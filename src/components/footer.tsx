"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const DEFAULTS = {
  site_address: "Toshkent sh., Chilonzor tumani, Bunyodkor ko'chasi 12",
  site_phone: "+998 90 123 45 67",
  site_email: "info@ayubparfum.uz",
  site_telegram: "https://t.me/ayubparfum",
  site_telegram_bot: "https://t.me/ayubparfum_bot",
  site_work_hours: "Har kuni 10:00 — 21:00",
};

export function Footer() {
  const [s, setS] = useState<Record<string, string>>(DEFAULTS);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setS((prev) => ({ ...prev, ...data }));
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-zinc-950">
      {/* Top strip */}
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-12 text-center sm:px-6 md:flex-row md:justify-between md:text-left">
          <div>
            <h3 className="font-serif text-2xl font-medium text-white">
              Yangiliklar va chegirmalardan xabardor bo&apos;ling
            </h3>
            <p className="mt-2 text-sm font-light text-zinc-400">
              Telegram kanalimizga obuna bo&apos;ling — maxsus takliflar faqat
              obunachilar uchun
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap justify-center gap-3">
            <a
              href={s.site_telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-emerald-500 px-8 py-3.5 text-[12px] font-bold uppercase tracking-[0.15em] text-white transition hover:bg-emerald-400"
            >
              📨 Kanal
            </a>
            <a
              href={s.site_telegram_bot}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-emerald-400/50 px-8 py-3.5 text-[12px] font-bold uppercase tracking-[0.15em] text-emerald-300 transition hover:bg-emerald-500 hover:text-white"
            >
              🤖 Telegram bot
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-400/40 bg-gradient-to-br from-emerald-500 to-emerald-800 font-serif text-xl font-bold text-white">
              A
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-serif text-[22px] font-semibold text-white">
                Ayub <span className="text-emerald-400">Parfum</span>
              </span>
              <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.35em] text-zinc-500">
                Premium Boutique
              </span>
            </span>
          </div>
          <p className="mt-6 max-w-xs text-sm font-light leading-relaxed text-zinc-400">
            Dior, Chanel, Creed, Tom Ford va boshqa dunyo brendlarining
            original atirlari — kafolat bilan. Sizning uslubingiz — bizning
            ilhomimiz.
          </p>
        </div>

        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-400">
            Sahifalar
          </h3>
          <ul className="mt-6 space-y-3.5 text-sm font-light text-zinc-400">
            <li>
              <Link href="/" className="transition hover:text-emerald-300">
                Bosh sahifa
              </Link>
            </li>
            <li>
              <Link
                href="/katalog"
                className="transition hover:text-emerald-300"
              >
                Katalog
              </Link>
            </li>
            <li>
              <Link href="/savat" className="transition hover:text-emerald-300">
                Savat
              </Link>
            </li>
            <li>
              <Link href="/club" className="transition hover:text-emerald-300">
                👑 Ayub Parfum Club
              </Link>
            </li>
            <li>
              <Link href="/aloqa" className="transition hover:text-emerald-300">
                Aloqa
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-400">
            Aloqa
          </h3>
          <ul className="mt-6 space-y-3.5 text-sm font-light text-zinc-400">
            <li>📍 {s.site_address}</li>
            <li>
              📞{" "}
              <a
                href={`tel:${s.site_phone.replace(/\s/g, "")}`}
                className="transition hover:text-emerald-300"
              >
                {s.site_phone}
              </a>
            </li>
            <li>✉️ {s.site_email}</li>
            <li>
              🤖{" "}
              <a
                href={s.site_telegram_bot}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-emerald-300"
              >
                Telegram bot orqali buyurtma
              </a>
            </li>
            <li>🕙 {s.site_work_hours}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-6 text-center text-xs font-light tracking-wide text-zinc-500">
        © {new Date().getFullYear()} Ayub Parfum — Premium Boutique. Barcha
        huquqlar himoyalangan.
      </div>
    </footer>
  );
}
