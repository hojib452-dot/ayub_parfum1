"use client";

import { useRef, useState } from "react";

// Faylni kichraytirib base64 data URL ga aylantirish (max 900px, JPEG 0.82)
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxSide = 900;
        let { width, height } = img;
        if (width > maxSide || height > maxSide) {
          const scale = maxSide / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas xatosi"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = () => reject(new Error("Rasm o'qilmadi"));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error("Fayl o'qilmadi"));
    reader.readAsDataURL(file);
  });
}

export function ImageField({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Faqat rasm fayllari (JPG, PNG...)");
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      onChange(dataUrl);
    } catch {
      setError("Rasmni yuklab bo'lmadi");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const isDataUrl = value.startsWith("data:");

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label} {required && "*"}
      </label>

      <div className="flex gap-3">
        {/* Oldindan ko'rish */}
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-zinc-300 bg-zinc-50">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt="Rasm"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-2xl text-zinc-300">
              🖼
            </span>
          )}
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow transition hover:bg-red-600"
              aria-label="Rasmni o'chirish"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex-1 space-y-2">
          {/* URL kiritish (data URL bo'lsa yashiramiz) */}
          <input
            value={isDataUrl ? "" : value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={
              isDataUrl ? "✓ Kompyuterdan yuklangan rasm" : "https://... rasm havolasi"
            }
            disabled={isDataUrl}
            className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 disabled:bg-emerald-50 disabled:text-emerald-700"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full rounded-xl border border-dashed border-zinc-400 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-zinc-600 transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50"
          >
            {uploading ? "⏳ Yuklanmoqda..." : "📤 Kompyuterdan rasm yuklash"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}
