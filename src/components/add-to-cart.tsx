"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/db/schema";
import {
  formatPrice,
  effectiveRazlivPerMl,
  RAZLIV_OPTIONS,
  VERSION_INFO,
  versionPrice,
  type PerfumeVersion,
} from "@/lib/format";
import { useCart, type CartVariant } from "./cart-context";

const VERSIONS: PerfumeVersion[] = ["fransiya", "dubay", "turkiya"];

export function AddToCart({ product }: { product: Product }) {
  const { addItem } = useCart();
  const isKosmetika = product.productType === "kosmetika";
  const isFrench = !isKosmetika && product.origin === "fransiya";

  const versionStock: Record<PerfumeVersion, boolean> = {
    fransiya: product.stockFransiya,
    dubay: product.stockDubay,
    turkiya: product.stockTurkiya,
  };
  const firstAvailable =
    VERSIONS.find((v) => versionStock[v]) ?? "fransiya";

  const [version, setVersion] = useState<PerfumeVersion>(
    isFrench ? firstAvailable : "fransiya"
  );
  const [variant, setVariant] = useState<CartVariant>("flakon");
  const [ml, setMl] = useState(10);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  // Fransiya atiri bo'lsa — tanlangan versiya narxi, aks holda oddiy narx
  const basePrice = isFrench ? versionPrice(product.price, version) : product.price;
  const razlivOn = product.razlivEnabled !== false;
  const perMl = effectiveRazlivPerMl(product, basePrice);
  const currentPrice = variant === "flakon" ? basePrice : perMl * ml;

  function handleAdd() {
    addItem(
      {
        productId: product.id,
        name: product.name,
        brand: product.brand,
        price: currentPrice,
        imageUrl: product.imageUrl,
        volume: variant === "flakon" ? product.volume : ml,
        variant,
        version: isFrench ? VERSION_INFO[version].label : undefined,
      },
      qty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  // Kosmetika — faqat miqdor + savatga qo'shish
  if (isKosmetika) {
    return (
      <div className="mt-10 flex flex-wrap items-center gap-4">
        <div className="flex items-center rounded-full border border-zinc-300">
          <button
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="flex h-12 w-12 items-center justify-center text-lg text-zinc-700 transition hover:text-emerald-600"
            aria-label="Kamaytirish"
          >
            −
          </button>
          <span className="w-8 text-center font-semibold text-zinc-900">
            {qty}
          </span>
          <button
            onClick={() => setQty(qty + 1)}
            className="flex h-12 w-12 items-center justify-center text-lg text-zinc-700 transition hover:text-emerald-600"
            aria-label="Ko'paytirish"
          >
            +
          </button>
        </div>
        <button
          onClick={handleAdd}
          className={`rounded-full px-10 py-4 text-[12px] font-bold uppercase tracking-[0.15em] transition ${
            added
              ? "bg-zinc-950 text-white"
              : "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-500/30"
          }`}
        >
          {added
            ? "✓ Qo'shildi"
            : `Savatga — ${formatPrice(product.price * qty)}`}
        </button>
        <Link
          href="/savat"
          className="rounded-full border border-zinc-900 px-10 py-4 text-[12px] font-bold uppercase tracking-[0.15em] text-zinc-900 transition hover:bg-zinc-950 hover:text-white"
        >
          Savatga o&apos;tish
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10">
      {/* ===== Fransiya atiri uchun versiya tanlash ===== */}
      {isFrench && (
        <div className="mb-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-zinc-500">
            Qaysi versiyani olasiz?
          </p>
          <div className="mt-3 grid gap-3 sm:max-w-xl sm:grid-cols-3">
            {VERSIONS.map((v) => {
              const info = VERSION_INFO[v];
              const price = versionPrice(product.price, v);
              const active = version === v;
              const available = versionStock[v];
              return (
                <button
                  key={v}
                  onClick={() => available && setVersion(v)}
                  disabled={!available}
                  className={`relative rounded-2xl border-2 p-4 text-left transition ${
                    !available
                      ? "cursor-not-allowed border-zinc-200 bg-zinc-50 opacity-60"
                      : active
                      ? "border-emerald-600 bg-emerald-50 shadow-md shadow-emerald-500/10"
                      : "border-zinc-200 bg-white hover:border-zinc-400"
                  }`}
                >
                  {!available && (
                    <span className="absolute right-2 top-2 rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-red-600">
                      Tugagan
                    </span>
                  )}
                  <span className="flex items-center gap-2">
                    <span className="text-xl">{info.flag}</span>
                    <span
                      className={`text-[11px] font-bold uppercase tracking-[0.08em] ${
                        !available
                          ? "text-zinc-400 line-through"
                          : active
                          ? "text-emerald-700"
                          : "text-zinc-700"
                      }`}
                    >
                      {info.label}
                    </span>
                  </span>
                  <span className="mt-2 block text-[11px] font-light leading-snug text-zinc-500">
                    {available ? info.desc : "Hozircha omborda yo'q — tez orada keladi"}
                  </span>
                  <span
                    className={`mt-2 block text-sm font-bold ${
                      !available
                        ? "text-zinc-400"
                        : active
                        ? "text-emerald-700"
                        : "text-zinc-900"
                    }`}
                  >
                    {formatPrice(price)}
                  </span>
                </button>
              );
            })}
          </div>
          {isFrench && !product.stockFransiya && (product.stockDubay || product.stockTurkiya) && (
            <p className="mt-3 rounded-xl bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-700 sm:max-w-xl">
              ℹ️ Fransiya originali hozircha tugagan, ammo xuddi shu atirning{" "}
              {[
                product.stockDubay && "Dubay",
                product.stockTurkiya && "Turkiya",
              ]
                .filter(Boolean)
                .join(" va ")}{" "}
              analogi sotuvda bor!
            </p>
          )}
        </div>
      )}

      {/* Variant tanlash: Butun flakon / Razliv */}
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-zinc-500">
        Qanday olasiz?
      </p>
      <div
        className={`mt-3 grid gap-3 sm:max-w-md ${
          razlivOn ? "grid-cols-2" : "grid-cols-1"
        }`}
      >
        <button
          onClick={() => setVariant("flakon")}
          className={`rounded-2xl border-2 p-4 text-left transition ${
            variant === "flakon"
              ? "border-emerald-600 bg-emerald-50 shadow-md shadow-emerald-500/10"
              : "border-zinc-200 bg-white hover:border-zinc-400"
          }`}
        >
          <span className="flex items-center gap-2">
            <span className="text-xl">🧴</span>
            <span
              className={`text-[12px] font-bold uppercase tracking-[0.1em] ${
                variant === "flakon" ? "text-emerald-700" : "text-zinc-700"
              }`}
            >
              Butun flakon
            </span>
          </span>
          <span className="mt-2 block text-xs font-light text-zinc-500">
            {product.volume} ml — yopiq, original qadoqda
          </span>
          <span
            className={`mt-1.5 block text-sm font-bold ${
              variant === "flakon" ? "text-emerald-700" : "text-zinc-900"
            }`}
          >
            {formatPrice(basePrice)}
          </span>
        </button>

        {razlivOn && (
        <button
          onClick={() => setVariant("razliv")}
          className={`rounded-2xl border-2 p-4 text-left transition ${
            variant === "razliv"
              ? "border-emerald-600 bg-emerald-50 shadow-md shadow-emerald-500/10"
              : "border-zinc-200 bg-white hover:border-zinc-400"
          }`}
        >
          <span className="flex items-center gap-2">
            <span className="text-xl">💧</span>
            <span
              className={`text-[12px] font-bold uppercase tracking-[0.1em] ${
                variant === "razliv" ? "text-emerald-700" : "text-zinc-700"
              }`}
            >
              Razliv
            </span>
          </span>
          <span className="mt-2 block text-xs font-light text-zinc-500">
            Istalgan hajmda quyib beramiz
          </span>
          <span
            className={`mt-1.5 block text-sm font-bold ${
              variant === "razliv" ? "text-emerald-700" : "text-zinc-900"
            }`}
          >
            {formatPrice(perMl)} / ml
          </span>
        </button>
        )}
      </div>

      {/* Razliv tanlanganda — ml tanlash */}
      {razlivOn && variant === "razliv" && (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 sm:max-w-md">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-zinc-500">
            Hajmni tanlang
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {RAZLIV_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => setMl(option)}
                className={`rounded-full px-5 py-2.5 text-[12px] font-bold transition ${
                  ml === option
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/30"
                    : "border border-zinc-300 bg-white text-zinc-700 hover:border-emerald-500 hover:text-emerald-700"
                }`}
              >
                {option} ml
              </button>
            ))}
          </div>
          <p className="mt-4 flex items-baseline justify-between border-t border-emerald-200 pt-3">
            <span className="text-xs font-light text-zinc-500">
              {ml} ml × {formatPrice(perMl)}
            </span>
            <span className="font-serif text-xl font-semibold text-emerald-700">
              {formatPrice(currentPrice)}
            </span>
          </p>
        </div>
      )}

      {/* Miqdor + tugmalar */}
      <div className="mt-7 flex flex-wrap items-center gap-4">
        <div className="flex items-center rounded-full border border-zinc-300">
          <button
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="flex h-12 w-12 items-center justify-center text-lg text-zinc-700 transition hover:text-emerald-600"
            aria-label="Kamaytirish"
          >
            −
          </button>
          <span className="w-8 text-center font-semibold text-zinc-900">
            {qty}
          </span>
          <button
            onClick={() => setQty(qty + 1)}
            className="flex h-12 w-12 items-center justify-center text-lg text-zinc-700 transition hover:text-emerald-600"
            aria-label="Ko'paytirish"
          >
            +
          </button>
        </div>

        <button
          onClick={handleAdd}
          className={`rounded-full px-10 py-4 text-[12px] font-bold uppercase tracking-[0.15em] transition ${
            added
              ? "bg-zinc-950 text-white"
              : "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-500/30"
          }`}
        >
          {added
            ? "✓ Qo'shildi"
            : `Savatga — ${formatPrice(currentPrice * qty)}`}
        </button>

        <Link
          href="/savat"
          className="rounded-full border border-zinc-900 px-10 py-4 text-[12px] font-bold uppercase tracking-[0.15em] text-zinc-900 transition hover:bg-zinc-950 hover:text-white"
        >
          Savatga o&apos;tish
        </Link>
      </div>
    </div>
  );
}
