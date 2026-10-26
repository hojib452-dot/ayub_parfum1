import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  description: text("description").notNull(),
  productType: text("product_type").notNull().default("atir"), // atir | kosmetika
  category: text("category").notNull(), // atir: erkaklar|ayollar|uniseks; kosmetika: makiyaj|yuz-parvarishi|tana|soch
  origin: text("origin").notNull().default("fransiya"), // fransiya | arab | turkiya | fransiya-moyli | ozbekiston
  price: integer("price").notNull(), // sotuv narxi, so'mda
  oldPrice: integer("old_price"),
  costPrice: integer("cost_price"), // tannarx (ombor uchun)
  stockQty: integer("stock_qty").notNull().default(1), // ombordagi soni
  volume: integer("volume").notNull(), // ml
  imageUrl: text("image_url").notNull(),
  imageUrl2: text("image_url_2"),
  featured: boolean("featured").notNull().default(false),
  inStock: boolean("in_stock").notNull().default(true),
  // Razliv sozlamalari (atirlar uchun)
  razlivEnabled: boolean("razliv_enabled").notNull().default(true),
  razlivPriceMl: integer("razliv_price_ml"), // null = avtomatik hisoblash
  // Fransiya atirlari uchun versiyalar zaxirasi (boshqa kataloglarda e'tiborga olinmaydi)
  stockFransiya: boolean("stock_fransiya").notNull().default(true),
  stockDubay: boolean("stock_dubay").notNull().default(true),
  stockTurkiya: boolean("stock_turkiya").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Muddatli to'lov (nasiya) shartnomalari
export const installments = pgTable("installments", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  passport: text("passport"),
  productName: text("product_name").notNull(),
  totalPrice: integer("total_price").notNull(), // umumiy summa
  downPayment: integer("down_payment").notNull(), // boshlang'ich to'lov
  months: integer("months").notNull().default(3),
  monthlyPayment: integer("monthly_payment").notNull(),
  paidAmount: integer("paid_amount").notNull().default(0), // boshlang'ichdan tashqari to'langan
  status: text("status").notNull().default("faol"), // faol | tolangan | muammoli
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  deliveryType: text("delivery_type").notNull().default("yetkazib_berish"), // olib_ketish | yetkazib_berish
  address: text("address").notNull().default(""),
  locationLat: text("location_lat"),
  locationLng: text("location_lng"),
  paymentMethod: text("payment_method").notNull().default("naqd"), // naqd | karta | muddatli
  installmentMonths: integer("installment_months"), // muddatli bo'lsa: 2 yoki 3
  comment: text("comment"),
  total: integer("total").notNull(),
  discountPercent: integer("discount_percent").notNull().default(0),
  status: text("status").notNull().default("yangi"), // yangi | qabul qilindi | yetkazildi | bekor qilindi
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

// Kunlik tashriflar statistikasi
export const visits = pgTable("visits", {
  day: text("day").primaryKey(), // YYYY-MM-DD
  count: integer("count").notNull().default(0),
});

export const clubMembers = pgTable("club_members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(), // normallashtirilgan: faqat raqamlar
  discountPercent: integer("discount_percent").notNull(), // 30 yoki 50
  orderCount: integer("order_count").notNull(),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id),
  productName: text("product_name").notNull(),
  price: integer("price").notNull(),
  quantity: integer("quantity").notNull(),
});

export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type ClubMember = typeof clubMembers.$inferSelect;
export type Installment = typeof installments.$inferSelect;
