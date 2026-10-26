import { getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Aloqa — Ayub Parfum",
};

export default async function AloqaPage() {
  const s = await getSiteSettings();
  const lat = Number(s.site_lat) || 41.285;
  const lng = Number(s.site_lng) || 69.215;

  const contacts = [
    {
      icon: "📍",
      title: "Manzil",
      lines: [s.site_address, ""],
    },
    {
      icon: "📞",
      title: "Telefon",
      lines: [s.site_phone, s.site_phone2],
    },
    {
      icon: "✉️",
      title: "Email / Telegram",
      lines: [s.site_email, s.site_telegram.replace("https://t.me/", "@")],
    },
    {
      icon: "🕙",
      title: "Ish vaqti",
      lines: [s.site_work_hours, ""],
    },
  ];

  return (
    <div>
      {/* Premium header band */}
      <section className="relative overflow-hidden bg-zinc-950 py-20 text-center">
        <div className="absolute left-1/2 top-0 h-72 w-[600px] -translate-x-1/2 rounded-full bg-emerald-500/15 blur-[100px]" />
        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-emerald-400">
            Biz bilan bog&apos;laning
          </p>
          <h1 className="mt-4 font-serif text-5xl font-medium text-white sm:text-6xl">
            Aloqa
          </h1>
          <p className="mt-4 text-sm font-light text-zinc-400">
            Savollaringiz bo&apos;lsa — doim yordam berishga tayyormiz
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {contacts.map((c) => (
            <div
              key={c.title}
              className="group rounded-3xl border border-zinc-200 bg-white p-8 text-center transition duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/10"
            >
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl transition group-hover:bg-emerald-100">
                {c.icon}
              </span>
              <h3 className="mt-5 font-serif text-lg font-semibold text-zinc-900">
                {c.title}
              </h3>
              <p className="mt-3 text-sm font-light leading-relaxed text-zinc-500">
                {c.lines[0]}
                {c.lines[1] && (
                  <>
                    <br />
                    {c.lines[1]}
                  </>
                )}
              </p>
            </div>
          ))}
        </div>

        {/* Telegram tugmalari */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a
            href={s.site_telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-emerald-600 px-10 py-4 text-[12px] font-bold uppercase tracking-[0.15em] text-white transition hover:bg-emerald-700"
          >
            📨 Telegram kanal
          </a>
          <a
            href={s.site_telegram_bot}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-emerald-600 px-10 py-4 text-[12px] font-bold uppercase tracking-[0.15em] text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
          >
            🤖 Telegram bot orqali buyurtma
          </a>
          <a
            href={`tel:${s.site_phone.replace(/\s/g, "")}`}
            className="rounded-full border border-zinc-900 px-10 py-4 text-[12px] font-bold uppercase tracking-[0.15em] text-zinc-900 transition hover:bg-zinc-950 hover:text-white"
          >
            📞 Qo&apos;ng&apos;iroq qilish
          </a>
        </div>

        <div className="mt-10 overflow-hidden rounded-[2rem] border border-zinc-200 shadow-xl shadow-zinc-200/50">
          <iframe
            title="Ayub Parfum xaritada"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.02}%2C${lat - 0.01}%2C${lng + 0.02}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`}
            className="h-96 w-full"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
