"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatPrice, ORIGIN_SHORT } from "@/lib/format";

type SearchResult = {
  id: number;
  name: string;
  brand: string;
  price: number;
  oldPrice: number | null;
  volume: number;
  imageUrl: string;
  category: string;
  origin: string;
  inStock: boolean;
};

export function SearchModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Modal ochilganda inputga fokus
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setResults([]);
      setSearched(false);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // ESC bosilganda yopish
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Jonli qidiruv (debounce 300ms)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query.trim())}`
        );
        if (res.ok) {
          setResults(await res.json());
          setSearched(true);
        }
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-zinc-950/70 p-4 pt-20 backdrop-blur-sm sm:pt-28"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Qidiruv input */}
        <div className="flex items-center gap-3 border-b border-zinc-200 px-5 py-4">
          <svg
            className="h-5 w-5 shrink-0 text-emerald-600"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Atir nomi yoki brendini yozing... (masalan: Sauvage, Lattafa, vanil)"
            className="flex-1 bg-transparent text-base text-zinc-900 placeholder-zinc-400 outline-none"
          />
          {loading && (
            <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          )}
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm text-zinc-500 transition hover:bg-zinc-200"
            aria-label="Yopish"
          >
            ✕
          </button>
        </div>

        {/* Natijalar */}
        <div className="max-h-[60vh] overflow-y-auto">
          {query.trim().length < 2 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-3xl">🔍</p>
              <p className="mt-3 text-sm font-light text-zinc-500">
                Qidirish uchun kamida 2 ta harf yozing
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {["Sauvage", "Chanel", "Lattafa", "Oud", "Vanil", "Musk"].map(
                  (s) => (
                    <button
                      key={s}
                      onClick={() => setQuery(s)}
                      className="rounded-full border border-zinc-300 px-4 py-1.5 text-xs font-semibold text-zinc-600 transition hover:border-emerald-500 hover:text-emerald-700"
                    >
                      {s}
                    </button>
                  )
                )}
              </div>
            </div>
          ) : searched && results.length === 0 && !loading ? (
            <div className="px-5 py-10 text-center">
              <p className="text-3xl">😔</p>
              <p className="mt-3 text-sm font-semibold text-zinc-700">
                &ldquo;{query}&rdquo; bo&apos;yicha hech narsa topilmadi
              </p>
              <p className="mt-1 text-xs font-light text-zinc-500">
                Boshqa so&apos;z bilan urinib ko&apos;ring yoki katalogni
                ko&apos;ring
              </p>
              <Link
                href="/katalog"
                onClick={onClose}
                className="mt-5 inline-block rounded-full bg-emerald-600 px-8 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-white transition hover:bg-emerald-700"
              >
                Katalogga o&apos;tish
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {results.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/mahsulot/${p.id}`}
                    onClick={onClose}
                    className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-emerald-50/60"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="h-14 w-14 shrink-0 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-600">
                        {p.brand}
                      </p>
                      <p className="truncate font-serif text-[15px] font-semibold text-zinc-900">
                        {p.name}
                      </p>
                      <p className="text-xs font-light text-zinc-400">
                        {ORIGIN_SHORT[p.origin] ?? p.origin} · {p.volume} ml
                        {!p.inStock && (
                          <span className="ml-2 text-red-500">· Tugagan</span>
                        )}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      {p.oldPrice && (
                        <p className="text-[11px] text-zinc-400 line-through">
                          {formatPrice(p.oldPrice)}
                        </p>
                      )}
                      <p className="text-sm font-bold text-emerald-700">
                        {formatPrice(p.price)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pastki hint */}
        {results.length > 0 && (
          <div className="border-t border-zinc-200 bg-zinc-50 px-5 py-2.5 text-center text-[11px] font-light text-zinc-400">
            {results.length} ta natija topildi · ESC — yopish
          </div>
        )}
      </div>
    </div>
  );
}
