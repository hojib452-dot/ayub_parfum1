import Link from "next/link";
import { getProducts } from "@/lib/data";
import { ProductCard } from "@/components/product-card";

export const dynamic = "force-dynamic";

const originTabs = [
  { slug: "barchasi", label: "🌍 Barcha kataloglar" },
  { slug: "fransiya", label: "🇫🇷 Fransiya atirlari" },
  { slug: "arab", label: "🇦🇪 Arab atirlari" },
  { slug: "turkiya", label: "🇹🇷 Turkiya atirlari" },
  { slug: "fransiya-moyli", label: "🫗 Fransiya moyli atirlari" },
  { slug: "ozbekiston", label: "🇺🇿 O'zbekiston atirlari" },
];

const categoryTabs = [
  { slug: "barchasi", label: "Barchasi" },
  { slug: "erkaklar", label: "Erkaklar" },
  { slug: "ayollar", label: "Ayollar" },
  { slug: "uniseks", label: "Uniseks" },
];

function buildHref(origin: string, category: string, q?: string) {
  const params = new URLSearchParams();
  if (origin !== "barchasi") params.set("katalog", origin);
  if (category !== "barchasi") params.set("kategoriya", category);
  if (q && q.trim()) params.set("q", q.trim());
  const qs = params.toString();
  return qs ? `/katalog?${qs}` : "/katalog";
}

export default async function KatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ kategoriya?: string; katalog?: string; q?: string }>;
}) {
  const { kategoriya, katalog, q } = await searchParams;
  const activeCategory = kategoriya ?? "barchasi";
  const activeOrigin = katalog ?? "barchasi";
  const searchQuery = q ?? "";
  const products = await getProducts(activeCategory, activeOrigin, searchQuery);

  return (
    <div>
      {/* Premium header band */}
      <section className="relative overflow-hidden bg-zinc-950 py-20 text-center">
        <div className="absolute left-1/2 top-0 h-72 w-[600px] -translate-x-1/2 rounded-full bg-emerald-500/15 blur-[100px]" />
        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-emerald-400">
            Ayub Parfum Kolleksiyasi
          </p>
          <h1 className="mt-4 font-serif text-5xl font-medium text-white sm:text-6xl">
            Katalog
          </h1>
          <p className="mt-4 text-sm font-light text-zinc-400">
            Fransiya · Turkiya · Moyli · O&apos;zbekiston —{" "}
            {products.length} ta premium ifor
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        {/* Qidiruv formasi */}
        <form
          action="/katalog"
          method="GET"
          className="mx-auto flex max-w-xl gap-2"
        >
          {activeOrigin !== "barchasi" && (
            <input type="hidden" name="katalog" value={activeOrigin} />
          )}
          {activeCategory !== "barchasi" && (
            <input type="hidden" name="kategoriya" value={activeCategory} />
          )}
          <div className="flex flex-1 items-center gap-3 rounded-full border border-zinc-300 bg-white px-5 transition focus-within:border-emerald-500 focus-within:shadow-lg focus-within:shadow-emerald-500/10">
            <svg
              className="h-4 w-4 shrink-0 text-zinc-400"
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
              name="q"
              defaultValue={searchQuery}
              placeholder="Atir nomi, brendi yoki notasi bo'yicha qidiring..."
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

        {/* Qidiruv natijasi haqida */}
        {searchQuery && (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <p className="text-sm text-zinc-600">
              <b className="text-emerald-700">&ldquo;{searchQuery}&rdquo;</b>{" "}
              bo&apos;yicha {products.length} ta natija topildi
            </p>
            <Link
              href={buildHref(activeOrigin, activeCategory)}
              className="rounded-full border border-zinc-300 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wide text-zinc-500 transition hover:border-red-400 hover:text-red-500"
            >
              ✕ Qidiruvni tozalash
            </Link>
          </div>
        )}

        {/* Katalog (davlat) tanlash */}
        <p className="mt-10 text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-zinc-500">
          Katalogni tanlang
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {originTabs.map((tab) => (
            <Link
              key={tab.slug}
              href={buildHref(tab.slug, activeCategory, searchQuery)}
              className={`rounded-full px-6 py-3 text-[12px] font-bold uppercase tracking-[0.1em] transition ${
                activeOrigin === tab.slug
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/25"
                  : "border border-zinc-300 text-zinc-600 hover:border-emerald-500 hover:text-emerald-700"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Kategoriya tanlash */}
        <div className="mt-8 flex flex-wrap justify-center gap-3 border-t border-zinc-100 pt-8">
          {categoryTabs.map((tab) => (
            <Link
              key={tab.slug}
              href={buildHref(activeOrigin, tab.slug, searchQuery)}
              className={`rounded-full px-7 py-2.5 text-[12px] font-bold uppercase tracking-[0.15em] transition ${
                activeCategory === tab.slug
                  ? "bg-zinc-950 text-white shadow-lg"
                  : "border border-zinc-300 text-zinc-600 hover:border-emerald-500 hover:text-emerald-700"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <div className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {products.length === 0 && (
          <div className="mt-16 text-center">
            <p className="text-4xl">😔</p>
            <p className="mt-4 font-light text-zinc-500">
              {searchQuery
                ? `"${searchQuery}" bo'yicha hech narsa topilmadi. Boshqa so'z bilan urinib ko'ring.`
                : "Bu katalogda hozircha mahsulot yo'q."}
            </p>
            {searchQuery && (
              <Link
                href="/katalog"
                className="mt-6 inline-block rounded-full bg-emerald-600 px-8 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-white transition hover:bg-emerald-700"
              >
                Barcha mahsulotlar
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
