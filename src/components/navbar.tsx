"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "./cart-context";
import { SearchModal } from "./search-modal";

const links = [
  { href: "/", label: "Bosh sahifa" },
  { href: "/katalog", label: "Katalog" },
  { href: "/kosmetika", label: "💄 Kosmetika" },
  { href: "/club", label: "👑 Club" },
  { href: "/aloqa", label: "Aloqa" },
];

export function Navbar() {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [announce, setAnnounce] = useState(
    "Marg'ilon bo'ylab yetkazib berish bepul"
  );

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.announce_text) setAnnounce(d.announce_text);
      })
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-50">
      {/* Announcement bar */}
      <div className="bg-emerald-700 py-2 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-50">
        {announce}
      </div>

      <div className="border-b border-white/10 bg-zinc-950/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* A doirasi — maxfiy admin kirish */}
            <Link
              href="/admin"
              aria-label="A"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-400/40 bg-gradient-to-br from-emerald-500 to-emerald-800 font-serif text-xl font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:shadow-emerald-400/40"
            >
              A
            </Link>
            {/* Matn qismi — bosh sahifaga */}
            <Link href="/" className="flex flex-col leading-none">
              <span className="font-serif text-[22px] font-semibold tracking-wide text-white">
                Ayub <span className="text-emerald-400">Parfum</span>
              </span>
              <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.35em] text-zinc-500">
                Premium Boutique
              </span>
            </Link>
          </div>

          <nav className="hidden items-center gap-10 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-[13px] font-medium uppercase tracking-[0.15em] transition-colors ${
                  pathname === link.href
                    ? "text-emerald-400"
                    : "text-zinc-300 hover:text-white"
                }`}
              >
                {link.label}
                {pathname === link.href && (
                  <span className="absolute -bottom-2 left-0 h-px w-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-emerald-400 hover:text-emerald-300"
              aria-label="Qidiruv"
              title="Atir qidirish"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </button>

            <Link
              href="/savat"
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-emerald-400 hover:text-emerald-300"
              aria-label="Savat"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.4}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
                />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1 text-[11px] font-bold text-white shadow-md shadow-emerald-500/40">
                  {totalItems}
                </span>
              )}
            </Link>

            <button
              onClick={() => setOpen(!open)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white md:hidden"
              aria-label="Menyu"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.4}
                viewBox="0 0 24 24"
              >
                {open ? (
                  <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {open && (
          <nav className="border-t border-white/10 bg-zinc-950 px-4 py-4 md:hidden">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`block py-3 text-sm font-medium uppercase tracking-[0.15em] ${
                  pathname === link.href ? "text-emerald-400" : "text-zinc-300"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
