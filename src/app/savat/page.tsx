"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart, cartItemKey } from "@/components/cart-context";
import { formatPrice } from "@/lib/format";

type ClubCheck = {
  name: string;
  discountPercent: number;
} | null;

export default function SavatPage() {
  const { items, updateQuantity, removeItem, clearCart, totalPrice } =
    useCart();
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    address: "",
    comment: "",
  });
  const [deliveryType, setDeliveryType] = useState<
    "yetkazib_berish" | "olib_ketish"
  >("yetkazib_berish");
  const [paymentMethod, setPaymentMethod] = useState<
    "naqd" | "karta" | "muddatli"
  >("naqd");
  const [instMonths, setInstMonths] = useState<2 | 3>(3);
  const [instConfig, setInstConfig] = useState<{
    enabled: boolean;
    minPrice: number;
    downPercent: number;
  } | null>(null);
  const [location, setLocation] = useState<{
    lat: string;
    lng: string;
  } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [shop, setShop] = useState({
    address: "Toshkent sh., Chilonzor tumani, Bunyodkor ko'chasi 12",
    phone: "+998 90 123 45 67",
    hours: "Har kuni 10:00 — 21:00",
    lat: 41.285,
    lng: 69.215,
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setShop({
            address: d.site_address,
            phone: d.site_phone,
            hours: d.site_work_hours,
            lat: Number(d.site_lat) || 41.285,
            lng: Number(d.site_lng) || 69.215,
          });
          setInstConfig({
            enabled: d.installment_enabled === "1",
            minPrice: Number(d.installment_min_price) || 300000,
            downPercent: Number(d.installment_down_percent) || 30,
          });
        }
      })
      .catch(() => {});
  }, []);

  function detectLocation() {
    if (!navigator.geolocation) {
      setLocError("Brauzeringiz geolokatsiyani qo'llab-quvvatlamaydi");
      return;
    }
    setLocating(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
        });
        setLocating(false);
      },
      () => {
        setLocError(
          "Lokatsiyani aniqlab bo'lmadi. Manzilni qo'lda yozib qoldiring."
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }
  const [error, setError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<number | null>(null);
  const [clubMember, setClubMember] = useState<ClubCheck>(null);
  const [clubChecking, setClubChecking] = useState(false);
  const [clubMessage, setClubMessage] = useState<string | null>(null);

  const discountAmount = clubMember
    ? Math.round((totalPrice * clubMember.discountPercent) / 100)
    : 0;
  const finalTotal = totalPrice - discountAmount;

  // Muddatli to'lov mavjudligi va hisob-kitobi
  const instAvailable =
    instConfig?.enabled && finalTotal >= (instConfig?.minPrice ?? Infinity);
  const instDown = instConfig
    ? Math.ceil((finalTotal * instConfig.downPercent) / 100 / 1000) * 1000
    : 0;
  const instMonthly = Math.ceil((finalTotal - instDown) / instMonths / 1000) * 1000;

  // Muddatli tanlangan, lekin shart bajarilmasa — naqdga qaytar
  useEffect(() => {
    if (paymentMethod === "muddatli" && !instAvailable) {
      setPaymentMethod("naqd");
    }
  }, [paymentMethod, instAvailable]);

  async function checkClub() {
    if (!form.phone.trim()) {
      setClubMessage("Avval yuqorida telefon raqamingizni kiriting");
      return;
    }
    setClubChecking(true);
    setClubMessage(null);
    try {
      const res = await fetch(
        `/api/club?phone=${encodeURIComponent(form.phone)}`
      );
      const data = await res.json();
      if (data.member) {
        setClubMember(data.member);
        setClubMessage(null);
      } else {
        setClubMember(null);
        setClubMessage(
          data.orderCount !== undefined
            ? `Siz hali klub a'zosi emassiz. Xaridlaringiz: ${data.orderCount} ta (kamida 8 ta kerak).`
            : data.error ?? "A'zolik topilmadi"
        );
      }
    } catch {
      setClubMessage("Tekshirishda xatolik. Qayta urinib ko'ring.");
    } finally {
      setClubChecking(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          paymentMethod,
          installmentMonths:
            paymentMethod === "muddatli" ? instMonths : undefined,
          deliveryType,
          locationLat: deliveryType === "yetkazib_berish" ? location?.lat : undefined,
          locationLng: deliveryType === "yetkazib_berish" ? location?.lng : undefined,
          clubPhone: clubMember ? form.phone : undefined,
          items: items.map((i) => {
            const parts = [
              i.version,
              i.variant === "razliv"
                ? `Razliv ${i.volume} ml`
                : `Flakon ${i.volume} ml`,
            ].filter(Boolean);
            return {
              productId: i.productId,
              name: `${i.name} (${parts.join(", ")})`,
              price: i.price,
              quantity: i.quantity,
            };
          }),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Xatolik yuz berdi");
        return;
      }
      setSuccessId(data.orderId);
      clearCart();
    } catch {
      setError("Tarmoq xatosi. Qayta urinib ko'ring.");
    } finally {
      setSubmitting(false);
    }
  }

  if (successId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-4xl">
          ✅
        </div>
        <h1 className="mt-6 font-serif text-3xl font-medium text-zinc-900">
          Buyurtmangiz qabul qilindi!
        </h1>
        <p className="mt-3 font-light text-zinc-500">
          Buyurtma raqami:{" "}
          <span className="font-bold text-emerald-700">#{successId}</span>.
          Operatorlarimiz tez orada siz bilan bog&apos;lanadi.
        </p>
        <Link
          href="/katalog"
          className="mt-8 inline-block rounded-full bg-emerald-600 px-10 py-3.5 text-[12px] font-bold uppercase tracking-[0.15em] text-white transition hover:bg-emerald-700"
        >
          Xaridni davom ettirish
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-4xl">
          🛒
        </div>
        <h1 className="mt-6 font-serif text-3xl font-medium text-zinc-900">
          Savatingiz bo&apos;sh
        </h1>
        <p className="mt-3 font-light text-zinc-500">
          Katalogdan o&apos;zingizga yoqqan atirni tanlang.
        </p>
        <Link
          href="/katalog"
          className="mt-8 inline-block rounded-full bg-emerald-600 px-10 py-3.5 text-[12px] font-bold uppercase tracking-[0.15em] text-white transition hover:bg-emerald-700"
        >
          Katalogga o&apos;tish
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <p className="text-center text-[11px] font-semibold uppercase tracking-[0.4em] text-emerald-600">
        Buyurtmani rasmiylashtirish
      </p>
      <h1 className="mt-3 text-center font-serif text-5xl font-medium text-zinc-900">
        Savat
      </h1>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_400px]">
        {/* Items */}
        <div className="space-y-4">
          {items.map((item) => {
            const key = cartItemKey(item);
            return (
              <div
                key={key}
                className="flex gap-4 rounded-2xl border border-zinc-200 bg-white p-4"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-24 w-24 rounded-xl object-cover"
                />
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-600">
                        {item.brand}
                      </p>
                      <Link
                        href={`/mahsulot/${item.productId}`}
                        className="font-serif font-semibold text-zinc-900 hover:text-emerald-700"
                      >
                        {item.name}
                      </Link>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] ${
                            item.variant === "razliv"
                              ? "bg-sky-100 text-sky-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {item.variant === "razliv"
                            ? `💧 Razliv ${item.volume} ml`
                            : `🧴 Flakon ${item.volume} ml`}
                        </span>
                        {item.version && (
                          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-amber-700">
                            {item.version}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(key)}
                      className="text-zinc-400 transition hover:text-red-500"
                      aria-label="O'chirish"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="flex items-center rounded-full border border-zinc-300">
                      <button
                        onClick={() => updateQuantity(key, item.quantity - 1)}
                        className="flex h-8 w-8 items-center justify-center text-zinc-700 hover:text-emerald-600"
                      >
                        −
                      </button>
                      <span className="w-7 text-center text-sm font-semibold text-zinc-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(key, item.quantity + 1)}
                        className="flex h-8 w-8 items-center justify-center text-zinc-700 hover:text-emerald-600"
                      >
                        +
                      </button>
                    </div>
                    <p className="font-bold text-emerald-700">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Checkout */}
        <form
          onSubmit={handleSubmit}
          className="h-fit rounded-3xl border border-zinc-200 bg-zinc-50 p-6"
        >
          <h2 className="font-serif text-xl font-semibold text-zinc-900">
            Buyurtma berish
          </h2>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Ismingiz *
              </label>
              <input
                required
                value={form.customerName}
                onChange={(e) =>
                  setForm({ ...form, customerName: e.target.value })
                }
                placeholder="Masalan: Alisher Karimov"
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Telefon raqam *
              </label>
              <input
                required
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+998 90 123 45 67"
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-emerald-500"
              />
            </div>
            {/* ===== Yetkazib berish usuli ===== */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Qanday olasiz? *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryType("yetkazib_berish")}
                  className={`rounded-2xl border-2 p-4 text-left transition ${
                    deliveryType === "yetkazib_berish"
                      ? "border-emerald-600 bg-emerald-50"
                      : "border-zinc-200 bg-white hover:border-zinc-400"
                  }`}
                >
                  <span className="text-xl">🚚</span>
                  <span
                    className={`mt-1.5 block text-[11px] font-bold uppercase tracking-wide ${
                      deliveryType === "yetkazib_berish"
                        ? "text-emerald-700"
                        : "text-zinc-700"
                    }`}
                  >
                    Yetkazib berish
                  </span>
                  <span className="mt-0.5 block text-[10px] font-light text-zinc-500">
                    Manzilingizga — bepul
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryType("olib_ketish")}
                  className={`rounded-2xl border-2 p-4 text-left transition ${
                    deliveryType === "olib_ketish"
                      ? "border-emerald-600 bg-emerald-50"
                      : "border-zinc-200 bg-white hover:border-zinc-400"
                  }`}
                >
                  <span className="text-xl">🏬</span>
                  <span
                    className={`mt-1.5 block text-[11px] font-bold uppercase tracking-wide ${
                      deliveryType === "olib_ketish"
                        ? "text-emerald-700"
                        : "text-zinc-700"
                    }`}
                  >
                    Do&apos;kondan olib ketish
                  </span>
                  <span className="mt-0.5 block text-[10px] font-light text-zinc-500">
                    Ayub Parfum do&apos;konidan
                  </span>
                </button>
              </div>
            </div>

            {/* Yetkazib berish tanlansa — manzil + lokatsiya */}
            {deliveryType === "yetkazib_berish" && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Yetkazib berish manzili *
                </label>
                <input
                  required
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  placeholder="Shahar, tuman, ko'cha, uy"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={locating}
                  className={`mt-2.5 w-full rounded-xl border py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] transition disabled:opacity-50 ${
                    location
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-zinc-300 text-zinc-600 hover:border-emerald-500 hover:text-emerald-700"
                  }`}
                >
                  {locating
                    ? "📡 Aniqlanmoqda..."
                    : location
                    ? "✅ Lokatsiya aniqlandi"
                    : "📍 Mening lokatsiyamni aniqlash"}
                </button>
                {location && (
                  <div className="mt-2.5 overflow-hidden rounded-xl border border-emerald-200">
                    <iframe
                      title="Sizning lokatsiyangiz"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(location.lng) - 0.005}%2C${Number(location.lat) - 0.003}%2C${Number(location.lng) + 0.005}%2C${Number(location.lat) + 0.003}&layer=mapnik&marker=${location.lat}%2C${location.lng}`}
                      className="h-40 w-full"
                      loading="lazy"
                    />
                    <p className="bg-emerald-50 px-3 py-2 text-[11px] text-emerald-700">
                      📍 Kuryer shu lokatsiyaga keladi
                    </p>
                  </div>
                )}
                {locError && (
                  <p className="mt-2 text-xs text-red-600">{locError}</p>
                )}
              </div>
            )}

            {/* Olib ketish tanlansa — do'kon manzili va xaritasi */}
            {deliveryType === "olib_ketish" && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">
                  🏬 Ayub Parfum do&apos;koni manzili
                </p>
                <p className="mt-2 text-sm text-zinc-700">{shop.address}</p>
                <p className="mt-1 text-xs font-light text-zinc-500">
                  🕙 {shop.hours} · 📞 {shop.phone}
                </p>
                <div className="mt-3 overflow-hidden rounded-xl border border-emerald-200">
                  <iframe
                    title="Ayub Parfum lokatsiyasi"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${shop.lng - 0.01}%2C${shop.lat - 0.005}%2C${shop.lng + 0.01}%2C${shop.lat + 0.005}&layer=mapnik&marker=${shop.lat}%2C${shop.lng}`}
                    className="h-40 w-full"
                    loading="lazy"
                  />
                </div>
                <a
                  href={`https://www.google.com/maps?q=${shop.lat},${shop.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2.5 block rounded-xl bg-emerald-600 py-2.5 text-center text-[11px] font-bold uppercase tracking-[0.1em] text-white transition hover:bg-emerald-700"
                >
                  📍 Google Maps&apos;da ochish
                </a>
              </div>
            )}
            {/* ===== To'lov usuli ===== */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                To&apos;lov usuli * <span className="normal-case font-light">(joyida to&apos;lanadi)</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("naqd")}
                  className={`rounded-2xl border-2 p-4 text-left transition ${
                    paymentMethod === "naqd"
                      ? "border-emerald-600 bg-emerald-50"
                      : "border-zinc-200 bg-white hover:border-zinc-400"
                  }`}
                >
                  <span className="text-xl">💵</span>
                  <span
                    className={`mt-1.5 block text-[11px] font-bold uppercase tracking-wide ${
                      paymentMethod === "naqd"
                        ? "text-emerald-700"
                        : "text-zinc-700"
                    }`}
                  >
                    Joyida naqd
                  </span>
                  <span className="mt-0.5 block text-[10px] font-light text-zinc-500">
                    {deliveryType === "olib_ketish"
                      ? "Do'konda naqd to'laysiz"
                      : "Kuryerga naqd to'laysiz"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("karta")}
                  className={`rounded-2xl border-2 p-4 text-left transition ${
                    paymentMethod === "karta"
                      ? "border-emerald-600 bg-emerald-50"
                      : "border-zinc-200 bg-white hover:border-zinc-400"
                  }`}
                >
                  <span className="text-xl">💳</span>
                  <span
                    className={`mt-1.5 block text-[11px] font-bold uppercase tracking-wide ${
                      paymentMethod === "karta"
                        ? "text-emerald-700"
                        : "text-zinc-700"
                    }`}
                  >
                    Joyida karta
                  </span>
                  <span className="mt-0.5 block text-[10px] font-light text-zinc-500">
                    {deliveryType === "olib_ketish"
                      ? "Do'konda terminal orqali"
                      : "Kuryerda karta orqali"}
                  </span>
                </button>
              </div>

              {/* ===== Muddatli to'lov varianti ===== */}
              {instAvailable && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod("muddatli")}
                  className={`mt-3 w-full rounded-2xl border-2 p-4 text-left transition ${
                    paymentMethod === "muddatli"
                      ? "border-violet-600 bg-violet-50"
                      : "border-violet-200 bg-white hover:border-violet-400"
                  }`}
                >
                  <span className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="text-xl">📅</span>
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wide ${
                          paymentMethod === "muddatli"
                            ? "text-violet-700"
                            : "text-zinc-700"
                        }`}
                      >
                        Muddatli to&apos;lov — o&apos;z narxiga!
                      </span>
                    </span>
                    <span className="rounded-full bg-violet-600 px-2.5 py-0.5 text-[9px] font-bold uppercase text-white">
                      0% ustama
                    </span>
                  </span>
                  <span className="mt-1 block text-[10px] font-light text-zinc-500">
                    Boshlang&apos;ich {instConfig?.downPercent}% + qolgani
                    oylarga bo&apos;lib. Pasport bilan rasmiylashtiriladi.
                  </span>
                </button>
              )}

              {/* Muddat tanlash: 2 yoki 3 oy */}
              {paymentMethod === "muddatli" && instAvailable && (
                <div className="mt-3 rounded-2xl border border-violet-200 bg-violet-50/60 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-violet-800">
                    Necha oyga bo&apos;lib to&apos;laysiz?
                  </p>
                  <div className="mt-2.5 grid grid-cols-2 gap-2">
                    {([2, 3] as const).map((m) => {
                      const monthly =
                        Math.ceil((finalTotal - instDown) / m / 1000) * 1000;
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setInstMonths(m)}
                          className={`rounded-xl border-2 p-3 text-center transition ${
                            instMonths === m
                              ? "border-violet-600 bg-white shadow-md"
                              : "border-zinc-200 bg-white/70 hover:border-violet-400"
                          }`}
                        >
                          <span
                            className={`block text-sm font-bold ${
                              instMonths === m
                                ? "text-violet-700"
                                : "text-zinc-700"
                            }`}
                          >
                            {m} oy
                          </span>
                          <span className="mt-0.5 block text-[10px] font-light text-zinc-500">
                            {formatPrice(monthly)}/oy
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {/* Hisob-kitob */}
                  <div className="mt-3 space-y-1.5 rounded-xl bg-white p-3.5 text-xs">
                    <p className="flex justify-between text-zinc-600">
                      <span>Boshlang&apos;ich to&apos;lov ({instConfig?.downPercent}%)</span>
                      <b className="text-violet-700">{formatPrice(instDown)}</b>
                    </p>
                    <p className="flex justify-between text-zinc-600">
                      <span>Oylik to&apos;lov × {instMonths}</span>
                      <b className="text-violet-700">
                        {formatPrice(instMonthly)}
                      </b>
                    </p>
                    <p className="flex justify-between border-t border-zinc-100 pt-1.5 text-zinc-600">
                      <span>Jami (ustamasiz)</span>
                      <b className="text-emerald-700">
                        {formatPrice(finalTotal)}
                      </b>
                    </p>
                  </div>
                  <p className="mt-2.5 text-[10px] font-light leading-relaxed text-zinc-500">
                    ℹ️ Buyurtma qabul qilingach operatorimiz qo&apos;ng&apos;iroq
                    qiladi. Rasmiylashtirish uchun pasport kerak bo&apos;ladi.
                    Boshlang&apos;ich to&apos;lov mahsulot topshirilganda
                    olinadi.
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Izoh (ixtiyoriy)
              </label>
              <textarea
                rows={2}
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                placeholder="Qo'shimcha ma'lumot..."
                className="w-full resize-none rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Club chegirmasi */}
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
            {clubMember ? (
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                  {clubMember.discountPercent >= 50 ? "👑" : "🥈"} Club
                  a&apos;zosi: {clubMember.name}
                </p>
                <p className="mt-1 text-xs font-light text-emerald-700">
                  Sizga −{clubMember.discountPercent}% doimiy chegirma
                  qo&apos;llandi!
                </p>
              </div>
            ) : (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
                  👑 Ayub Parfum Club a&apos;zosimisiz?
                </p>
                <p className="mt-1 text-xs font-light text-zinc-500">
                  Telefon raqamingizni yuqorida kiriting va tekshiring —
                  50% gacha chegirma olishingiz mumkin.
                </p>
                <button
                  type="button"
                  onClick={checkClub}
                  disabled={clubChecking}
                  className="mt-3 w-full rounded-full border border-emerald-600 py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-700 transition hover:bg-emerald-600 hover:text-white disabled:opacity-50"
                >
                  {clubChecking
                    ? "Tekshirilmoqda..."
                    : "A'zolikni tekshirish"}
                </button>
                {clubMessage && (
                  <p className="mt-2 text-xs text-zinc-500">
                    {clubMessage}{" "}
                    <Link
                      href="/club"
                      className="font-semibold text-emerald-700 underline"
                    >
                      Club haqida
                    </Link>
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 space-y-2 border-t border-zinc-200 pt-4 text-sm">
            <div className="flex justify-between text-zinc-500">
              <span>Mahsulotlar</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            {clubMember && (
              <div className="flex justify-between font-semibold text-emerald-600">
                <span>Club chegirmasi (−{clubMember.discountPercent}%)</span>
                <span>−{formatPrice(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-500">
              <span>Yetkazib berish</span>
              <span className="font-semibold text-emerald-600">Bepul</span>
            </div>
            <div className="flex justify-between pt-2 text-base font-bold text-zinc-900">
              <span>Jami</span>
              <span className="text-emerald-700">
                {formatPrice(finalTotal)}
              </span>
            </div>
            {paymentMethod === "muddatli" && instAvailable && (
              <div className="rounded-xl bg-violet-50 px-3.5 py-2.5 text-xs">
                <p className="flex justify-between font-semibold text-violet-800">
                  <span>📅 Hozir to&apos;laysiz (boshlang&apos;ich)</span>
                  <span>{formatPrice(instDown)}</span>
                </p>
                <p className="mt-1 flex justify-between text-violet-600">
                  <span>Keyin {instMonths} oy davomida</span>
                  <span>{formatPrice(instMonthly)}/oy</span>
                </p>
              </div>
            )}
          </div>

          {error && (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-full bg-emerald-600 py-4 text-[12px] font-bold uppercase tracking-[0.15em] text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {submitting ? "Yuborilmoqda..." : "Buyurtmani tasdiqlash"}
          </button>
        </form>
      </div>
    </div>
  );
}
