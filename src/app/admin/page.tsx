"use client";

import { useCallback, useEffect, useState } from "react";
import { formatPrice, ORIGIN_SHORT } from "@/lib/format";
import type { Product } from "@/db/schema";
import { ImageField } from "@/components/image-field";

type OrderItemRow = {
  id: number;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
};

type OrderRow = {
  id: number;
  customerName: string;
  phone: string;
  deliveryType: string;
  address: string;
  locationLat: string | null;
  locationLng: string | null;
  paymentMethod: string;
  installmentMonths: number | null;
  comment: string | null;
  total: number;
  discountPercent: number;
  status: string;
  createdAt: string;
  items: OrderItemRow[];
};

type ClubMemberRow = {
  id: number;
  name: string;
  phone: string;
  discountPercent: number;
  orderCount: number;
  joinedAt: string;
};

type InstallmentRow = {
  id: number;
  customerName: string;
  phone: string;
  passport: string | null;
  productName: string;
  totalPrice: number;
  downPayment: number;
  months: number;
  monthlyPayment: number;
  paidAmount: number;
  status: string;
  comment: string | null;
  createdAt: string;
};

type CustomerRow = {
  phone: string;
  displayPhone: string;
  name: string;
  orderCount: number;
  cancelledCount: number;
  totalSpent: number;
  firstOrderAt: string;
  clubMember: null | { id: number; discountPercent: number };
  eligibleForClub: boolean;
};

const STATUSES = ["yangi", "qabul qilindi", "yetkazildi", "bekor qilindi"];

const statusColors: Record<string, string> = {
  yangi: "bg-blue-100 text-blue-700",
  "qabul qilindi": "bg-amber-100 text-amber-700",
  yetkazildi: "bg-emerald-100 text-emerald-700",
  "bekor qilindi": "bg-red-100 text-red-700",
};

