"use client";

import Link from "next/link";
import { useState } from "react";

type MemberInfo = {
  name: string;
  discountPercent: number;
  orderCount: number;
};

const tiers = [
  {
    icon: "🥈",
    name: "Silver a'zo",
    requirement: "8–9 ta xarid",
    discount: "30%",
    perks: ["Barcha atirlarga 30% chegirma", "Yangi kolleksiyadan birinchi xabar", "Tug'ilgan kunda maxsus sovg'a"],
  },
  {
    icon: "👑",
    name: "Gold a'zo",
    requirement: "10+ ta xarid",
    discount: "50%",
    perks: ["Barcha atirlarga 50% chegirma", "Eksklyuziv atirlarga birinchi kirish", "Shaxsiy parfyumer maslahati", "VIP yetkazib berish"],
  },
];

export default function ClubPage() {
  const [form, setForm] = useState({ name: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{
    orderCount: number;
    needed: number;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setProgress(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/club", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.status === "not_eligible") {
          setProgress({ orderCount: data.orderCount, needed: data.needed });
        }
        setError(data.error ?? "Xatolik yuz berdi");
        return;
      }
      setMember(data.member);
      setStatus(data.status);
    } catch {
      setError("Tarmoq xatosi. Qayta urinib ko'ring.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-zinc-950 py-24 text-center">
        <div className="absolute left-1/2 top-0 h-96 w-[700px] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-[120px]" />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
          <p className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.4em] text-emerald-400">
            <span className="h-px w-10 bg-emerald-400" />
            Sodiq mijozlar klubi
            <span className="h-px w-10 bg-emerald-400" />
          </p>
          <h1 className="mt-6 font-serif text-5xl font-medium text-white sm:text-6xl">
            Ayub Parfum <span className="text-shimmer italic">Club</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base font-light leading-relaxed text-zinc-400">
            Eng sodiq mijozlarimiz uchun maxsus klub — barcha atirlarga{" "}
            <span className="font-semibold text-emerald-400">
              50% gacha doimiy chegirma
            </span>
            . Klubga qo&apos;shilish uchun kamida{" "}
            <span className="font-semibold text-white">8 ta xarid</span>{" "}
            qilgan bo&apos;lishingiz kerak.
          </p>
        </div>
      </section>

      {/* ===== DARAJALAR ===== */}
      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-emerald-600">
            A&apos;zolik darajalari
          </p>
          <h2 className="mt-4 font-serif text-4xl font-medium text-zinc-900">
            Qancha ko&apos;p xarid — shuncha katta chegirma
          </h2>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-2">
          {tiers.map((tier, i) => (
            <div
              key={tier.name}
              className={`relative rounded-[2rem] border-2 p-10 transition duration-300 hover:-translate-y-1.5 ${
                i === 1
                  ? "border-emerald-500 bg-zinc-950 shadow-2xl shadow-emerald-500/20"
                  : "border-zinc-200 bg-white hover:border-zinc-400"
              }`}
            >
              {i === 1 && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-lg">
                  Eng yuqori daraja
                </span>
              )}
              <span className="text-5xl">{tier.icon}</span>
              <h3
                className={`mt-5 font-serif text-2xl font-semibold ${
                  i === 1 ? "text-white" : "text-zinc-900"
                }`}
              >
                {tier.name}
              </h3>
              <p
                className={`mt-1 text-[11px] font-semibold uppercase tracking-[0.25em] ${
                  i === 1 ? "text-emerald-400" : "text-emerald-600"
                }`}
              >
                {tier.requirement}
              </p>
              <p
                className={`mt-6 font-serif text-6xl font-medium ${
                  i === 1 ? "text-emerald-400" : "text-zinc-900"
                }`}
              >
                −{tier.discount}
              </p>
              <ul
                className={`mt-8 space-y-3 text-sm font-light ${
                  i === 1 ? "text-zinc-300" : "text-zinc-600"
                }`}
              >
                {tier.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-3">
                    <span
                      className={
                        i === 1 ? "text-emerald-400" : "text-emerald-600"
                      }
                    >
                      ✦
                    </span>
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ===== QOSHILISH FORMASI ===== */}
      <section className="border-t border-zinc-200 bg-gradient-to-b from-zinc-50 to-white py-20">
        <div className="mx-auto max-w-xl px-4 sm:px-6">
          {member ? (
            <div className="rounded-[2rem] border-2 border-emerald-500 bg-white p-10 text-center shadow-2xl shadow-emerald-500/10">
              <span className="text-6xl">
                {member.discountPercent >= 50 ? "👑" : "🥈"}
              </span>
              <h2 className="mt-5 font-serif text-3xl font-medium text-zinc-900">
                {status === "already_member"
                  ? "Siz allaqachon a'zosiz!"
                  : status === "upgraded"
                  ? "Darajangiz oshirildi!"
                  : "Klubga xush kelibsiz!"}
              </h2>
              <p className="mt-3 font-light text-zinc-500">
                Hurmatli <span className="font-semibold text-zinc-900">{member.name}</span>,
                siz {member.orderCount} ta xarid bilan{" "}
                {member.discountPercent >= 50 ? "Gold" : "Silver"} a&apos;zosiz.
              </p>
              <div className="mx-auto mt-8 w-fit rounded-2xl bg-emerald-50 px-10 py-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-zinc-500">
                  Sizning doimiy chegirmangiz
                </p>
                <p className="mt-2 font-serif text-5xl font-medium text-emerald-600">
                  −{member.discountPercent}%
                </p>
              </div>
              <p className="mt-6 text-sm font-light text-zinc-500">
                Chegirma buyurtma berishda telefon raqamingiz orqali
                avtomatik qo&apos;llanadi.
              </p>
              <Link
                href="/katalog"
                className="mt-8 inline-block rounded-full bg-emerald-600 px-10 py-4 text-[12px] font-bold uppercase tracking-[0.15em] text-white transition hover:bg-emerald-700"
              >
                Chegirma bilan xarid qilish
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center">
                <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-emerald-600">
                  A&apos;zo bo&apos;lish
                </p>
                <h2 className="mt-4 font-serif text-4xl font-medium text-zinc-900">
                  Klubga qo&apos;shiling
                </h2>
                <p className="mt-4 text-sm font-light leading-relaxed text-zinc-500">
                  Buyurtmalarda ishlatgan telefon raqamingizni kiriting — biz
                  xaridlaringiz sonini avtomatik tekshiramiz.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="mt-10 rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-xl shadow-zinc-200/50"
              >
                <div className="space-y-5">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Ismingiz *
                    </label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder="Masalan: Alisher Karimov"
                      className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Telefon raqam (buyurtmalardagi) *
                    </label>
                    <input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      placeholder="+998 90 123 45 67"
                      className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-emerald-500"
                    />
                  </div>
                </div>

                {error && (
                  <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {progress && (
                  <div className="mt-4 rounded-xl bg-emerald-50 p-5">
                    <div className="flex justify-between text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      <span>Xaridlaringiz: {progress.orderCount} / 8</span>
                      <span>Yana {progress.needed} ta kerak</span>
                    </div>
                    <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-emerald-100">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{
                          width: `${Math.min(100, (progress.orderCount / 8) * 100)}%`,
                        }}
                      />
                    </div>
                    <p className="mt-3 text-xs font-light text-zinc-500">
                      Xarid qilishda davom eting — tez orada siz ham klub
                      a&apos;zosi bo&apos;lasiz! 💪
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-7 w-full rounded-full bg-zinc-950 py-4 text-[12px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {submitting ? "Tekshirilmoqda..." : "A'zolikni tekshirish"}
                </button>
              </form>

              <p className="mt-6 text-center text-xs font-light text-zinc-400">
                * Faqat yetkazilgan va faol buyurtmalar hisobga olinadi.
                Bekor qilingan buyurtmalar sanalmaydi.
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
