"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/db/schema";
import {
  formatPrice,
  CATEGORY_LABELS,
  ORIGIN_SHORT,
  VERSION_INFO,
  versionPrice,
  effectiveRazlivPerMl,
  RAZLIV_OPTIONS,
  type PerfumeVersion,
} from "@/lib/format";
import { useCart } from "./cart-context";
import { useInstallmentConfig } from "./installment-banner";

const VERSIONS: PerfumeVersion[] = ["fransiya", "dubay", "turkiya"];

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [step, setStep] = useState<"version" | "variant">("version");
  const [version, setVersion] = useState<PerfumeVersion | null>(null);
  const [showMl, setShowMl] = useState(false);
  const isKosmetika = product.productType === "kosmetika";
  const isFrench = !isKosmetika && product.origin === "fransiya";
  const instConfig = useInstallmentConfig();
  const instAvailable =
    !isKosmetika &&
    instConfig?.enabled &&
    product.price >= (instConfig?.minPrice ?? Infinity);

  const versionStock: Record<PerfumeVersion, boolean> = {
    fransiya: product.stockFransiya,
    dubay: product.stockDubay,
    turkiya: product.stockTurkiya,
  };
  const originalOut =
    isFrench &&
    !product.stockFransiya &&
    (product.stockDubay || product.stockTurkiya);

  const basePrice =
    isFrench && version ? versionPrice(product.price, version) : product.price;
  const razlivOn = !isKosmetika && product.razlivEnabled !== false;
  const perMl = effectiveRazlivPerMl(product, basePrice);

  function openPanel() {
    // Kosmetika — panel ochmasdan to'g'ridan-to'g'ri savatga
    if (isKosmetika) {
      addItem({
        productId: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        imageUrl: product.imageUrl,
        volume: product.volume,
        variant: "flakon",
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 1200);
      return;
    }
    setPanelOpen(true);
    setShowMl(false);
    if (isFrench) {
      setStep("version");
      setVersion(null);
    } else {
      setStep("variant");
      setVersion(null);
    }
  }

  function closePanel() {
    setPanelOpen(false);
    setShowMl(false);
  }

  function pickVersion(v: PerfumeVersion) {
    setVersion(v);
    setStep("variant");
  }

  function addFlakon() {
    addItem({
      productId: product.id,
      name: product.name,
      brand: product.brand,
      price: basePrice,
      imageUrl: product.imageUrl,
      volume: product.volume,
      variant: "flakon",
      version: isFrench && version ? VERSION_INFO[version].label : undefined,
    });
    finish();
  }

  function addRazliv(ml: number) {
    addItem({
      productId: product.id,
      name: product.name,
      brand: product.brand,
      price: perMl * ml,
      imageUrl: product.imageUrl,
      volume: ml,
      variant: "razliv",
      version: isFrench && version ? VERSION_INFO[version].label : undefined,
    });
    finish();
  }

  function finish() {
    closePanel();
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white transition duration-300 hover:-translate-y-1.5 hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/10">
      <Link
        href={`/mahsulot/${product.id}`}
        className="relative block overflow-hidden"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt={product.name}
          className={`h-72 w-full object-cover transition duration-700 group-hover:scale-110 ${
            product.imageUrl2 ? "group-hover:opacity-0" : ""
          }`}
        />
        {/* 2-rasm — hover'da ko'rinadi */}
        {product.imageUrl2 && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl2}
            alt={`${product.name} 2`}
            className="absolute inset-0 h-72 w-full scale-110 object-cover opacity-0 transition duration-700 group-hover:scale-100 group-hover:opacity-100"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/30 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />

        {product.oldPrice && (
          <span className="absolute left-4 top-4 rounded-full bg-emerald-600 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white shadow-lg">
            −{Math.round((1 - product.price / product.oldPrice) * 100)}%
          </span>
        )}
        <span className="absolute right-4 top-4 rounded-full bg-zinc-950/80 px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.15em] text-white backdrop-blur">
          {CATEGORY_LABELS[product.category] ?? product.category}
        </span>
        <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-800 backdrop-blur">
          {isKosmetika
            ? "💄 Kosmetika"
            : ORIGIN_SHORT[product.origin] ?? product.origin}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-600">
          {product.brand}
        </p>
        <Link
          href={`/mahsulot/${product.id}`}
          className="mt-2 font-serif text-xl font-medium text-zinc-900 transition hover:text-emerald-700"
        >
          {product.name}
        </Link>
        <p className="mt-1 text-xs font-light text-zinc-400">
          {isKosmetika
            ? CATEGORY_LABELS[product.category] ?? product.category
            : product.origin === "fransiya-moyli"
            ? "Parfyum moyi"
            : "Eau de Parfum"}{" "}
          · {product.volume} ml
        </p>
        {originalOut ? (
          <p className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-orange-700">
            ⚠️ Original tugagan —{" "}
            {[
              product.stockDubay && "Dubay",
              product.stockTurkiya && "Turkiya",
            ]
              .filter(Boolean)
              .join("/")}{" "}
            analogi bor!
          </p>
        ) : (
          isFrench && (
            <p className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-amber-700">
              🇦🇪 Dubay analogi bor — originaldan ancha arzon
            </p>
          )
        )}
        {razlivOn && (
          <p className="mt-1.5 inline-flex w-fit items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-sky-700">
            💧 Razliv ham mavjud
          </p>
        )}
        {instAvailable && (
          <p className="mt-1.5 inline-flex w-fit items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-violet-700">
            📅 Muddatli to&apos;lov — {instConfig?.months ?? 3} oyga
          </p>
        )}

        <div className="mt-auto flex items-end justify-between pt-5">
          <div>
            {product.oldPrice && (
              <p className="text-xs text-zinc-400 line-through">
                {formatPrice(product.oldPrice)}
              </p>
            )}
            <p className="text-[17px] font-bold text-zinc-900">
              {formatPrice(product.price)}
            </p>
          </div>
          <button
            onClick={openPanel}
            className={`rounded-full px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] transition ${
              added
                ? "bg-zinc-950 text-white"
                : "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/30"
            }`}
          >
            {added ? "✓ Qo'shildi" : "Savatga"}
          </button>
        </div>
      </div>

      {/* ===== Tanlov paneli ===== */}
      {panelOpen && (
        <div className="absolute inset-0 z-10 flex flex-col justify-end bg-zinc-950/60 backdrop-blur-sm">
          <div className="max-h-full overflow-y-auto rounded-t-3xl bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-700">
                {step === "version"
                  ? "Qaysi versiyasini olasiz?"
                  : "Flakon yoki razliv?"}
              </p>
              <button
                onClick={closePanel}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 transition hover:bg-zinc-200"
                aria-label="Yopish"
              >
                ✕
              </button>
            </div>

            {/* 1-bosqich: versiya (faqat Fransiya atirlari) */}
            {step === "version" && (
              <div className="mt-3 space-y-2">
                {VERSIONS.map((v) => {
                  const info = VERSION_INFO[v];
                  const available = versionStock[v];
                  return (
                    <button
                      key={v}
                      onClick={() => available && pickVersion(v)}
                      disabled={!available}
                      className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                        available
                          ? "border-zinc-200 hover:border-emerald-500 hover:bg-emerald-50"
                          : "cursor-not-allowed border-zinc-200 bg-zinc-50 opacity-55"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="text-lg">{info.flag}</span>
                        <span>
                          <span
                            className={`block text-[12px] font-bold ${
                              available
                                ? "text-zinc-900"
                                : "text-zinc-400 line-through"
                            }`}
                          >
                            {info.label}
                          </span>
                          <span className="block text-[10px] font-light text-zinc-500">
                            {available ? info.desc : "Hozircha tugagan"}
                          </span>
                        </span>
                      </span>
                      <span
                        className={`shrink-0 text-[13px] font-bold ${
                          available ? "text-emerald-700" : "text-zinc-400"
                        }`}
                      >
                        {available
                          ? formatPrice(versionPrice(product.price, v))
                          : "Tugagan"}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* 2-bosqich: flakon yoki razliv */}
            {step === "variant" && (
              <div className="mt-3">
                {version && (
                  <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold text-amber-700">
                    {VERSION_INFO[version].flag} {VERSION_INFO[version].label}
                    <button
                      onClick={() => setStep("version")}
                      className="ml-1 underline"
                    >
                      o&apos;zgartirish
                    </button>
                  </p>
                )}

                <button
                  onClick={addFlakon}
                  className="flex w-full items-center justify-between rounded-2xl border border-zinc-200 px-4 py-3.5 text-left transition hover:border-emerald-500 hover:bg-emerald-50"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-lg">🧴</span>
                    <span>
                      <span className="block text-[12px] font-bold text-zinc-900">
                        Butun flakon
                      </span>
                      <span className="block text-[10px] font-light text-zinc-500">
                        {product.volume} ml — original qadoqda
                      </span>
                    </span>
                  </span>
                  <span className="shrink-0 text-[13px] font-bold text-emerald-700">
                    {formatPrice(basePrice)}
                  </span>
                </button>

                {razlivOn && (
                <button
                  onClick={() => setShowMl(!showMl)}
                  className={`mt-2 flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition ${
                    showMl
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-zinc-200 hover:border-emerald-500 hover:bg-emerald-50"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-lg">💧</span>
                    <span>
                      <span className="block text-[12px] font-bold text-zinc-900">
                        Razliv
                      </span>
                      <span className="block text-[10px] font-light text-zinc-500">
                        Istalgan hajmda quyib beramiz
                      </span>
                    </span>
                  </span>
                  <span className="shrink-0 text-[13px] font-bold text-emerald-700">
                    {formatPrice(perMl)} / ml
                  </span>
                </button>
                )}

                {razlivOn && showMl && (
                  <div className="mt-2 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500">
                      Hajmni tanlang:
                    </p>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {RAZLIV_OPTIONS.map((ml) => (
                        <button
                          key={ml}
                          onClick={() => addRazliv(ml)}
                          className="rounded-xl border border-zinc-300 bg-white px-2 py-2.5 text-center transition hover:border-emerald-500 hover:bg-emerald-600 hover:text-white"
                        >
                          <span className="block text-[12px] font-bold">
                            {ml} ml
                          </span>
                          <span className="block text-[10px] font-light">
                            {formatPrice(
                              perMl * ml
                            )}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
