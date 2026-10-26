import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, getProducts } from "@/lib/data";
import { formatPrice, CATEGORY_LABELS, ORIGIN_SHORT } from "@/lib/format";
import { AddToCart } from "@/components/add-to-cart";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { InstallmentBanner } from "@/components/installment-banner";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) notFound();

  const product = await getProduct(productId);
  if (!product) notFound();

  const all = await getProducts(
    product.category,
    undefined,
    undefined,
    product.productType
  );
  const similar = all.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <nav className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-400">
        <Link href="/" className="transition hover:text-emerald-600">
          Bosh sahifa
        </Link>{" "}
        <span className="mx-2">/</span>
        <Link href="/katalog" className="transition hover:text-emerald-600">
          Katalog
        </Link>{" "}
        <span className="mx-2">/</span>
        <span className="text-zinc-900">{product.name}</span>
      </nav>

      <div className="mt-10 grid gap-14 lg:grid-cols-2">
        <ProductGallery
          images={[product.imageUrl, product.imageUrl2 ?? ""]}
          alt={product.name}
          discountBadge={
            product.oldPrice
              ? `−${Math.round((1 - product.price / product.oldPrice) * 100)}% Chegirma`
              : null
          }
        />

        <div className="flex flex-col justify-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-emerald-600">
            {product.brand}
          </p>
          <h1 className="mt-3 font-serif text-5xl font-medium leading-tight text-zinc-900">
            {product.name}
          </h1>
          <p className="mt-2 text-sm font-light text-zinc-400">
            {product.productType === "kosmetika"
              ? CATEGORY_LABELS[product.category] ?? "Kosmetika"
              : product.origin === "fransiya-moyli"
              ? "Parfyum moyi (spirtsiz)"
              : "Eau de Parfum"}{" "}
            · {product.volume} ml
          </p>

          {product.productType !== "kosmetika" && product.origin === "fransiya" && (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50/50 p-5">
              <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] text-amber-800">
                🇦🇪 Bu atirning Dubay analogi ham bor!
              </p>
              <p className="mt-2 text-sm font-light leading-relaxed text-zinc-600">
                Dubay analogi — original atirning{" "}
                <b className="font-semibold text-zinc-800">
                  aynan shu ifor kompozitsiyasi
                </b>{" "}
                asosida BAAda ishlab chiqarilgan EDP parfyum. Siz original
                hidni his qilasiz, ammo bir necha barobar arzon narxda.
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-white/80 px-2 py-2.5">
                  <p className="text-base">👃</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-600">
                    Bir xil ifor
                  </p>
                </div>
                <div className="rounded-xl bg-white/80 px-2 py-2.5">
                  <p className="text-base">⏱</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-600">
                    EDP — uzoq turadi
                  </p>
                </div>
                <div className="rounded-xl bg-white/80 px-2 py-2.5">
                  <p className="text-base">💰</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-600">
                    ~5x arzon
                  </p>
                </div>
              </div>
              <p className="mt-3 text-[11px] font-light italic text-zinc-400">
                * Quyida versiyani tanlashingiz mumkin — halol narx, halol
                sifat. Qaysi biri sizga mos — o&apos;zingiz hal qilasiz.
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.15em]">
            <span className="rounded-full bg-zinc-950 px-4 py-1.5 text-white">
              {product.productType === "kosmetika"
                ? "💄 Kosmetika"
                : ORIGIN_SHORT[product.origin] ?? product.origin}
            </span>
            <span className="rounded-full border border-zinc-300 px-4 py-1.5 text-zinc-600">
              {CATEGORY_LABELS[product.category] ?? product.category}
            </span>
            {product.origin === "fransiya" &&
            product.inStock &&
            !product.stockFransiya &&
            (product.stockDubay || product.stockTurkiya) ? (
              <span className="rounded-full bg-orange-100 px-4 py-1.5 text-orange-700">
                Original tugagan · Analoglari sotuvda
              </span>
            ) : (
              <span
                className={`rounded-full px-4 py-1.5 ${
                  product.inStock
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {product.inStock ? "Sotuvda mavjud" : "Tugagan"}
              </span>
            )}
          </div>

          <div className="mt-8 border-l-2 border-emerald-500 pl-6">
            <p className="font-light leading-relaxed text-zinc-600">
              {product.description}
            </p>
          </div>

          <div className="mt-10 flex items-baseline gap-4">
            <span className="font-serif text-4xl font-medium text-zinc-900">
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && (
              <span className="text-lg font-light text-zinc-400 line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>

          {product.inStock && <AddToCart product={product} />}

          {product.productType === "atir" && (
            <InstallmentBanner price={product.price} />
          )}

          <div className="mt-10 grid grid-cols-3 gap-4 border-t border-zinc-200 pt-8 text-center">
            <div>
              <p className="text-xl">🛡️</p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
                100% Original
              </p>
            </div>
            <div>
              <p className="text-xl">🚚</p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
                Bepul yetkazish
              </p>
            </div>
            <div>
              <p className="text-xl">🎁</p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
                Sovg&apos;a o&apos;rami
              </p>
            </div>
          </div>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="mt-28">
          <div className="text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-emerald-600">
              Sizga yoqishi mumkin
            </p>
            <h2 className="mt-3 font-serif text-3xl font-medium text-zinc-900 sm:text-4xl">
              O&apos;xshash iforlar
            </h2>
          </div>
          <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