const EMPTY_FORM = {
  name: "",
  brand: "",
  description: "",
  productType: "atir",
  category: "erkaklar",
  origin: "fransiya",
  price: "",
  oldPrice: "",
  volume: "",
  imageUrl: "",
  imageUrl2: "",
  featured: false,
  inStock: true,
  razlivEnabled: true,
  razlivPriceMl: "",
  costPrice: "",
  stockQty: "1",
};

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [keyInput, setKeyInput] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [tab, setTab] = useState<
    | "orders"
    | "products"
    | "club"
    | "customers"
    | "settings"
    | "ombor"
    | "nasiya"
    | "stats"
    | "content"
  >("orders");
  const [visitRows, setVisitRows] = useState<{ day: string; count: number }[]>(
    []
  );
  const [omborSearch, setOmborSearch] = useState("");

  async function updateStockQty(id: number, qty: number) {
    const safe = Math.max(0, qty);
    setProductList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stockQty: safe } : p))
    );
    await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
      body: JSON.stringify({ stockQty: safe }),
    });
  }

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [productList, setProductList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Mijozlar bazasi
  const [customers, setCustomers] = useState<CustomerRow[]>([]);

  // Nasiya (muddatli to'lov)
  const [instList, setInstList] = useState<InstallmentRow[]>([]);
  const [instForm, setInstForm] = useState({
    customerName: "",
    phone: "",
    passport: "",
    productName: "",
    totalPrice: "",
    downPayment: "",
    months: "3",
    comment: "",
  });
  const [instFormOpen, setInstFormOpen] = useState(false);
  const [instMsg, setInstMsg] = useState<string | null>(null);
  const [payInput, setPayInput] = useState<Record<number, string>>({});

  // Club a'zolari
  const [members, setMembers] = useState<ClubMemberRow[]>([]);
  const [memberForm, setMemberForm] = useState({
    name: "",
    phone: "",
    discountPercent: 30,
  });
  const [memberMsg, setMemberMsg] = useState<string | null>(null);

  // Sayt sozlamalari
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});
  const [settingsMsg, setSettingsMsg] = useState<string | null>(null);
  const [settingsSaving, setSettingsSaving] = useState(false);

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMsg, setFormMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Mahsulotlar bo'limi: ichki tab (atir/kosmetika) va qidiruv
  const [productTab, setProductTab] = useState<"atir" | "kosmetika">("atir");
  const [productSearch, setProductSearch] = useState("");

  const filteredProducts = productList.filter((p) => {
    if ((p.productType ?? "atir") !== productTab) return false;
    const q = productSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      (p.description ?? "").toLowerCase().includes(q)
    );
  });
  const atirCount = productList.filter(
    (p) => (p.productType ?? "atir") === "atir"
  ).length;
  const kosmetikaCount = productList.filter(
    (p) => p.productType === "kosmetika"
  ).length;

  // PIN o'zgartirish
  const [pinFormOpen, setPinFormOpen] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinMsg, setPinMsg] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);
  const [pinSaving, setPinSaving] = useState(false);

  async function changePin(e: React.FormEvent) {
    e.preventDefault();
    setPinMsg(null);
    if (!/^\d{4}$/.test(newPin)) {
      setPinMsg({ type: "err", text: "PIN aniq 4 ta raqam bo'lishi kerak" });
      return;
    }
    if (newPin !== confirmPin) {
      setPinMsg({ type: "err", text: "PIN-kodlar bir xil emas" });
      return;
    }
    setPinSaving(true);
    try {
      const res = await fetch("/api/admin/pin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({ newPin }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPinMsg({ type: "err", text: data.error ?? "Xatolik" });
        return;
      }
      // Yangi PIN bilan sessiyani yangilaymiz
      setAdminKey(newPin);
      localStorage.setItem("ayub-admin-key", newPin);
      setPinMsg({
        type: "ok",
        text: `✓ PIN-kod muvaffaqiyatli o'zgartirildi! Yangi kod: ${newPin}`,
      });
      setNewPin("");
      setConfirmPin("");
      setTimeout(() => setPinFormOpen(false), 2500);
    } finally {
      setPinSaving(false);
    }
  }

  const loadOrders = useCallback(async (key: string) => {
    const res = await fetch("/api/orders", {
      headers: { "x-admin-key": key },
    });
    if (res.ok) setOrders(await res.json());
    return res.ok;
  }, []);

  const loadProducts = useCallback(async () => {
    const res = await fetch("/api/products");
    if (res.ok) setProductList(await res.json());
  }, []);

  const loadMembers = useCallback(async (key: string) => {
    const res = await fetch("/api/club/members", {
      headers: { "x-admin-key": key },
    });
    if (res.ok) setMembers(await res.json());
  }, []);

  const loadCustomers = useCallback(async (key: string) => {
    const res = await fetch("/api/customers", {
      headers: { "x-admin-key": key },
    });
    if (res.ok) setCustomers(await res.json());
  }, []);

  const loadSettings = useCallback(async (key?: string) => {
    const res = await fetch("/api/settings", {
      headers: key ? { "x-admin-key": key } : {},
    });
    if (res.ok) setSiteSettings(await res.json());
  }, []);

  const loadInstallments = useCallback(async (key: string) => {
    const res = await fetch("/api/installments", {
      headers: { "x-admin-key": key },
    });
    if (res.ok) setInstList(await res.json());
  }, []);

  const loadVisits = useCallback(async (key: string) => {
    const res = await fetch("/api/visits", {
      headers: { "x-admin-key": key },
    });
    if (res.ok) setVisitRows(await res.json());
  }, []);

  async function createInstallment(e: React.FormEvent) {
    e.preventDefault();
    setInstMsg(null);
    const res = await fetch("/api/installments", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
      body: JSON.stringify(instForm),
    });
    const data = await res.json();
    if (!res.ok) {
      setInstMsg(data.error ?? "Xatolik");
      return;
    }
    setInstMsg("✓ Shartnoma yaratildi");
    setInstForm({
      customerName: "",
      phone: "",
      passport: "",
      productName: "",
      totalPrice: "",
      downPayment: "",
      months: "3",
      comment: "",
    });
    setInstFormOpen(false);
    loadInstallments(adminKey);
  }

  async function addInstPayment(id: number) {
    const amount = Number(payInput[id]);
    if (!amount || amount <= 0) return;
    await fetch(`/api/installments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
      body: JSON.stringify({ addPayment: amount }),
    });
    setPayInput({ ...payInput, [id]: "" });
    loadInstallments(adminKey);
  }

  async function setInstStatus(id: number, status: string) {
    await fetch(`/api/installments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
      body: JSON.stringify({ status }),
    });
    loadInstallments(adminKey);
  }

  async function deleteInst(id: number) {
    if (!confirm("Shartnomani o'chirishni tasdiqlaysizmi?")) return;
    await fetch(`/api/installments/${id}`, {
      method: "DELETE",
      headers: { "x-admin-key": adminKey },
    });
    loadInstallments(adminKey);
  }

  async function toggleInstallmentEnabled() {
    const newVal = siteSettings.installment_enabled === "1" ? "0" : "1";
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
      body: JSON.stringify({ installment_enabled: newVal }),
    });
    if (res.ok) setSiteSettings(await res.json());
  }

  async function addCustomerToClub(c: CustomerRow) {
    const discount = c.orderCount >= 10 ? 50 : 30;
    const res = await fetch("/api/club/members", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
      body: JSON.stringify({
        name: c.name,
        phone: c.phone,
        discountPercent: discount,
      }),
    });
    if (res.ok) {
      loadCustomers(adminKey);
      loadMembers(adminKey);
    }
  }

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    setMemberMsg(null);
    const res = await fetch("/api/club/members", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
      body: JSON.stringify(memberForm),
    });
    const data = await res.json();
    if (!res.ok) {
      setMemberMsg(data.error ?? "Xatolik");
      return;
    }
    setMemberMsg("✓ A'zo qo'shildi");
    setMemberForm({ name: "", phone: "", discountPercent: 30 });
    loadMembers(adminKey);
  }

  async function updateMemberDiscount(id: number, discountPercent: number) {
    await fetch(`/api/club/members/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
      body: JSON.stringify({ discountPercent }),
    });
    loadMembers(adminKey);
  }

  async function removeMember(id: number, name: string) {
    if (!confirm(`${name} ni klubdan chiqarishni tasdiqlaysizmi?`)) return;
    await fetch(`/api/club/members/${id}`, {
      method: "DELETE",
      headers: { "x-admin-key": adminKey },
    });
    loadMembers(adminKey);
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSettingsSaving(true);
    setSettingsMsg(null);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify(siteSettings),
      });
      if (res.ok) {
        setSiteSettings(await res.json());
        setSettingsMsg("✓ Sozlamalar saqlandi — saytda darhol ko'rinadi");
      } else {
        const data = await res.json();
        setSettingsMsg(data.error ?? "Xatolik");
      }
    } finally {
      setSettingsSaving(false);
    }
  }

  // Saqlangan parol bilan avtomatik kirish
  useEffect(() => {
    const saved = localStorage.getItem("ayub-admin-key");
    if (saved) {
      loadOrders(saved).then((ok) => {
        if (ok) {
          setAdminKey(saved);
          loadProducts();
          loadMembers(saved);
          loadCustomers(saved);
          loadSettings(saved);
          loadInstallments(saved);
          loadVisits(saved);
        } else {
          localStorage.removeItem("ayub-admin-key");
        }
      });
    }
  }, [loadOrders, loadProducts, loadMembers, loadCustomers, loadSettings, loadInstallments, loadVisits]);

  const handleLogin = useCallback(
    async (pin?: string) => {
      const code = pin ?? keyInput;
      setLoginError(null);
      setLoading(true);
      // Himoyalangan endpoint orqali tekshirish (brute-force limiti bilan)
      let ok = false;
      try {
        const res = await fetch("/api/admin/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pin: code }),
        });
        const data = await res.json();
        if (res.ok) {
          ok = await loadOrders(code);
        } else {
          setLoading(false);
          setLoginError(data.error ?? "PIN-kod noto'g'ri");
          setKeyInput("");
          return;
        }
      } catch {
        setLoading(false);
        setLoginError("Tarmoq xatosi");
        return;
      }
      setLoading(false);
      if (ok) {
        setAdminKey(code);
        localStorage.setItem("ayub-admin-key", code);
        loadProducts();
        loadMembers(code);
        loadCustomers(code);
        loadSettings(code);
        loadInstallments(code);
        loadVisits(code);
      } else {
        setLoginError("PIN-kod noto'g'ri");
        setKeyInput("");
      }
    },
    [keyInput, loadOrders, loadProducts, loadMembers, loadCustomers, loadSettings, loadInstallments, loadVisits]
  );

  function logout() {
    localStorage.removeItem("ayub-admin-key");
    setAdminKey("");
    setKeyInput("");
  }

  async function updateStatus(id: number, status: string) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
      body: JSON.stringify({ status }),
    });
  }

  function startEdit(p: Product) {
    setProductTab(p.productType === "kosmetika" ? "kosmetika" : "atir");
    setEditingId(p.id);
    setForm({
      name: p.name,
      brand: p.brand,
      description: p.description,
      productType: p.productType,
      category: p.category,
      origin: p.origin,
      price: String(p.price),
      oldPrice: p.oldPrice ? String(p.oldPrice) : "",
      volume: String(p.volume),
      imageUrl: p.imageUrl,
      imageUrl2: p.imageUrl2 ?? "",
      featured: p.featured,
      inStock: p.inStock,
      razlivEnabled: p.razlivEnabled !== false,
      razlivPriceMl: p.razlivPriceMl ? String(p.razlivPriceMl) : "",
      costPrice: p.costPrice ? String(p.costPrice) : "",
      stockQty: String(p.stockQty ?? 1),
    });
    setFormOpen(true);
    setFormMsg(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }



  async function saveProduct(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormMsg(null);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
        volume: Number(form.volume),
        razlivPriceMl: form.razlivPriceMl ? Number(form.razlivPriceMl) : null,
        costPrice: form.costPrice ? Number(form.costPrice) : null,
        stockQty: form.stockQty ? Number(form.stockQty) : 1,
      };
      const res = await fetch(
        editingId ? `/api/products/${editingId}` : "/api/products",
        {
          method: editingId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-key": adminKey,
          },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setFormMsg(data.error ?? "Xatolik");
        return;
      }
      setFormMsg(editingId ? "✓ Saqlandi" : "✓ Qo'shildi");
      setFormOpen(false);
      loadProducts();
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(id: number) {
    if (!confirm("Bu mahsulotni o'chirishni tasdiqlaysizmi?")) return;
    const res = await fetch(`/api/products/${id}`, {
      method: "DELETE",
      headers: { "x-admin-key": adminKey },
    });
    const data = await res.json();
    if (data.status === "hidden") {
      alert(data.message);
    }
    loadProducts();
  }

  async function toggleField(
    p: Product,
    field:
      | "featured"
      | "inStock"
      | "stockFransiya"
      | "stockDubay"
      | "stockTurkiya"
      | "razlivEnabled"
  ) {
    await fetch(`/api/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
      body: JSON.stringify({ [field]: !p[field] }),
    });
    loadProducts();
  }

  // ===== PIN-KOD KIRISH EKRANI =====
  if (!adminKey) {
    const pinDigits = keyInput.padEnd(4, " ").slice(0, 4).split("");

    function pressDigit(d: string) {
      if (keyInput.length < 4) {
        const next = keyInput + d;
        setKeyInput(next);
        setLoginError(null);
        // 4-raqam kiritilganda avtomatik tekshirish
        if (next.length === 4) {
          handleLogin(next);
        }
      }
    }

    function backspace() {
      setKeyInput(keyInput.slice(0, -1));
      setLoginError(null);
    }

    return (
      <div className="mx-auto max-w-sm px-4 py-20 sm:px-6">
        <div className="rounded-[2rem] border border-zinc-200 bg-white p-8 text-center shadow-xl shadow-zinc-200/50">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-950 text-3xl">
            🛡️
          </span>
          <h1 className="mt-5 font-serif text-3xl font-medium text-zinc-900">
            Admin Panel
          </h1>
          <p className="mt-2 text-sm font-light text-zinc-500">
            4 xonali PIN-kodni kiriting
          </p>

          {/* PIN ko'rsatkich kataklari */}
          <div className="mt-7 flex justify-center gap-3">
            {pinDigits.map((d, i) => (
              <div
                key={i}
                className={`flex h-14 w-12 items-center justify-center rounded-2xl border-2 text-2xl font-bold transition ${
                  loginError
                    ? "border-red-400 bg-red-50 text-red-600"
                    : d !== " "
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-zinc-200 bg-zinc-50 text-zinc-300"
                }`}
              >
                {d !== " " ? "●" : ""}
              </div>
            ))}
          </div>

          {loginError && (
            <p className="mt-3 text-sm font-semibold text-red-600">
              {loginError}
            </p>
          )}

          {/* Raqamlar klaviaturasi */}
          <div className="mx-auto mt-7 grid max-w-[260px] grid-cols-3 gap-3">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => pressDigit(d)}
                className="h-16 rounded-2xl border border-zinc-200 bg-white text-xl font-bold text-zinc-900 transition hover:border-emerald-500 hover:bg-emerald-50 active:scale-95"
              >
                {d}
              </button>
            ))}
            <button
              type="button"
              onClick={backspace}
              className="h-16 rounded-2xl border border-zinc-200 bg-white text-xl text-zinc-500 transition hover:border-red-400 hover:bg-red-50 active:scale-95"
              aria-label="O'chirish"
            >
              ⌫
            </button>
            <button
              type="button"
              onClick={() => pressDigit("0")}
              className="h-16 rounded-2xl border border-zinc-200 bg-white text-xl font-bold text-zinc-900 transition hover:border-emerald-500 hover:bg-emerald-50 active:scale-95"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => handleLogin()}
              disabled={loading || keyInput.length < 4}
              className="h-16 rounded-2xl bg-emerald-600 text-xl font-bold text-white transition hover:bg-emerald-700 active:scale-95 disabled:opacity-40"
              aria-label="Kirish"
            >
              {loading ? "..." : "✓"}
            </button>
          </div>

          <p className="mt-6 text-[11px] font-light text-zinc-400">
            PIN-kod faqat do&apos;kon egasiga ma&apos;lum
          </p>
        </div>
      </div>
    );
  }

  const totalRevenue = orders
    .filter((o) => o.status !== "bekor qilindi")
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-medium text-zinc-900">
            Admin Panel
          </h1>
          <p className="mt-1 text-sm font-light text-zinc-500">
            Buyurtmalar va mahsulotlarni boshqarish
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              setPinFormOpen(!pinFormOpen);
              setPinMsg(null);
              setNewPin("");
              setConfirmPin("");
            }}
            className={`rounded-full px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] transition ${
              pinFormOpen
                ? "bg-amber-500 text-white"
                : "border border-amber-400 text-amber-600 hover:bg-amber-500 hover:text-white"
            }`}
          >
            🔑 PIN o&apos;zgartirish
          </button>
          <button
            onClick={logout}
            className="rounded-full border border-zinc-300 px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-600 transition hover:border-red-400 hover:text-red-600"
          >
            Chiqish
          </button>
        </div>
      </div>

      {/* ===== PIN O'ZGARTIRISH FORMASI ===== */}
      {pinFormOpen && (
        <form
          onSubmit={changePin}
          className="mt-6 rounded-3xl border-2 border-amber-400/50 bg-amber-50/50 p-6 sm:max-w-lg"
        >
          <h3 className="flex items-center gap-2 font-serif text-lg font-semibold text-zinc-900">
            🔑 PIN-kodni o&apos;zgartirish
          </h3>
          <p className="mt-1 text-xs font-light text-zinc-500">
            Yangi 4 xonali PIN-kodni kiriting. O&apos;zgartirilgandan so&apos;ng
            eski kod ishlamaydi.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Yangi PIN (4 raqam)
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={newPin}
                onChange={(e) =>
                  setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                placeholder="● ● ● ●"
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-center text-lg font-bold tracking-[0.5em] text-zinc-900 outline-none transition focus:border-amber-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Yangi PIN-ni takrorlang
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={confirmPin}
                onChange={(e) =>
                  setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                placeholder="● ● ● ●"
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-center text-lg font-bold tracking-[0.5em] text-zinc-900 outline-none transition focus:border-amber-500"
              />
            </div>
          </div>

          {pinMsg && (
            <p
              className={`mt-4 rounded-xl px-4 py-3 text-sm font-semibold ${
                pinMsg.type === "ok"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {pinMsg.text}
            </p>
          )}

          <div className="mt-5 flex gap-3">
            <button
              type="submit"
              disabled={pinSaving || newPin.length < 4 || confirmPin.length < 4}
              className="rounded-full bg-amber-500 px-9 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-white transition hover:bg-amber-600 disabled:opacity-50"
            >
              {pinSaving ? "Saqlanmoqda..." : "PIN-ni saqlash"}
            </button>
            <button
              type="button"
              onClick={() => setPinFormOpen(false)}
              className="rounded-full border border-zinc-300 px-9 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-600 transition hover:border-zinc-500"
            >
              Bekor qilish
            </button>
          </div>
        </form>
      )}

      {/* Tabs */}
      <div className="mt-8 flex gap-3">
        <button
          onClick={() => setTab("orders")}
          className={`rounded-full px-7 py-3 text-[12px] font-bold uppercase tracking-[0.15em] transition ${
            tab === "orders"
              ? "bg-zinc-950 text-white"
              : "border border-zinc-300 text-zinc-600 hover:border-emerald-500"
          }`}
        >
          📦 Buyurtmalar ({orders.length})
        </button>
        <button
          onClick={() => setTab("products")}
          className={`rounded-full px-7 py-3 text-[12px] font-bold uppercase tracking-[0.15em] transition ${
            tab === "products"
              ? "bg-zinc-950 text-white"
              : "border border-zinc-300 text-zinc-600 hover:border-emerald-500"
          }`}
        >
          🧴 Mahsulotlar ({productList.length})
        </button>
        <button
          onClick={() => setTab("stats")}
          className={`rounded-full px-7 py-3 text-[12px] font-bold uppercase tracking-[0.15em] transition ${
            tab === "stats"
              ? "bg-zinc-950 text-white"
              : "border border-zinc-300 text-zinc-600 hover:border-emerald-500"
          }`}
        >
          📊 Statistika
        </button>
        <button
          onClick={() => setTab("nasiya")}
          className={`rounded-full px-7 py-3 text-[12px] font-bold uppercase tracking-[0.15em] transition ${
            tab === "nasiya"
              ? "bg-zinc-950 text-white"
              : "border border-zinc-300 text-zinc-600 hover:border-emerald-500"
          }`}
        >
          📅 Nasiya ({instList.filter((i) => i.status === "faol").length})
        </button>
        <button
          onClick={() => setTab("ombor")}
          className={`rounded-full px-7 py-3 text-[12px] font-bold uppercase tracking-[0.15em] transition ${
            tab === "ombor"
              ? "bg-zinc-950 text-white"
              : "border border-zinc-300 text-zinc-600 hover:border-emerald-500"
          }`}
        >
          📦 Ombor
        </button>
        <button
          onClick={() => setTab("customers")}
          className={`rounded-full px-7 py-3 text-[12px] font-bold uppercase tracking-[0.15em] transition ${
            tab === "customers"
              ? "bg-zinc-950 text-white"
              : "border border-zinc-300 text-zinc-600 hover:border-emerald-500"
          }`}
        >
          👥 Mijozlar ({customers.length})
        </button>
        <button
          onClick={() => setTab("club")}
          className={`rounded-full px-7 py-3 text-[12px] font-bold uppercase tracking-[0.15em] transition ${
            tab === "club"
              ? "bg-zinc-950 text-white"
              : "border border-zinc-300 text-zinc-600 hover:border-emerald-500"
          }`}
        >
          👑 Club ({members.length})
        </button>
        <button
          onClick={() => setTab("content")}
          className={`rounded-full px-7 py-3 text-[12px] font-bold uppercase tracking-[0.15em] transition ${
            tab === "content"
              ? "bg-zinc-950 text-white"
              : "border border-zinc-300 text-zinc-600 hover:border-emerald-500"
          }`}
        >
          🎨 Kontent
        </button>
        <button
          onClick={() => setTab("settings")}
          className={`rounded-full px-7 py-3 text-[12px] font-bold uppercase tracking-[0.15em] transition ${
            tab === "settings"
              ? "bg-zinc-950 text-white"
              : "border border-zinc-300 text-zinc-600 hover:border-emerald-500"
          }`}
        >
          ⚙️ Sozlamalar
        </button>
      </div>

      {/* ===== BUYURTMALAR ===== */}
      {tab === "orders" && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <p className="text-xs uppercase tracking-widest text-zinc-500">
                Jami buyurtmalar
              </p>
              <p className="mt-2 text-3xl font-bold text-zinc-900">
                {orders.length}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <p className="text-xs uppercase tracking-widest text-zinc-500">
                Yangi buyurtmalar
              </p>
              <p className="mt-2 text-3xl font-bold text-blue-600">
                {orders.filter((o) => o.status === "yangi").length}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <p className="text-xs uppercase tracking-widest text-zinc-500">
                Umumiy tushum
              </p>
              <p className="mt-2 text-3xl font-bold text-emerald-600">
                {formatPrice(totalRevenue)}
              </p>
            </div>
          </div>

          {orders.length === 0 ? (
            <p className="mt-16 text-center text-zinc-500">
              Hozircha buyurtmalar yo&apos;q.
            </p>
          ) : (
            <div className="mt-8 space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-serif text-lg font-bold text-zinc-900">
                        #{order.id}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          statusColors[order.status] ??
                          "bg-zinc-100 text-zinc-700"
                        }`}
                      >
                        {order.status}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          order.deliveryType === "olib_ketish"
                            ? "bg-violet-100 text-violet-700"
                            : "bg-teal-100 text-teal-700"
                        }`}
                      >
                        {order.deliveryType === "olib_ketish"
                          ? "🏬 Olib ketadi"
                          : "🚚 Yetkazib berish"}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          order.paymentMethod === "muddatli"
                            ? "bg-violet-100 text-violet-700"
                            : "bg-zinc-100 text-zinc-700"
                        }`}
                      >
                        {order.paymentMethod === "muddatli"
                          ? `📅 Muddatli — ${order.installmentMonths ?? 3} oy`
                          : order.paymentMethod === "karta"
                          ? "💳 Joyida karta"
                          : "💵 Joyida naqd"}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {new Date(order.createdAt).toLocaleString("uz-UZ")}
                      </span>
                    </div>
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-4 grid gap-4 text-sm md:grid-cols-2">
                    <div className="space-y-1 text-zinc-700">
                      <p>
                        <span className="text-zinc-500">Mijoz:</span>{" "}
                        {order.customerName}
                      </p>
                      <p>
                        <span className="text-zinc-500">Telefon:</span>{" "}
                        <a
                          href={`tel:${order.phone}`}
                          className="font-semibold text-emerald-700"
                        >
                          {order.phone}
                        </a>
                      </p>
                      {order.deliveryType === "yetkazib_berish" && (
                        <p>
                          <span className="text-zinc-500">Manzil:</span>{" "}
                          {order.address || "—"}
                        </p>
                      )}
                      {order.locationLat && order.locationLng && (
                        <p>
                          <span className="text-zinc-500">Lokatsiya:</span>{" "}
                          <a
                            href={`https://www.google.com/maps?q=${order.locationLat},${order.locationLng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-emerald-700 underline"
                          >
                            📍 Xaritada ochish
                          </a>
                        </p>
                      )}
                      {order.comment && (
                        <p>
                          <span className="text-zinc-500">Izoh:</span>{" "}
                          {order.comment}
                        </p>
                      )}
                    </div>
                    <div>
                      <ul className="space-y-1 text-zinc-700">
                        {order.items.map((item) => (
                          <li key={item.id} className="flex justify-between">
                            <span>
                              {item.productName}{" "}
                              <span className="text-zinc-500">
                                × {item.quantity}
                              </span>
                            </span>
                            <span>
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </li>
                        ))}
                      </ul>
                      {order.discountPercent > 0 && (
                        <p className="mt-2 flex justify-between border-t border-zinc-200 pt-2 text-sm font-semibold text-sky-600">
                          <span>👑 Club chegirmasi</span>
                          <span>−{order.discountPercent}%</span>
                        </p>
                      )}
                      <p
                        className={`flex justify-between font-bold text-emerald-700 ${
                          order.discountPercent > 0
                            ? "mt-1"
                            : "mt-2 border-t border-zinc-200 pt-2"
                        }`}
                      >
                        <span>Jami</span>
                        <span>{formatPrice(order.total)}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ===== MAHSULOTLAR ===== */}
      {tab === "products" && (
        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-xl font-semibold text-zinc-900">
              Mahsulotlar katalogi
            </h2>
            <button
              onClick={() => {
                setForm({
                  ...EMPTY_FORM,
                  productType: productTab,
                  category: productTab === "kosmetika" ? "makiyaj" : "erkaklar",
                });
                setEditingId(null);
                setFormOpen(true);
                setFormMsg(null);
              }}
              className="rounded-full bg-emerald-600 px-7 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-white transition hover:bg-emerald-700"
            >
              + Yangi {productTab === "kosmetika" ? "kosmetika" : "atir"}
            </button>
          </div>

          {/* ===== Ichki bo'limlar: Atirlar / Kosmetika ===== */}
          <div className="mt-5 flex gap-2 rounded-2xl bg-zinc-100 p-1.5 sm:max-w-md">
            <button
              onClick={() => setProductTab("atir")}
              className={`flex-1 rounded-xl py-3 text-[12px] font-bold uppercase tracking-[0.1em] transition ${
                productTab === "atir"
                  ? "bg-white text-emerald-700 shadow"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              🧴 Atirlar ({atirCount})
            </button>
            <button
              onClick={() => setProductTab("kosmetika")}
              className={`flex-1 rounded-xl py-3 text-[12px] font-bold uppercase tracking-[0.1em] transition ${
                productTab === "kosmetika"
                  ? "bg-white text-pink-600 shadow"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              💄 Kosmetika ({kosmetikaCount})
            </button>
          </div>

          {/* ===== Qidiruv ===== */}
          <div className="mt-4 flex items-center gap-3 rounded-full border border-zinc-300 bg-white px-5 transition focus-within:border-emerald-500 sm:max-w-md">
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
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder={`${
                productTab === "kosmetika" ? "Kosmetika" : "Atir"
              } qidirish — nomi yoki brendi...`}
              className="w-full bg-transparent py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none"
            />
            {productSearch && (
              <button
                onClick={() => setProductSearch("")}
                className="shrink-0 text-zinc-400 transition hover:text-red-500"
                aria-label="Tozalash"
              >
                ✕
              </button>
            )}
          </div>
          {productSearch && (
            <p className="mt-2 text-xs text-zinc-500">
              &ldquo;{productSearch}&rdquo; bo&apos;yicha{" "}
              <b className="text-emerald-700">{filteredProducts.length}</b> ta
              natija
            </p>
          )}

          {/* Qo'shish/tahrirlash formasi */}
          {formOpen && (
            <form
              onSubmit={saveProduct}
              className="mt-6 rounded-3xl border-2 border-emerald-500/40 bg-emerald-50/40 p-6"
            >
              <h3 className="font-serif text-lg font-semibold text-zinc-900">
                {editingId ? `Tahrirlash: #${editingId}` : "Yangi mahsulot"}
              </h3>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-500">
                    Nomi *
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-500">
                    Brend *
                  </label>
                  <input
                    required
                    value={form.brand}
                    onChange={(e) =>
                      setForm({ ...form, brand: e.target.value })
                    }
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-500">
                    Mahsulot turi
                  </label>
                  <select
                    value={form.productType}
                    onChange={(e) => {
                      const t = e.target.value;
                      setForm({
                        ...form,
                        productType: t,
                        category: t === "kosmetika" ? "makiyaj" : "erkaklar",
                      });
                    }}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                  >
                    <option value="atir">🧴 Atir</option>
                    <option value="kosmetika">💄 Kosmetika</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-500">
                    Katalog
                  </label>
                  <select
                    value={form.origin}
                    onChange={(e) =>
                      setForm({ ...form, origin: e.target.value })
                    }
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                  >
                    <option value="fransiya">🇫🇷 Fransiya</option>
                    <option value="arab">🇦🇪 Arab (Lattafa...)</option>
                    <option value="turkiya">🇹🇷 Turkiya</option>
                    <option value="fransiya-moyli">🫗 Fransiya moyli</option>
                    <option value="ozbekiston">🇺🇿 O&apos;zbekiston</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-500">
                    Kategoriya
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                  >
                    {form.productType === "kosmetika" ? (
                      <>
                        <option value="makiyaj">💄 Makiyaj</option>
                        <option value="yuz-parvarishi">🧴 Yuz parvarishi</option>
                        <option value="tana">🧼 Tana parvarishi</option>
                        <option value="soch">💇 Soch parvarishi</option>
                      </>
                    ) : (
                      <>
                        <option value="erkaklar">Erkaklar</option>
                        <option value="ayollar">Ayollar</option>
                        <option value="uniseks">Uniseks</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-500">
                    Narxi (so&apos;m) *
                  </label>
                  <input
                    required
                    type="number"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-500">
                    Eski narx (chegirma uchun)
                  </label>
                  <input
                    type="number"
                    value={form.oldPrice}
                    onChange={(e) =>
                      setForm({ ...form, oldPrice: e.target.value })
                    }
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-500">
                    📦 Tannarx (so&apos;m)
                  </label>
                  <input
                    type="number"
                    value={form.costPrice}
                    onChange={(e) =>
                      setForm({ ...form, costPrice: e.target.value })
                    }
                    placeholder="Omborda hisob uchun"
                    className="w-full rounded-xl border border-amber-300 bg-amber-50/50 px-3 py-2.5 text-sm outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-500">
                    📦 Ombordagi soni (dona)
                  </label>
                  <input
                    type="number"
                    value={form.stockQty}
                    onChange={(e) =>
                      setForm({ ...form, stockQty: e.target.value })
                    }
                    className="w-full rounded-xl border border-amber-300 bg-amber-50/50 px-3 py-2.5 text-sm outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-500">
                    Hajmi (ml) *
                  </label>
                  <input
                    required
                    type="number"
                    value={form.volume}
                    onChange={(e) =>
                      setForm({ ...form, volume: e.target.value })
                    }
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-3 grid gap-4 sm:grid-cols-2">
                  <ImageField
                    label="🖼 Asosiy rasm (1-rasm)"
                    value={form.imageUrl}
                    onChange={(v) => setForm({ ...form, imageUrl: v })}
                  />
                  <ImageField
                    label="🖼 Qo'shimcha rasm (2-rasm, ixtiyoriy)"
                    value={form.imageUrl2}
                    onChange={(v) => setForm({ ...form, imageUrl2: v })}
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="mb-1 block text-xs font-semibold text-zinc-500">
                    Tavsif
                  </label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className="w-full resize-none rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* ===== Razliv sozlamalari (faqat atirlar) ===== */}
              {form.productType === "atir" && (
                <div className="mt-5 rounded-2xl border border-sky-200 bg-sky-50/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <label className="flex items-center gap-2.5 text-sm font-semibold text-zinc-800">
                      <input
                        type="checkbox"
                        checked={form.razlivEnabled}
                        onChange={(e) =>
                          setForm({ ...form, razlivEnabled: e.target.checked })
                        }
                        className="h-5 w-5 accent-sky-600"
                      />
                      💧 Razliv sotuvi yoqilgan
                    </label>
                    {!form.razlivEnabled && (
                      <span className="rounded-full bg-red-100 px-3 py-1 text-[10px] font-bold uppercase text-red-600">
                        Saytda razliv ko&apos;rinmaydi
                      </span>
                    )}
                  </div>
                  {form.razlivEnabled && (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-zinc-500">
                          1 ml razliv narxi (so&apos;m)
                        </label>
                        <input
                          type="number"
                          value={form.razlivPriceMl}
                          onChange={(e) =>
                            setForm({ ...form, razlivPriceMl: e.target.value })
                          }
                          placeholder="Bo'sh = avtomatik hisob"
                          className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-500"
                        />
                      </div>
                      <div className="flex items-end">
                        <p className="rounded-xl bg-white px-3 py-2.5 text-xs font-light text-zinc-500">
                          {form.razlivPriceMl && Number(form.razlivPriceMl) > 0
                            ? `Mijoz uchun: 10 ml = ${new Intl.NumberFormat("uz-UZ").format(Number(form.razlivPriceMl) * 10).replace(/,/g, " ")} so'm`
                            : form.price && form.volume
                            ? `Avtomatik: ~${new Intl.NumberFormat("uz-UZ").format(Math.ceil(((Number(form.price) / Number(form.volume)) * 1.25) / 500) * 500).replace(/,/g, " ")} so'm/ml (flakon narxi + 25%)`
                            : "Narx va hajmni kiriting — avtomatik hisoblanadi"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-6">
                <label className="flex items-center gap-2 text-sm text-zinc-700">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) =>
                      setForm({ ...form, featured: e.target.checked })
                    }
                    className="h-4 w-4 accent-emerald-600"
                  />
                  ⭐ Tanlangan (bosh sahifada)
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-700">
                  <input
                    type="checkbox"
                    checked={form.inStock}
                    onChange={(e) =>
                      setForm({ ...form, inStock: e.target.checked })
                    }
                    className="h-4 w-4 accent-emerald-600"
                  />
                  ✅ Sotuvda mavjud
                </label>
              </div>

              {formMsg && (
                <p className="mt-4 text-sm font-semibold text-emerald-700">
                  {formMsg}
                </p>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-emerald-600 px-9 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {saving ? "Saqlanmoqda..." : editingId ? "Saqlash" : "Qo'shish"}
                </button>
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="rounded-full border border-zinc-300 px-9 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-600 transition hover:border-zinc-500"
                >
                  Bekor qilish
                </button>
              </div>
            </form>
          )}

          {/* Mahsulotlar ro'yxati */}
          {filteredProducts.length === 0 && (
            <p className="mt-10 text-center text-sm text-zinc-500">
              {productSearch
                ? `"${productSearch}" bo'yicha hech narsa topilmadi`
                : "Bu bo'limda hozircha mahsulot yo'q"}
            </p>
          )}
          <div className="mt-6 space-y-3">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4"
              >
                <div className="flex shrink-0 -space-x-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="h-16 w-16 rounded-xl border-2 border-white object-cover shadow"
                  />
                  {p.imageUrl2 && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.imageUrl2}
                      alt={`${p.name} 2`}
                      className="h-16 w-16 rounded-xl border-2 border-white object-cover shadow"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-zinc-900">
                      {p.brand} — {p.name}
                    </span>
                    {p.imageUrl2 && (
                      <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-semibold text-sky-700">
                        🖼 2 rasm
                      </span>
                    )}
                    <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-600">
                      {p.productType === "kosmetika"
                        ? "💄 Kosmetika"
                        : ORIGIN_SHORT[p.origin] ?? p.origin}
                    </span>
                    {p.featured && (
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700">
                        ⭐ Tanlangan
                      </span>
                    )}
                    {!p.inStock && (
                      <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-semibold text-red-700">
                        Tugagan
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-zinc-500">
                    {formatPrice(p.price)} · {p.volume} ml · {p.category}
                    {p.productType === "atir" && p.razlivEnabled !== false && (
                      <span className="ml-2 text-sky-600">
                        · 💧{" "}
                        {p.razlivPriceMl
                          ? `${formatPrice(p.razlivPriceMl)}/ml (maxsus)`
                          : "avto narx"}
                      </span>
                    )}
                  </p>
                  {/* Atirlar uchun razliv tezkor tugmasi */}
                  {p.productType === "atir" && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <button
                        onClick={() => toggleField(p, "razlivEnabled")}
                        title="Razliv sotuvini yoqish/o'chirish"
                        className={`rounded-full px-3 py-1 text-[10px] font-bold transition ${
                          p.razlivEnabled !== false
                            ? "bg-sky-100 text-sky-700 hover:bg-sky-200"
                            : "bg-red-100 text-red-600 line-through hover:bg-red-200"
                        }`}
                      >
                        💧 Razliv {p.razlivEnabled !== false ? "✓" : "✕"}
                      </button>
                    </div>
                  )}
                  {/* Fransiya atirlari uchun versiya zaxiralari */}
                  {p.productType === "atir" && p.origin === "fransiya" && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <button
                        onClick={() => toggleField(p, "stockFransiya")}
                        title="Fransiya original zaxirasi"
                        className={`rounded-full px-3 py-1 text-[10px] font-bold transition ${
                          p.stockFransiya
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                            : "bg-red-100 text-red-600 line-through hover:bg-red-200"
                        }`}
                      >
                        🇫🇷 Original {p.stockFransiya ? "✓" : "✕"}
                      </button>
                      <button
                        onClick={() => toggleField(p, "stockDubay")}
                        title="Dubay analogi zaxirasi"
                        className={`rounded-full px-3 py-1 text-[10px] font-bold transition ${
                          p.stockDubay
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                            : "bg-red-100 text-red-600 line-through hover:bg-red-200"
                        }`}
                      >
                        🇦🇪 Dubay {p.stockDubay ? "✓" : "✕"}
                      </button>
                      <button
                        onClick={() => toggleField(p, "stockTurkiya")}
                        title="Turkiya analogi zaxirasi"
                        className={`rounded-full px-3 py-1 text-[10px] font-bold transition ${
                          p.stockTurkiya
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                            : "bg-red-100 text-red-600 line-through hover:bg-red-200"
                        }`}
                      >
                        🇹🇷 Turkiya {p.stockTurkiya ? "✓" : "✕"}
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => toggleField(p, "inStock")}
                    className="rounded-full border border-zinc-300 px-4 py-2 text-[10px] font-bold uppercase tracking-wide text-zinc-600 transition hover:border-emerald-500 hover:text-emerald-700"
                  >
                    {p.inStock ? "Sotuvdan olish" : "Sotuvga qaytarish"}
                  </button>
                  <button
                    onClick={() => toggleField(p, "featured")}
                    className="rounded-full border border-zinc-300 px-4 py-2 text-[10px] font-bold uppercase tracking-wide text-zinc-600 transition hover:border-amber-500 hover:text-amber-700"
                  >
                    ⭐
                  </button>
                  <button
                    onClick={() => startEdit(p)}
                    className="rounded-full bg-zinc-950 px-5 py-2 text-[10px] font-bold uppercase tracking-wide text-white transition hover:bg-emerald-700"
                  >
                    Tahrirlash
                  </button>
                  <button
                    onClick={() => deleteProduct(p.id)}
                    className="rounded-full border border-red-300 px-4 py-2 text-[10px] font-bold uppercase tracking-wide text-red-600 transition hover:bg-red-600 hover:text-white"
                  >
                    O&apos;chirish
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== SAYT KONTENTI (BANNERLAR) ===== */}
      {tab === "content" && (
        <form onSubmit={saveSettings} className="mt-8 max-w-4xl space-y-6">
          <div className="rounded-3xl border border-zinc-200 bg-white p-7">
            <h3 className="font-serif text-xl font-semibold text-zinc-900">
              🎨 Sayt kontentini tahrirlash
            </h3>
            <p className="mt-1 text-sm font-light text-zinc-500">
              Bosh sahifadagi barcha banner va matnlar. Saqlagach saytda
              darhol yangilanadi.
            </p>
          </div>

          {/* E'lon paneli */}
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50/40 p-6">
            <h4 className="font-serif text-base font-semibold text-zinc-900">
              📢 Yuqori e&apos;lon paneli (yashil chiziq)
            </h4>
            <input
              value={siteSettings.announce_text ?? ""}
              onChange={(e) =>
                setSiteSettings({ ...siteSettings, announce_text: e.target.value })
              }
              className="mt-3 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          {/* Hero banner */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6">
            <h4 className="font-serif text-base font-semibold text-zinc-900">
              🖼 Asosiy banner (Hero)
            </h4>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-500">
                  Kichik yozuv (tepada)
                </label>
                <input
                  value={siteSettings.hero_badge ?? ""}
                  onChange={(e) =>
                    setSiteSettings({ ...siteSettings, hero_badge: e.target.value })
                  }
                  className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                />
              </div>
              <div />
              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-500">
                  Sarlavha 1-qator
                </label>
                <input
                  value={siteSettings.hero_title1 ?? ""}
                  onChange={(e) =>
                    setSiteSettings({ ...siteSettings, hero_title1: e.target.value })
                  }
                  className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-500">
                  Sarlavha 2-qator (yashil tovlanuvchi)
                </label>
                <input
                  value={siteSettings.hero_title2 ?? ""}
                  onChange={(e) =>
                    setSiteSettings({ ...siteSettings, hero_title2: e.target.value })
                  }
                  className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-zinc-500">
                  Tavsif matni
                </label>
                <textarea
                  rows={2}
                  value={siteSettings.hero_desc ?? ""}
                  onChange={(e) =>
                    setSiteSettings({ ...siteSettings, hero_desc: e.target.value })
                  }
                  className="w-full resize-none rounded-xl border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                />
              </div>
              <div className="sm:col-span-2">
                <ImageField
                  label="🖼 Banner fon rasmi"
                  value={siteSettings.hero_img ?? ""}
                  onChange={(v) =>
                    setSiteSettings({ ...siteSettings, hero_img: v })
                  }
                />
              </div>
            </div>
          </div>

          {/* Marquee */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6">
            <h4 className="font-serif text-base font-semibold text-zinc-900">
              🔄 Yugurma lenta (brendlar)
            </h4>
            <p className="mt-1 text-xs font-light text-zinc-500">
              So&apos;zlarni <b>|</b> belgisi bilan ajrating
            </p>
            <textarea
              rows={2}
              value={siteSettings.marquee_text ?? ""}
              onChange={(e) =>
                setSiteSettings({ ...siteSettings, marquee_text: e.target.value })
              }
              className="mt-3 w-full resize-none rounded-xl border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          {/* Statistika raqamlari */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6">
            <h4 className="font-serif text-base font-semibold text-zinc-900">
              🔢 Statistika bloki (qora fonda 4 ta raqam)
            </h4>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {([1, 2, 3, 4] as const).map((n) => (
                <div key={n} className="rounded-2xl bg-zinc-50 p-3">
                  <input
                    value={siteSettings[`stat${n}_value`] ?? ""}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        [`stat${n}_value`]: e.target.value,
                      })
                    }
                    placeholder="Qiymat"
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-center text-sm font-bold outline-none focus:border-emerald-500"
                  />
                  <input
                    value={siteSettings[`stat${n}_label`] ?? ""}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        [`stat${n}_label`]: e.target.value,
                      })
                    }
                    placeholder="Izoh"
                    className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-center text-xs outline-none focus:border-emerald-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Afzalliklar */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6">
            <h4 className="font-serif text-base font-semibold text-zinc-900">
              ✨ Afzalliklar (&ldquo;Nega aynan Ayub Parfum?&rdquo; — 4 karta)
            </h4>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {([1, 2, 3, 4] as const).map((n) => (
                <div key={n} className="rounded-2xl bg-zinc-50 p-3">
                  <input
                    value={siteSettings[`feat${n}_title`] ?? ""}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        [`feat${n}_title`]: e.target.value,
                      })
                    }
                    placeholder="Sarlavha"
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-emerald-500"
                  />
                  <textarea
                    rows={2}
                    value={siteSettings[`feat${n}_desc`] ?? ""}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        [`feat${n}_desc`]: e.target.value,
                      })
                    }
                    placeholder="Tavsif"
                    className="mt-2 w-full resize-none rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Club banner + CTA */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-zinc-200 bg-white p-6">
              <h4 className="font-serif text-base font-semibold text-zinc-900">
                👑 Club banneri (qora fonda)
              </h4>
              <input
                value={siteSettings.club_title ?? ""}
                onChange={(e) =>
                  setSiteSettings({ ...siteSettings, club_title: e.target.value })
                }
                placeholder="Sarlavha"
                className="mt-3 w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
              />
              <textarea
                rows={3}
                value={siteSettings.club_desc ?? ""}
                onChange={(e) =>
                  setSiteSettings({ ...siteSettings, club_desc: e.target.value })
                }
                placeholder="Tavsif"
                className="mt-2 w-full resize-none rounded-xl border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
              />
            </div>
            <div className="rounded-3xl border border-zinc-200 bg-white p-6">
              <h4 className="font-serif text-base font-semibold text-zinc-900">
                🎯 Pastki chaqiriq (CTA) bo&apos;limi
              </h4>
              <input
                value={siteSettings.cta_title ?? ""}
                onChange={(e) =>
                  setSiteSettings({ ...siteSettings, cta_title: e.target.value })
                }
                placeholder="Sarlavha"
                className="mt-3 w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
              />
              <textarea
                rows={2}
                value={siteSettings.cta_desc ?? ""}
                onChange={(e) =>
                  setSiteSettings({ ...siteSettings, cta_desc: e.target.value })
                }
                placeholder="Tavsif"
                className="mt-2 w-full resize-none rounded-xl border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
              />
              <input
                value={siteSettings.cta_btn ?? ""}
                onChange={(e) =>
                  setSiteSettings({ ...siteSettings, cta_btn: e.target.value })
                }
                placeholder="Tugma matni"
                className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {settingsMsg && (
            <p
              className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                settingsMsg.startsWith("✓")
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {settingsMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={settingsSaving}
            className="rounded-full bg-emerald-600 px-12 py-4 text-[12px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {settingsSaving ? "Saqlanmoqda..." : "💾 Kontentni saqlash"}
          </button>
        </form>
      )}

      {/* ===== STATISTIKA (TASHRIFLAR) ===== */}
      {tab === "stats" && (() => {
        const today = new Date().toISOString().slice(0, 10);
        const yesterday = new Date(Date.now() - 86400000)
          .toISOString()
          .slice(0, 10);
        const todayCount = visitRows.find((v) => v.day === today)?.count ?? 0;
        const yesterdayCount =
          visitRows.find((v) => v.day === yesterday)?.count ?? 0;
        const last7 = visitRows
          .filter((v) => {
            const d = new Date(v.day).getTime();
            return d >= Date.now() - 7 * 86400000;
          })
          .reduce((s, v) => s + v.count, 0);
        const total = visitRows.reduce((s, v) => s + v.count, 0);
        const maxCount = Math.max(1, ...visitRows.map((v) => v.count));
        const last14 = visitRows.slice(0, 14);

        return (
          <div className="mt-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-emerald-300 bg-emerald-50/60 p-5">
                <p className="text-xs uppercase tracking-widest text-zinc-500">
                  📅 Bugun
                </p>
                <p className="mt-2 text-4xl font-bold text-emerald-700">
                  {todayCount}
                </p>
                <p className="mt-1 text-xs text-zinc-400">tashrif buyuruvchi</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                <p className="text-xs uppercase tracking-widest text-zinc-500">
                  Kecha
                </p>
                <p className="mt-2 text-4xl font-bold text-zinc-900">
                  {yesterdayCount}
                </p>
                {yesterdayCount > 0 && (
                  <p
                    className={`mt-1 text-xs font-semibold ${
                      todayCount >= yesterdayCount
                        ? "text-emerald-600"
                        : "text-red-500"
                    }`}
                  >
                    {todayCount >= yesterdayCount ? "↑" : "↓"}{" "}
                    {Math.abs(todayCount - yesterdayCount)} ta farq
                  </p>
                )}
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                <p className="text-xs uppercase tracking-widest text-zinc-500">
                  Oxirgi 7 kun
                </p>
                <p className="mt-2 text-4xl font-bold text-sky-700">{last7}</p>
                <p className="mt-1 text-xs text-zinc-400">
                  o&apos;rtacha {Math.round(last7 / 7)} / kun
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                <p className="text-xs uppercase tracking-widest text-zinc-500">
                  Jami (30 kun)
                </p>
                <p className="mt-2 text-4xl font-bold text-violet-700">
                  {total}
                </p>
              </div>
            </div>

            {/* Kunlik grafik */}
            <div className="mt-8 rounded-3xl border border-zinc-200 bg-white p-6">
              <h3 className="font-serif text-lg font-semibold text-zinc-900">
                Oxirgi 14 kun — kunlik tashriflar
              </h3>
              {last14.length === 0 ? (
                <p className="mt-6 text-center text-sm text-zinc-500">
                  Hozircha tashriflar yo&apos;q — mehmonlar saytga kirishi
                  bilan bu yerda ko&apos;rinadi.
                </p>
              ) : (
                <div className="mt-6 space-y-2.5">
                  {last14.map((v) => (
                    <div key={v.day} className="flex items-center gap-3">
                      <span className="w-24 shrink-0 text-xs font-semibold text-zinc-500">
                        {new Date(v.day).toLocaleDateString("uz-UZ", {
                          day: "numeric",
                          month: "short",
                        })}
                        {v.day === today && (
                          <span className="ml-1 text-emerald-600">●</span>
                        )}
                      </span>
                      <div className="h-6 flex-1 overflow-hidden rounded-full bg-zinc-100">
                        <div
                          className={`flex h-full items-center rounded-full px-2.5 text-[11px] font-bold text-white transition-all ${
                            v.day === today
                              ? "bg-emerald-500"
                              : "bg-zinc-400"
                          }`}
                          style={{
                            width: `${Math.max(8, (v.count / maxCount) * 100)}%`,
                          }}
                        >
                          {v.count}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-5 text-xs font-light text-zinc-400">
                💡 Har bir mehmon kuniga 1 marta sanaladi (bir odam sahifalarni
                ko&apos;p ochsa ham, 1 tashrif hisoblanadi).
              </p>
            </div>
          </div>
        );
      })()}

      {/* ===== NASIYA (MUDDATLI TO'LOV) ===== */}
      {tab === "nasiya" && (() => {
        const active = instList.filter((i) => i.status === "faol");
        const totalDebt = active.reduce(
          (s, i) => s + (i.totalPrice - i.downPayment - i.paidAmount),
          0
        );
        const totalCollected = instList.reduce(
          (s, i) => s + i.downPayment + i.paidAmount,
          0
        );
        const instEnabled = siteSettings.installment_enabled === "1";

        return (
          <div className="mt-8">
            {/* Yoqish/O'chirish paneli */}
            <div
              className={`flex flex-wrap items-center justify-between gap-4 rounded-3xl border-2 p-6 ${
                instEnabled
                  ? "border-violet-300 bg-violet-50/60"
                  : "border-red-300 bg-red-50/60"
              }`}
            >
              <div>
                <h3 className="flex items-center gap-2 font-serif text-lg font-semibold text-zinc-900">
                  📅 Muddatli to&apos;lov xizmati:{" "}
                  <span
                    className={instEnabled ? "text-violet-700" : "text-red-600"}
                  >
                    {instEnabled ? "YOQILGAN" : "O'CHIRILGAN"}
                  </span>
                </h3>
                <p className="mt-1 text-xs font-light text-zinc-500">
                  {instEnabled
                    ? `Saytda ${siteSettings.installment_min_price ? formatPrice(Number(siteSettings.installment_min_price)) : "1 500 000 so'm"} dan qimmat atirlarda muddatli to'lov banneri ko'rinadi.`
                    : "Saytda muddatli to'lov banneri ko'rinmaydi. Mavjud shartnomalar saqlanib qoladi."}
                </p>
              </div>
              <button
                onClick={toggleInstallmentEnabled}
                className={`rounded-full px-8 py-3.5 text-[12px] font-bold uppercase tracking-[0.15em] text-white transition ${
                  instEnabled
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-violet-600 hover:bg-violet-700"
                }`}
              >
                {instEnabled ? "⏻ O'chirish" : "⏻ Yoqish"}
              </button>
            </div>

            {/* Shartlar sozlamalari */}
            {instEnabled && (
              <div className="mt-4 grid gap-4 rounded-2xl border border-zinc-200 bg-white p-5 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-500">
                    Minimal narx (so&apos;m)
                  </label>
                  <input
                    type="number"
                    value={siteSettings.installment_min_price ?? ""}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        installment_min_price: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-500">
                    Boshlang&apos;ich to&apos;lov (%)
                  </label>
                  <input
                    type="number"
                    value={siteSettings.installment_down_percent ?? ""}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        installment_down_percent: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-violet-500"
                  />
                </div>
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <label className="mb-1 block text-xs font-semibold text-zinc-500">
                      Muddat (oy)
                    </label>
                    <input
                      type="number"
                      value={siteSettings.installment_months ?? ""}
                      onChange={(e) =>
                        setSiteSettings({
                          ...siteSettings,
                          installment_months: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-violet-500"
                    />
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      fetch("/api/settings", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          "x-admin-key": adminKey,
                        },
                        body: JSON.stringify({
                          installment_min_price:
                            siteSettings.installment_min_price,
                          installment_down_percent:
                            siteSettings.installment_down_percent,
                          installment_months: siteSettings.installment_months,
                        }),
                      }).then((r) => {
                        if (r.ok) r.json().then(setSiteSettings);
                      });
                    }}
                    className="rounded-xl bg-violet-600 px-6 py-2.5 text-[11px] font-bold uppercase text-white transition hover:bg-violet-700"
                  >
                    Saqlash
                  </button>
                </div>
              </div>
            )}

            {/* Statistika */}
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                <p className="text-xs uppercase tracking-widest text-zinc-500">
                  Faol shartnomalar
                </p>
                <p className="mt-2 text-3xl font-bold text-violet-700">
                  {active.length}
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                <p className="text-xs uppercase tracking-widest text-zinc-500">
                  Qolgan qarz (jami)
                </p>
                <p className="mt-2 text-2xl font-bold text-red-600">
                  {formatPrice(totalDebt)}
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                <p className="text-xs uppercase tracking-widest text-zinc-500">
                  Yig&apos;ilgan to&apos;lovlar
                </p>
                <p className="mt-2 text-2xl font-bold text-emerald-700">
                  {formatPrice(totalCollected)}
                </p>
              </div>
            </div>

            {/* Yangi shartnoma */}
            <div className="mt-6">
              <button
                onClick={() => setInstFormOpen(!instFormOpen)}
                className="rounded-full bg-violet-600 px-7 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-white transition hover:bg-violet-700"
              >
                {instFormOpen ? "✕ Yopish" : "+ Yangi shartnoma"}
              </button>

              {instFormOpen && (
                <form
                  onSubmit={createInstallment}
                  className="mt-4 rounded-3xl border-2 border-violet-300/60 bg-violet-50/40 p-6"
                >
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <input required value={instForm.customerName} onChange={(e) => setInstForm({ ...instForm, customerName: e.target.value })} placeholder="Mijoz ismi *" className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-500" />
                    <input required type="tel" value={instForm.phone} onChange={(e) => setInstForm({ ...instForm, phone: e.target.value })} placeholder="Telefon *" className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-500" />
                    <input value={instForm.passport} onChange={(e) => setInstForm({ ...instForm, passport: e.target.value })} placeholder="Pasport (AA1234567)" className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-500" />
                    <input required value={instForm.productName} onChange={(e) => setInstForm({ ...instForm, productName: e.target.value })} placeholder="Mahsulot nomi *" className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-500" />
                    <input required type="number" value={instForm.totalPrice} onChange={(e) => setInstForm({ ...instForm, totalPrice: e.target.value })} placeholder="Umumiy narx *" className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-500" />
                    <input required type="number" value={instForm.downPayment} onChange={(e) => setInstForm({ ...instForm, downPayment: e.target.value })} placeholder="Boshlang'ich to'lov *" className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-500" />
                    <input type="number" value={instForm.months} onChange={(e) => setInstForm({ ...instForm, months: e.target.value })} placeholder="Muddat (oy)" className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-500" />
                    <input value={instForm.comment} onChange={(e) => setInstForm({ ...instForm, comment: e.target.value })} placeholder="Izoh" className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-500" />
                  </div>
                  {instForm.totalPrice && instForm.downPayment && (
                    <p className="mt-3 rounded-xl bg-white px-4 py-2.5 text-sm text-zinc-600">
                      Oylik to&apos;lov:{" "}
                      <b className="text-violet-700">
                        {formatPrice(
                          Math.ceil(
                            (Number(instForm.totalPrice) -
                              Number(instForm.downPayment)) /
                              Math.max(1, Number(instForm.months) || 3) /
                              1000
                          ) * 1000
                        )}
                      </b>{" "}
                      × {instForm.months || 3} oy
                    </p>
                  )}
                  {instMsg && (
                    <p className={`mt-3 text-sm font-semibold ${instMsg.startsWith("✓") ? "text-emerald-700" : "text-red-600"}`}>
                      {instMsg}
                    </p>
                  )}
                  <button type="submit" className="mt-4 rounded-full bg-violet-600 px-9 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-white transition hover:bg-violet-700">
                    Shartnoma yaratish
                  </button>
                </form>
              )}
            </div>

            {/* Shartnomalar ro'yxati */}
            {instList.length === 0 ? (
              <p className="mt-10 text-center text-zinc-500">
                Hozircha nasiya shartnomalari yo&apos;q.
              </p>
            ) : (
              <div className="mt-6 space-y-4">
                {instList.map((inst) => {
                  const paid = inst.downPayment + inst.paidAmount;
                  const remaining = inst.totalPrice - paid;
                  const progress = Math.min(
                    100,
                    Math.round((paid / inst.totalPrice) * 100)
                  );
                  return (
                    <div
                      key={inst.id}
                      className={`rounded-2xl border bg-white p-5 ${
                        inst.status === "muammoli"
                          ? "border-red-300"
                          : inst.status === "tolangan"
                          ? "border-emerald-300"
                          : "border-zinc-200"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-serif text-lg font-bold text-zinc-900">
                            #{inst.id}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              inst.status === "tolangan"
                                ? "bg-emerald-100 text-emerald-700"
                                : inst.status === "muammoli"
                                ? "bg-red-100 text-red-700"
                                : "bg-violet-100 text-violet-700"
                            }`}
                          >
                            {inst.status === "tolangan"
                              ? "✓ To'langan"
                              : inst.status === "muammoli"
                              ? "⚠ Muammoli"
                              : "📅 Faol"}
                          </span>
                          <span className="text-xs text-zinc-500">
                            {new Date(inst.createdAt).toLocaleDateString("uz-UZ")}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {inst.status === "faol" && (
                            <button
                              onClick={() => setInstStatus(inst.id, "muammoli")}
                              className="rounded-full border border-red-300 px-4 py-1.5 text-[10px] font-bold uppercase text-red-600 transition hover:bg-red-500 hover:text-white"
                            >
                              ⚠ Muammoli
                            </button>
                          )}
                          {inst.status === "muammoli" && (
                            <button
                              onClick={() => setInstStatus(inst.id, "faol")}
                              className="rounded-full border border-violet-300 px-4 py-1.5 text-[10px] font-bold uppercase text-violet-600 transition hover:bg-violet-500 hover:text-white"
                            >
                              Faolga qaytarish
                            </button>
                          )}
                          <button
                            onClick={() => deleteInst(inst.id)}
                            className="rounded-full border border-zinc-300 px-4 py-1.5 text-[10px] font-bold uppercase text-zinc-500 transition hover:border-red-400 hover:text-red-500"
                          >
                            O&apos;chirish
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 grid gap-4 md:grid-cols-2">
                        <div className="text-sm text-zinc-700">
                          <p>
                            <span className="text-zinc-500">Mijoz:</span>{" "}
                            <b>{inst.customerName}</b> ·{" "}
                            <a href={`tel:${inst.phone}`} className="font-semibold text-emerald-700">
                              {inst.phone}
                            </a>
                          </p>
                          {inst.passport && (
                            <p>
                              <span className="text-zinc-500">Pasport:</span>{" "}
                              {inst.passport}
                            </p>
                          )}
                          <p>
                            <span className="text-zinc-500">Mahsulot:</span>{" "}
                            {inst.productName}
                          </p>
                          <p>
                            <span className="text-zinc-500">Shartlar:</span>{" "}
                            {formatPrice(inst.totalPrice)} · boshlang&apos;ich{" "}
                            {formatPrice(inst.downPayment)} ·{" "}
                            {formatPrice(inst.monthlyPayment)} × {inst.months}{" "}
                            oy
                          </p>
                          {inst.comment && (
                            <p>
                              <span className="text-zinc-500">Izoh:</span>{" "}
                              {inst.comment}
                            </p>
                          )}
                        </div>
                        <div>
                          {/* Progress */}
                          <div className="flex justify-between text-xs font-semibold text-zinc-600">
                            <span>To&apos;landi: {formatPrice(paid)}</span>
                            <span className={remaining > 0 ? "text-red-600" : "text-emerald-600"}>
                              Qoldi: {formatPrice(Math.max(0, remaining))}
                            </span>
                          </div>
                          <div className="mt-2 h-3 overflow-hidden rounded-full bg-zinc-100">
                            <div
                              className={`h-full rounded-full transition-all ${
                                progress >= 100
                                  ? "bg-emerald-500"
                                  : "bg-violet-500"
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <p className="mt-1 text-right text-[11px] text-zinc-400">
                            {progress}%
                          </p>
                          {/* To'lov qo'shish */}
                          {inst.status !== "tolangan" && (
                            <div className="mt-2 flex gap-2">
                              <input
                                type="number"
                                value={payInput[inst.id] ?? ""}
                                onChange={(e) =>
                                  setPayInput({
                                    ...payInput,
                                    [inst.id]: e.target.value,
                                  })
                                }
                                placeholder={`Masalan: ${inst.monthlyPayment}`}
                                className="flex-1 rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-violet-500"
                              />
                              <button
                                onClick={() => addInstPayment(inst.id)}
                                className="rounded-xl bg-emerald-600 px-5 py-2 text-[11px] font-bold uppercase text-white transition hover:bg-emerald-700"
                              >
                                + To&apos;lov
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* ===== OMBOR ===== */}
      {tab === "ombor" && (() => {
        const omborList = productList.filter((p) => {
          const q = omborSearch.trim().toLowerCase();
          if (!q) return true;
          return (
            p.name.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q)
          );
        });
        const totalQty = productList.reduce(
          (s, p) => s + (p.stockQty ?? 0),
          0
        );
        const totalCost = productList.reduce(
          (s, p) => s + (p.costPrice ?? 0) * (p.stockQty ?? 0),
          0
        );
        const totalSale = productList.reduce(
          (s, p) => s + p.price * (p.stockQty ?? 0),
          0
        );
        const noCostCount = productList.filter(
          (p) => !p.costPrice && (p.stockQty ?? 0) > 0
        ).length;
        const profit = totalSale - totalCost;

        return (
          <div className="mt-8">
            {/* Statistika kartalari */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                <p className="text-xs uppercase tracking-widest text-zinc-500">
                  📦 Jami tovar
                </p>
                <p className="mt-2 text-3xl font-bold text-zinc-900">
                  {totalQty} <span className="text-base font-medium">dona</span>
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  {productList.length} xil mahsulot
                </p>
              </div>
              <div className="rounded-2xl border border-amber-300 bg-amber-50/60 p-5">
                <p className="text-xs uppercase tracking-widest text-zinc-500">
                  💰 Jami tannarx
                </p>
                <p className="mt-2 text-2xl font-bold text-amber-700">
                  {formatPrice(totalCost)}
                </p>
                {noCostCount > 0 && (
                  <p className="mt-1 text-xs text-red-500">
                    ⚠ {noCostCount} ta mahsulotda tannarx kiritilmagan
                  </p>
                )}
              </div>
              <div className="rounded-2xl border border-emerald-300 bg-emerald-50/60 p-5">
                <p className="text-xs uppercase tracking-widest text-zinc-500">
                  🏷 Jami sotuv qiymati
                </p>
                <p className="mt-2 text-2xl font-bold text-emerald-700">
                  {formatPrice(totalSale)}
                </p>
              </div>
              <div className="rounded-2xl border border-sky-300 bg-sky-50/60 p-5">
                <p className="text-xs uppercase tracking-widest text-zinc-500">
                  📈 Kutilayotgan foyda
                </p>
                <p className="mt-2 text-2xl font-bold text-sky-700">
                  {formatPrice(profit)}
                </p>
                {totalCost > 0 && (
                  <p className="mt-1 text-xs text-zinc-400">
                    Marja: {Math.round((profit / totalCost) * 100)}%
                  </p>
                )}
              </div>
            </div>

            {/* Qidiruv */}
            <div className="mt-6 flex items-center gap-3 rounded-full border border-zinc-300 bg-white px-5 transition focus-within:border-emerald-500 sm:max-w-md">
              <svg className="h-4 w-4 shrink-0 text-zinc-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                value={omborSearch}
                onChange={(e) => setOmborSearch(e.target.value)}
                placeholder="Ombordan qidirish..."
                className="w-full bg-transparent py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none"
              />
              {omborSearch && (
                <button
                  onClick={() => setOmborSearch("")}
                  className="shrink-0 text-zinc-400 transition hover:text-red-500"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Ombor jadvali */}
            <div className="mt-6 overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
              <table className="w-full min-w-[800px] text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500">
                    <th className="px-4 py-3.5">Mahsulot</th>
                    <th className="px-4 py-3.5 text-center">Soni (dona)</th>
                    <th className="px-4 py-3.5 text-right">Tannarx</th>
                    <th className="px-4 py-3.5 text-right">Sotuv narxi</th>
                    <th className="px-4 py-3.5 text-right">Jami tannarx</th>
                    <th className="px-4 py-3.5 text-right">Jami sotuv</th>
                    <th className="px-4 py-3.5 text-right">Foyda</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {omborList.map((p) => {
                    const qty = p.stockQty ?? 0;
                    const cost = p.costPrice ?? 0;
                    const rowCost = cost * qty;
                    const rowSale = p.price * qty;
                    return (
                      <tr
                        key={p.id}
                        className={`transition hover:bg-emerald-50/40 ${
                          qty === 0 ? "opacity-50" : ""
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="h-10 w-10 shrink-0 rounded-lg object-cover"
                            />
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-zinc-900">
                                {p.brand} — {p.name}
                              </p>
                              <p className="text-[11px] text-zinc-400">
                                {p.productType === "kosmetika"
                                  ? "💄 Kosmetika"
                                  : "🧴 Atir"}{" "}
                                · {p.volume} ml
                                {qty === 0 && (
                                  <span className="ml-1.5 font-bold text-red-500">
                                    · Tugagan
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="mx-auto flex w-fit items-center rounded-full border border-zinc-300">
                            <button
                              onClick={() => updateStockQty(p.id, qty - 1)}
                              className="flex h-8 w-8 items-center justify-center text-zinc-600 transition hover:text-red-500"
                            >
                              −
                            </button>
                            <span className="w-10 text-center font-bold text-zinc-900">
                              {qty}
                            </span>
                            <button
                              onClick={() => updateStockQty(p.id, qty + 1)}
                              className="flex h-8 w-8 items-center justify-center text-zinc-600 transition hover:text-emerald-600"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {cost ? (
                            <span className="text-amber-700">
                              {formatPrice(cost)}
                            </span>
                          ) : (
                            <button
                              onClick={() => startEdit(p)}
                              className="text-[11px] font-bold text-red-400 underline"
                            >
                              kiritilmagan
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-zinc-900">
                          {formatPrice(p.price)}
                        </td>
                        <td className="px-4 py-3 text-right text-amber-700">
                          {rowCost ? formatPrice(rowCost) : "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-emerald-700">
                          {formatPrice(rowSale)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-sky-700">
                          {cost ? formatPrice(rowSale - rowCost) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs font-light text-zinc-400">
              💡 Soni ustunidagi −/+ tugmalari bilan zaxirani darhol
              o&apos;zgartirasiz. Tannarxni kiritish uchun mahsulotni
              tahrirlang (Mahsulotlar bo&apos;limida).
            </p>
          </div>
        );
      })()}

      {/* ===== MIJOZLAR BAZASI ===== */}
      {tab === "customers" && (
        <div className="mt-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <p className="text-xs uppercase tracking-widest text-zinc-500">
                Jami mijozlar
              </p>
              <p className="mt-2 text-3xl font-bold text-zinc-900">
                {customers.length}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <p className="text-xs uppercase tracking-widest text-zinc-500">
                Klubga loyiq (8+ xarid)
              </p>
              <p className="mt-2 text-3xl font-bold text-amber-600">
                {customers.filter((c) => c.eligibleForClub).length}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <p className="text-xs uppercase tracking-widest text-zinc-500">
                Doimiy mijozlar (3+ xarid)
              </p>
              <p className="mt-2 text-3xl font-bold text-emerald-600">
                {customers.filter((c) => c.orderCount >= 3).length}
              </p>
            </div>
          </div>

          {customers.length === 0 ? (
            <p className="mt-16 text-center text-zinc-500">
              Hozircha mijozlar yo&apos;q — birinchi buyurtma kelishi bilan bu
              yerda ko&apos;rinadi.
            </p>
          ) : (
            <div className="mt-8 space-y-3">
              {customers.map((c) => (
                <div
                  key={c.phone}
                  className="flex flex-wrap items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4"
                >
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
                      c.clubMember
                        ? c.clubMember.discountPercent >= 50
                          ? "bg-amber-100"
                          : "bg-zinc-100"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {c.clubMember
                      ? c.clubMember.discountPercent >= 50
                        ? "👑"
                        : "🥈"
                      : c.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-zinc-900">
                        {c.name}
                      </span>
                      {c.clubMember && (
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            c.clubMember.discountPercent >= 50
                              ? "bg-amber-100 text-amber-700"
                              : "bg-zinc-100 text-zinc-600"
                          }`}
                        >
                          CLUB −{c.clubMember.discountPercent}%
                        </span>
                      )}
                      {c.eligibleForClub && (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                          ✅ Klubga loyiq!
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-zinc-500">
                      📞 {c.displayPhone} · Birinchi xarid:{" "}
                      {new Date(c.firstOrderAt).toLocaleDateString("uz-UZ")}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-3 text-xs">
                      <span className="font-semibold text-zinc-700">
                        🛍 {c.orderCount} ta xarid
                      </span>
                      {c.cancelledCount > 0 && (
                        <span className="text-red-500">
                          ✖ {c.cancelledCount} bekor qilingan
                        </span>
                      )}
                      <span className="font-semibold text-emerald-700">
                        💰 {formatPrice(c.totalSpent)}
                      </span>
                      {/* Klubgacha progress */}
                      {!c.clubMember && c.orderCount < 8 && (
                        <span className="text-zinc-400">
                          Klubgacha yana {8 - c.orderCount} ta xarid
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`tel:${c.displayPhone.replace(/\s/g, "")}`}
                      className="rounded-full border border-zinc-300 px-4 py-2 text-[10px] font-bold uppercase tracking-wide text-zinc-600 transition hover:border-emerald-500 hover:text-emerald-700"
                    >
                      📞 Qo&apos;ng&apos;iroq
                    </a>
                    {!c.clubMember && (
                      <button
                        onClick={() => addCustomerToClub(c)}
                        className={`rounded-full px-5 py-2 text-[10px] font-bold uppercase tracking-wide transition ${
                          c.eligibleForClub
                            ? "bg-amber-500 text-white hover:bg-amber-600"
                            : "border border-amber-300 text-amber-600 hover:bg-amber-500 hover:text-white"
                        }`}
                      >
                        👑 Klubga qo&apos;shish
                        {c.orderCount >= 10
                          ? " (−50%)"
                          : c.orderCount >= 8
                          ? " (−30%)"
                          : ""}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== CLUB A'ZOLARI ===== */}
      {tab === "club" && (
        <div className="mt-8">
          {/* Statistika */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <p className="text-xs uppercase tracking-widest text-zinc-500">
                Jami a&apos;zolar
              </p>
              <p className="mt-2 text-3xl font-bold text-zinc-900">
                {members.length}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <p className="text-xs uppercase tracking-widest text-zinc-500">
                🥈 Silver (−30%)
              </p>
              <p className="mt-2 text-3xl font-bold text-zinc-600">
                {members.filter((m) => m.discountPercent === 30).length}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <p className="text-xs uppercase tracking-widest text-zinc-500">
                👑 Gold (−50%)
              </p>
              <p className="mt-2 text-3xl font-bold text-amber-600">
                {members.filter((m) => m.discountPercent === 50).length}
              </p>
            </div>
          </div>

          {/* Klub ichki shartlari */}
          <div className="mt-6 rounded-3xl border border-amber-300/50 bg-amber-50/50 p-6">
            <h3 className="flex items-center gap-2 font-serif text-lg font-semibold text-zinc-900">
              📜 Klub ichki shartlari (admin uchun qoidalar)
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-zinc-700">
              <li className="flex gap-2">
                <span className="text-amber-600">1.</span> Klubga qo&apos;shilish
                uchun mijoz kamida <b>8 ta buyurtma</b> qilgan bo&apos;lishi
                kerak (bekor qilinganlar sanalmaydi).
              </li>
              <li className="flex gap-2">
                <span className="text-amber-600">2.</span> <b>8–9 ta xarid</b> —
                🥈 Silver daraja: barcha atirlarga <b>−30%</b> doimiy chegirma.
              </li>
              <li className="flex gap-2">
                <span className="text-amber-600">3.</span> <b>10+ ta xarid</b> —
                👑 Gold daraja: barcha atirlarga <b>−50%</b> doimiy chegirma.
              </li>
              <li className="flex gap-2">
                <span className="text-amber-600">4.</span> Chegirma mijozning{" "}
                <b>telefon raqami</b> orqali buyurtma berishda avtomatik
                qo&apos;llanadi.
              </li>
              <li className="flex gap-2">
                <span className="text-amber-600">5.</span> Chegirma razliv va
                barcha versiyalarga (Fransiya/Dubay/Turkiya) ham amal qiladi.
              </li>
              <li className="flex gap-2">
                <span className="text-amber-600">6.</span> Admin istalgan
                mijozni qo&apos;lda qo&apos;shishi, darajasini
                o&apos;zgartirishi yoki klubdan chiqarishi mumkin (masalan,
                qoidabuzarlik bo&apos;lsa).
              </li>
              <li className="flex gap-2">
                <span className="text-amber-600">7.</span> Klub chegirmasi
                boshqa aksiyalar bilan qo&apos;shilmaydi — har doim eng katta
                bitta chegirma amal qiladi.
              </li>
            </ul>
          </div>

          {/* Qo'lda a'zo qo'shish */}
          <form
            onSubmit={addMember}
            className="mt-6 rounded-3xl border-2 border-emerald-500/40 bg-emerald-50/40 p-6"
          >
            <h3 className="font-serif text-lg font-semibold text-zinc-900">
              ➕ Qo&apos;lda a&apos;zo qo&apos;shish
            </h3>
            <p className="mt-1 text-xs font-light text-zinc-500">
              Maxsus mijozlarni xaridlar sonidan qat&apos;i nazar klubga
              qo&apos;shishingiz mumkin
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <input
                required
                value={memberForm.name}
                onChange={(e) =>
                  setMemberForm({ ...memberForm, name: e.target.value })
                }
                placeholder="Ism familiya"
                className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
              />
              <input
                required
                type="tel"
                value={memberForm.phone}
                onChange={(e) =>
                  setMemberForm({ ...memberForm, phone: e.target.value })
                }
                placeholder="+998 90 123 45 67"
                className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
              />
              <select
                value={memberForm.discountPercent}
                onChange={(e) =>
                  setMemberForm({
                    ...memberForm,
                    discountPercent: Number(e.target.value),
                  })
                }
                className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
              >
                <option value={30}>🥈 Silver — 30%</option>
                <option value={50}>👑 Gold — 50%</option>
              </select>
            </div>
            {memberMsg && (
              <p
                className={`mt-3 text-sm font-semibold ${
                  memberMsg.startsWith("✓")
                    ? "text-emerald-700"
                    : "text-red-600"
                }`}
              >
                {memberMsg}
              </p>
            )}
            <button
              type="submit"
              className="mt-4 rounded-full bg-emerald-600 px-8 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-white transition hover:bg-emerald-700"
            >
              Klubga qo&apos;shish
            </button>
          </form>

          {/* A'zolar ro'yxati */}
          {members.length === 0 ? (
            <p className="mt-10 text-center text-zinc-500">
              Hozircha klub a&apos;zolari yo&apos;q.
            </p>
          ) : (
            <div className="mt-6 space-y-3">
              {members.map((m) => (
                <div
                  key={m.id}
                  className="flex flex-wrap items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4"
                >
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-full text-xl ${
                      m.discountPercent >= 50
                        ? "bg-amber-100"
                        : "bg-zinc-100"
                    }`}
                  >
                    {m.discountPercent >= 50 ? "👑" : "🥈"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-zinc-900">
                        {m.name}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          m.discountPercent >= 50
                            ? "bg-amber-100 text-amber-700"
                            : "bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        {m.discountPercent >= 50 ? "GOLD −50%" : "SILVER −30%"}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-zinc-500">
                      📞 +998 {m.phone.replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4")}{" "}
                      · {m.orderCount} ta xarid · Qo&apos;shilgan:{" "}
                      {new Date(m.joinedAt).toLocaleDateString("uz-UZ")}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`tel:+998${m.phone}`}
                      className="rounded-full border border-zinc-300 px-4 py-2 text-[10px] font-bold uppercase tracking-wide text-zinc-600 transition hover:border-emerald-500 hover:text-emerald-700"
                    >
                      📞 Qo&apos;ng&apos;iroq
                    </a>
                    <button
                      onClick={() =>
                        updateMemberDiscount(
                          m.id,
                          m.discountPercent === 50 ? 30 : 50
                        )
                      }
                      className="rounded-full border border-amber-400 px-4 py-2 text-[10px] font-bold uppercase tracking-wide text-amber-600 transition hover:bg-amber-500 hover:text-white"
                    >
                      {m.discountPercent === 50
                        ? "Silver'ga tushirish"
                        : "Gold'ga ko'tarish"}
                    </button>
                    <button
                      onClick={() => removeMember(m.id, m.name)}
                      className="rounded-full border border-red-300 px-4 py-2 text-[10px] font-bold uppercase tracking-wide text-red-600 transition hover:bg-red-600 hover:text-white"
                    >
                      Chiqarish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== SAYT SOZLAMALARI ===== */}
      {tab === "settings" && (
        <form onSubmit={saveSettings} className="mt-8 max-w-3xl">
          <div className="rounded-3xl border border-zinc-200 bg-white p-7">
            <h3 className="font-serif text-xl font-semibold text-zinc-900">
              ⚙️ Sayt ma&apos;lumotlarini tahrirlash
            </h3>
            <p className="mt-1 text-sm font-light text-zinc-500">
              Bu ma&apos;lumotlar saytning footer, aloqa va savat sahifalarida
              avtomatik ko&apos;rinadi
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  📍 Do&apos;kon manzili
                </label>
                <input
                  value={siteSettings.site_address ?? ""}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      site_address: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  📞 Asosiy telefon
                </label>
                <input
                  value={siteSettings.site_phone ?? ""}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      site_phone: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  📞 Qo&apos;shimcha telefon
                </label>
                <input
                  value={siteSettings.site_phone2 ?? ""}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      site_phone2: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  ✉️ Email
                </label>
                <input
                  value={siteSettings.site_email ?? ""}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      site_email: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  🕙 Ish vaqti
                </label>
                <input
                  value={siteSettings.site_work_hours ?? ""}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      site_work_hours: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  📨 Telegram kanal (https://t.me/...)
                </label>
                <input
                  value={siteSettings.site_telegram ?? ""}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      site_telegram: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  🤖 Telegram bot (https://t.me/..._bot)
                </label>
                <input
                  value={siteSettings.site_telegram_bot ?? ""}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      site_telegram_bot: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  🗺️ Lokatsiya — kenglik (lat)
                </label>
                <input
                  value={siteSettings.site_lat ?? ""}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      site_lat: e.target.value,
                    })
                  }
                  placeholder="41.285"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  🗺️ Lokatsiya — uzunlik (lng)
                </label>
                <input
                  value={siteSettings.site_lng ?? ""}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      site_lng: e.target.value,
                    })
                  }
                  placeholder="69.215"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* ===== Telegram xabarnoma sozlamalari ===== */}
            <div className="mt-8 rounded-2xl border border-sky-200 bg-sky-50/60 p-5">
              <h4 className="flex items-center gap-2 font-serif text-base font-semibold text-zinc-900">
                📨 Buyurtma xabarnomasi (Telegram)
              </h4>
              <p className="mt-1 text-xs font-light text-zinc-500">
                Sozlansa — har yangi buyurtma kelishi bilan Telegramingizga
                darhol xabar boradi. Bot yaratish:{" "}
                <a
                  href="https://t.me/BotFather"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-sky-600 underline"
                >
                  @BotFather
                </a>{" "}
                → /newbot → tokenni oling. Chat ID olish:{" "}
                <a
                  href="https://t.me/userinfobot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-sky-600 underline"
                >
                  @userinfobot
                </a>{" "}
                ga yozing. Keyin botingizga /start bosing.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    🤖 Bot token
                  </label>
                  <input
                    type="password"
                    value={siteSettings.tg_bot_token ?? ""}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        tg_bot_token: e.target.value,
                      })
                    }
                    placeholder="123456789:ABC-DEF..."
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    💬 Chat ID
                  </label>
                  <input
                    value={siteSettings.tg_chat_id ?? ""}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        tg_chat_id: e.target.value,
                      })
                    }
                    placeholder="123456789"
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-sky-500"
                  />
                </div>
              </div>
              <p className="mt-3 text-[11px] font-light text-zinc-400">
                🔒 Token maxfiy saqlanadi — saytning ochiq qismida hech qachon
                ko&apos;rinmaydi.
              </p>
            </div>

            {settingsMsg && (
              <p
                className={`mt-5 rounded-xl px-4 py-3 text-sm font-semibold ${
                  settingsMsg.startsWith("✓")
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {settingsMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={settingsSaving}
              className="mt-6 rounded-full bg-emerald-600 px-10 py-3.5 text-[11px] font-bold uppercase tracking-[0.15em] text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {settingsSaving ? "Saqlanmoqda..." : "Sozlamalarni saqlash"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
