"use client";

import { useState } from "react";

export function ProductGallery({
  images,
  alt,
  discountBadge,
}: {
  images: string[];
  alt: string;
  discountBadge?: string | null;
}) {
  const [active, setActive] = useState(0);
  const list = images.filter(Boolean);

  return (
    <div>
      <div className="group relative overflow-hidden rounded-[2rem] border border-zinc-200 shadow-xl shadow-zinc-200/50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={list[active] ?? list[0]}
          alt={alt}
          className="h-[420px] w-full object-cover transition duration-700 group-hover:scale-105 sm:h-[560px]"
        />
        {discountBadge && (
          <span className="absolute left-5 top-5 rounded-full bg-emerald-600 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] text-white shadow-lg">
            {discountBadge}
          </span>
        )}

        {/* Oldinga/orqaga tugmalar (2+ rasm bo'lsa) */}
        {list.length > 1 && (
          <>
            <button
              onClick={() => setActive((active - 1 + list.length) % list.length)}
              className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg text-zinc-900 shadow-lg backdrop-blur transition hover:bg-emerald-600 hover:text-white"
              aria-label="Oldingi rasm"
            >
              ‹
            </button>
            <button
              onClick={() => setActive((active + 1) % list.length)}
              className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg text-zinc-900 shadow-lg backdrop-blur transition hover:bg-emerald-600 hover:text-white"
              aria-label="Keyingi rasm"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Kichik rasmlar (thumbnail) */}
      {list.length > 1 && (
        <div className="mt-4 flex gap-3">
          {list.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`overflow-hidden rounded-2xl border-2 transition ${
                active === i
                  ? "border-emerald-600 shadow-lg shadow-emerald-500/20"
                  : "border-zinc-200 opacity-60 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt={`${alt} ${i + 1}`}
                className="h-20 w-20 object-cover sm:h-24 sm:w-24"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
