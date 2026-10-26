import Link from "next/link";
import { getProducts } from "@/lib/data";
import { ProductCard } from "@/components/product-card";
import { KOSMETIKA_CATEGORIES } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kosmetika — Ayub Parfum",
};

const tabs = [{ slug: "barchasi", label: "🌸 Barchasi" }, ...KOSMETIKA_CATEGORIES];

export default async function KosmetikaPage({
  searchParams,
}: {
  searchParams: Promise<{ kategoriya?: string; q?: string }>;
}) {
  const { kategoriya, q } = await searchParams;
  const active = kategoriya ?? "barchasi";
  const searchQuery = q ?? "";
  const items = await getProducts(active, undefined, searchQuery, "kosmetika");

  return (
    <div>
      {/* Premium header band */}
      <section className="relative overflow-hidden bg-zinc-950 py-20 text-center">
        <div className="absolute left-1/2 top-0 h-72 w-[600px] -translate-x-1/2 rounded-full bg-pink-500/15 blur-[100px]" />
        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-pink-300">
            Go&apos;zallik olami
          </p>
          <h1 className="mt-4 font-serif text-5xl font-medium text-white sm:text-6xl">
            Kosmetika
          </h1>
          <p className="mt-4 text-sm font-light text-zinc-400">
            Makiyaj · Yuz parvarishi · Tana · Soch — {items.length} ta mahsulot
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        {/* Qidiruv */}
        <form action="/kosmetika" method="GET" className="mx-auto flex max-w-xl gap-2">
          {active !== "barchasi" && (
            <input type="hidden" name="kategoriya" value={active} />
          )}
          <div className="flex flex-1 items-center gap-3 rounded-full border border-zinc-300 bg-white px-5 transition focus-within:border-emerald-500">
            <svg className="h-4 w-4 shrink-0 text-zinc-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              name="q"
              defaultValue={searchQuery}
              placeholder="Kosmetika qidirish — krem, pomada, serum..."
              className="w-full bg-transparent py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-full bg-emerald-600 px-7 py-3 text-[12px] font-bold uppercase tracking-[0.1em] text-white transition hover:bg-emerald-700"
          >
            Qidirish
          </button>
        </form>

        {searchQuery && (
          <p className="mt-4 text-center text-sm text-zinc-600">
            <b className="text-emerald-700">&ldquo;{searchQuery}&rdquo;</b>{" "}
            bo&apos;yicha {items.length} ta natija ·{" "}
            <Link href="/kosmetika" className="font-semibold text-red-500 underline">
              tozalash
            </Link>
          </p>
        )}

        {/* Kategoriya tablari */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {tabs.map((tab) => (
            <Link
              key={tab.slug}
              href={
                tab.slug === "barchasi"
                  ? "/kosmetika"
                  : `/kosmetika?kategoriya=${tab.slug}`
              }
              className={`rounded-full px-6 py-2.5 text-[12px] font-bold uppercase tracking-[0.1em] transition ${
                active === tab.slug
                  ? "bg-zinc-950 text-white shadow-lg"
                  : "border border-zinc-300 text-zinc-600 hover:border-emerald-500 hover:text-emerald-700"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {items.length === 0 && (
          <p className="mt-16 text-center font-light text-zinc-500">
            Bu kategoriyada hozircha mahsulot yo&apos;q.
          </p>
        )}
      </div>
    </div>
  );
}
