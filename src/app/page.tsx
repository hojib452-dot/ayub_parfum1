import Link from "next/link";
import { getFeaturedProducts } from "@/lib/data";
import { getSiteSettings } from "@/lib/settings";
import { ProductCard } from "@/components/product-card";

export const dynamic = "force-dynamic";

const categories = [
  {
    slug: "erkaklar",
    title: "Erkaklar uchun",
    desc: "Kuchli va jasur iforlar",
    image:
      "https://images.pexels.com/photos/7270663/pexels-photo-7270663.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  {
    slug: "ayollar",
    title: "Ayollar uchun",
    desc: "Nafis va nozik iforlar",
    image:
      "https://images.pexels.com/photos/32630380/pexels-photo-32630380.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  {
    slug: "uniseks",
    title: "Uniseks",
    desc: "Barchaga mos iforlar",
    image:
      "https://images.pexels.com/photos/30618765/pexels-photo-30618765.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  },
];

const FEATURE_ICONS = ["🛡️", "🚚", "💳", "🎁"];

const testimonials = [
  {
    name: "Jasur Toshmatov",
    role: "Doimiy mijoz",
    text: "Dior Sauvage'ni shu yerdan oldim — original ekanligiga hech shubha yo'q. Hidi kun bo'yi turadi, hamma so'rayapti qanaqa atir deb!",
  },
  {
    name: "Madina Karimova",
    role: "Toshkent",
    text: "Yara atirini sovg'a qilib oldim, qadoqlashi juda chiroyli edi. Yetkazib berish ham aytilgandek tez bo'ldi. Rahmat!",
  },
  {
    name: "Bobur Aliyev",
    role: "Samarqand",
    text: "Viloyatga 2 kunda yetib keldi. Narxlar boshqa do'konlarga qaraganda ancha hamyonbop. Endi doim shu yerdan olaman.",
  },
];

export default async function HomePage() {
  const featured = await getFeaturedProducts();
  const s = await getSiteSettings();

  const stats = [
    { value: s.stat1_value, label: s.stat1_label },
    { value: s.stat2_value, label: s.stat2_label },
    { value: s.stat3_value, label: s.stat3_label },
    { value: s.stat4_value, label: s.stat4_label },
  ];
  const features = [
    { icon: FEATURE_ICONS[0], title: s.feat1_title, desc: s.feat1_desc },
    { icon: FEATURE_ICONS[1], title: s.feat2_title, desc: s.feat2_desc },
    { icon: FEATURE_ICONS[2], title: s.feat3_title, desc: s.feat3_desc },
    { icon: FEATURE_ICONS[3], title: s.feat4_title, desc: s.feat4_desc },
  ];
  const marqueeItems = s.marquee_text
    .split("|")
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-zinc-950">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${s.hero_img})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950/40" />

        <div className="relative mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-center px-4 py-24 sm:px-6">
          <p className="animate-fade-up inline-flex w-fit items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.4em] text-emerald-300">
            <span className="h-px w-10 bg-emerald-400" />
            {s.hero_badge}
          </p>

          <h1 className="animate-fade-up-delay-1 mt-8 max-w-3xl font-serif text-5xl font-medium leading-[1.1] text-white sm:text-6xl md:text-7xl">
            {s.hero_title1}
            <br />
            <span className="text-shimmer italic">{s.hero_title2}</span>
          </h1>

          <p className="animate-fade-up-delay-2 mt-8 max-w-lg text-base font-light leading-relaxed text-zinc-300 sm:text-lg">
            {s.hero_desc}
          </p>

          <div className="animate-fade-up-delay-3 mt-12 flex flex-wrap items-center gap-5">
            <Link
              href="/katalog"
              className="group relative overflow-hidden rounded-full bg-emerald-500 px-10 py-4 text-[13px] font-bold uppercase tracking-[0.15em] text-white transition hover:bg-emerald-400 hover:shadow-xl hover:shadow-emerald-500/30"
            >
              Kolleksiyani ko&apos;rish
            </Link>
            <Link
              href="/aloqa"
              className="rounded-full border border-white/30 px-10 py-4 text-[13px] font-semibold uppercase tracking-[0.15em] text-white backdrop-blur transition hover:border-emerald-300 hover:text-emerald-300"
            >
              Bog&apos;lanish
            </Link>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-zinc-500 md:flex">
          <span className="text-[10px] uppercase tracking-[0.3em]">Pastga</span>
          <span className="h-10 w-px animate-pulse bg-gradient-to-b from-emerald-400 to-transparent" />
        </div>
      </section>

      {/* ===== BRAND MARQUEE ===== */}
      <section className="overflow-hidden border-y border-zinc-200 bg-white py-6">
        <div className="animate-marquee flex w-max items-center gap-16">
          {[...Array(2)].map((_, dup) =>
            marqueeItems.map((text, i) => (
              <span
                key={`${dup}-${i}`}
                className="flex items-center gap-16 font-serif text-xl tracking-[0.25em] text-zinc-400"
              >
                {text}
                <span className="text-emerald-500">✦</span>
              </span>
            ))
          )}
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="bg-zinc-950">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-white/10 md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center bg-zinc-950 px-6 py-12 text-center"
            >
              <span className="font-serif text-4xl font-medium text-emerald-400">
                {stat.value}
              </span>
              <span className="mt-3 text-[11px] font-medium uppercase tracking-[0.25em] text-zinc-400">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== KATALOGLAR ===== */}
      <section className="border-b border-zinc-200 bg-emerald-50/50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.4em] text-emerald-600">
            Kataloglarimiz
          </p>
          <h2 className="mt-3 text-center font-serif text-3xl font-medium text-zinc-900 sm:text-4xl">
            O&apos;zingizga mos katalogni tanlang
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                slug: "fransiya",
                badge: "🇫🇷 Fransiya",
                title: "Fransiya atirlari",
                desc: "Original va Dubay analoglari — har byudjetga",
                image:
                  "https://images.pexels.com/photos/12562773/pexels-photo-12562773.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
              },
              {
                slug: "arab",
                badge: "🇦🇪 Arab",
                title: "Arab atirlari",
                desc: "Lattafa — Asad, Khamrah, Yara va boshqalar",
                image:
                  "https://images.pexels.com/photos/38721543/pexels-photo-38721543.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
              },
              {
                slug: "turkiya",
                badge: "🇹🇷 Turkiya",
                title: "Turkiya atirlari",
                desc: "Bargello, Eyfel — sifatli va hamyonbop",
                image:
                  "https://images.pexels.com/photos/7270663/pexels-photo-7270663.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
              },
              {
                slug: "fransiya-moyli",
                badge: "🫗 Moyli",
                title: "Fransiya moyli atirlari",
                desc: "Spirtsiz, konsentrlangan parfyum moylari",
                image:
                  "https://images.pexels.com/photos/37000509/pexels-photo-37000509.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
              },
              {
                slug: "ozbekiston",
                badge: "🇺🇿 O'zbekiston",
                title: "O'zbekiston atirlari",
                desc: "Milliy ruhdagi mahalliy iforlar",
                image:
                  "https://images.pexels.com/photos/30618765/pexels-photo-30618765.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
              },
              {
                slug: "__kosmetika",
                badge: "💄 Yangi!",
                title: "Kosmetika",
                desc: "Makiyaj, parvarish, tana va soch mahsulotlari",
                image:
                  "https://images.pexels.com/photos/2535913/pexels-photo-2535913.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
              },
            ].map((cat) => (
              <Link
                key={cat.slug}
                href={
                  cat.slug === "__kosmetika"
                    ? "/kosmetika"
                    : `/katalog?katalog=${cat.slug}`
                }
                className="group relative block overflow-hidden rounded-3xl shadow-lg shadow-zinc-200/60 transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-emerald-500/20"
              >
                {/* Atir flakon rasmi */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="h-72 w-full object-cover transition duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/95 via-zinc-950/40 to-zinc-950/10" />

                {/* Badge */}
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-900 backdrop-blur">
                  {cat.badge}
                </span>

                {/* Matn */}
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="font-serif text-xl font-semibold text-white">
                    {cat.title}
                  </h3>
                  <p className="mt-1 text-xs font-light leading-snug text-zinc-300">
                    {cat.desc}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-300 transition group-hover:gap-4">
                    Ko&apos;rish <span>→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== KATEGORIYALAR ===== */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-emerald-600">
            Kolleksiyalar
          </p>
          <h2 className="mt-4 font-serif text-4xl font-medium text-zinc-900 sm:text-5xl">
            O&apos;zingizga mosini tanlang
          </h2>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/katalog?kategoriya=${cat.slug}`}
              className="group relative block overflow-hidden rounded-3xl"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cat.image}
                alt={cat.title}
                className="h-[420px] w-full object-cover transition duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-8">
                <h3 className="font-serif text-2xl font-medium text-white">
                  {cat.title}
                </h3>
                <p className="mt-1 text-sm font-light text-zinc-300">
                  {cat.desc}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-300 transition group-hover:gap-4">
                  Ko&apos;rish <span>→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== TANLANGAN IFORLAR ===== */}
      <section className="border-y border-zinc-200 bg-gradient-to-b from-zinc-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-emerald-600">
                Bestseller
              </p>
              <h2 className="mt-4 font-serif text-4xl font-medium text-zinc-900 sm:text-5xl">
                Tanlangan iforlar
              </h2>
            </div>
            <Link
              href="/katalog"
              className="group inline-flex items-center gap-2 border-b border-zinc-900 pb-1 text-[12px] font-semibold uppercase tracking-[0.2em] text-zinc-900 transition hover:border-emerald-600 hover:text-emerald-700"
            >
              Barchasini ko&apos;rish
              <span className="transition group-hover:translate-x-1">→</span>
            </Link>
          </div>

          <div className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== AFZALLIKLAR ===== */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-emerald-600">
            Bizning qadriyatlar
          </p>
          <h2 className="mt-4 font-serif text-4xl font-medium text-zinc-900 sm:text-5xl">
            Nega aynan Ayub Parfum?
          </h2>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-3xl border border-zinc-200 bg-white p-8 transition duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/10"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl transition group-hover:bg-emerald-100">
                {f.icon}
              </span>
              <h3 className="mt-6 font-serif text-lg font-semibold text-zinc-900">
                {f.title}
              </h3>
              <p className="mt-3 text-sm font-light leading-relaxed text-zinc-500">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CLUB BANNER ===== */}
      <section className="relative overflow-hidden bg-zinc-950 py-20">
        <div className="absolute right-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-emerald-500/20 blur-[100px]" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-10 px-4 sm:px-6 md:flex-row md:justify-between">
          <div className="max-w-xl text-center md:text-left">
            <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-emerald-400">
              Sodiq mijozlar uchun
            </p>
            <h2 className="mt-4 font-serif text-4xl font-medium text-white sm:text-5xl">
              👑 {s.club_title}{" "}
              <span className="text-shimmer italic">Club</span>
            </h2>
            <p className="mt-5 text-base font-light leading-relaxed text-zinc-400">
              {s.club_desc}
            </p>
            <Link
              href="/club"
              className="mt-8 inline-block rounded-full bg-emerald-500 px-10 py-4 text-[12px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-emerald-400 hover:shadow-xl hover:shadow-emerald-500/30"
            >
              Klub haqida batafsil
            </Link>
          </div>
          <div className="flex gap-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 px-10 py-8 text-center backdrop-blur">
              <p className="text-3xl">🥈</p>
              <p className="mt-3 font-serif text-4xl font-medium text-white">
                −30%
              </p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                8+ xarid
              </p>
            </div>
            <div className="rounded-3xl border border-emerald-400/40 bg-emerald-500/10 px-10 py-8 text-center backdrop-blur">
              <p className="text-3xl">👑</p>
              <p className="mt-3 font-serif text-4xl font-medium text-emerald-400">
                −50%
              </p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                10+ xarid
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MIJOZLAR FIKRI ===== */}
      <section className="bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <div className="text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-emerald-400">
              Mijozlar fikri
            </p>
            <h2 className="mt-4 font-serif text-4xl font-medium text-white sm:text-5xl">
              Bizga ishonganlar
            </h2>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure
                key={t.name}
                className="flex flex-col rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur transition hover:border-emerald-400/30"
              >
                <div className="flex gap-1 text-emerald-400">
                  {"★★★★★".split("").map((s, i) => (
                    <span key={i}>{s}</span>
                  ))}
                </div>
                <blockquote className="mt-5 flex-1 text-sm font-light leading-relaxed text-zinc-300">
                  &ldquo;{t.text}&rdquo;
                </blockquote>
                <figcaption className="mt-6 border-t border-white/10 pt-5">
                  <p className="font-serif font-semibold text-white">
                    {t.name}
                  </p>
                  <p className="mt-0.5 text-xs uppercase tracking-[0.2em] text-zinc-500">
                    {t.role}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative overflow-hidden bg-white py-28">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-100/60 blur-[120px]" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-emerald-600">
            Ayub Parfum
          </p>
          <h2 className="mt-5 font-serif text-4xl font-medium leading-tight text-zinc-900 sm:text-5xl">
            {s.cta_title}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base font-light leading-relaxed text-zinc-500">
            {s.cta_desc}
          </p>
          <Link
            href="/katalog"
            className="mt-10 inline-block rounded-full bg-zinc-950 px-12 py-4 text-[13px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-500/20"
          >
            {s.cta_btn}
          </Link>
        </div>
      </section>
    </div>
  );
}
