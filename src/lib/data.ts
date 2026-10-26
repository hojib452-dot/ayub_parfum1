import { db } from "@/db";
import { products, type Product } from "@/db/schema";
import { and, asc, eq, ilike, or } from "drizzle-orm";

type SeedProduct = Omit<
  Product,
  | "id"
  | "createdAt"
  | "origin"
  | "imageUrl2"
  | "stockFransiya"
  | "stockDubay"
  | "stockTurkiya"
  | "productType"
  | "razlivEnabled"
  | "razlivPriceMl"
  | "costPrice"
  | "stockQty"
> & {
  costPrice?: number | null;
  stockQty?: number;
  origin?: string;
  imageUrl2?: string | null;
  stockFransiya?: boolean;
  stockDubay?: boolean;
  stockTurkiya?: boolean;
  productType?: string;
  razlivEnabled?: boolean;
  razlivPriceMl?: number | null;
};

const SEED_PRODUCTS: SeedProduct[] = [
  // ===== BACCARAT (MAISON FRANCIS KURKDJIAN) =====
  {
    name: "Baccarat Rouge 540",
    brand: "Maison Francis Kurkdjian",
    description:
      "MFK Baccarat Rouge 540 — dunyodagi eng mashhur niche atir. Za'faron, yasemin, amber va seder notalari. Billur kabi yorqin, shirin-yog'ochli shleyf — uni sezgan har kim kim ekanligingizni so'raydi. Haqiqiy hashamat timsoli.",
    category: "uniseks",
    price: 5200000,
    oldPrice: 5800000,
    volume: 70,
    imageUrl:
      "https://images.pexels.com/photos/13767426/pexels-photo-13767426.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: true,
    inStock: true,
  },
  // ===== BURBERRY =====
  {
    name: "Her",
    brand: "Burberry",
    description:
      "Burberry Her — London uslubidagi zamonaviy ayol ifori. Qulupnay, malina, yasemin va musk notalari. Shirin mevali, ammo nafis — kundalik hayot va uchrashuvlar uchun quvnoq tanlov.",
    category: "ayollar",
    price: 1550000,
    oldPrice: null,
    volume: 100,
    imageUrl: "/images/burberry-her.jpg",
    featured: false,
    inStock: true,
  },
  // ===== CAROLINA HERRERA =====
  {
    name: "Good Girl",
    brand: "Carolina Herrera",
    description:
      "Carolina Herrera Good Girl — afsonaviy tufli shaklidagi flakon. Yasemin, tuberoza, kakao va tonka loviyasi notalari. 'Yaxshi qiz, ammo sirli' — kechki tadbirlar uchun jasur va maftunkor ifor.",
    category: "ayollar",
    price: 1850000,
    oldPrice: 2100000,
    volume: 80,
    imageUrl:
      "https://images.pexels.com/photos/15098674/pexels-photo-15098674.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: true,
    inStock: true,
  },
  // ===== AZZARO =====
  {
    name: "The Most Wanted",
    brand: "Azzaro",
    description:
      "Azzaro The Most Wanted — oltin quyma shaklidagi flakonda jasur erkaklar ifori. Qizil zanjabil, karamel va yog'ochli amber notalari. Kechki tadbirlar va uchrashuvlar uchun magnit kabi tortuvchi shleyf.",
    category: "erkaklar",
    price: 1700000,
    oldPrice: null,
    volume: 100,
    imageUrl: "/images/azzaro-wanted.jpg",
    featured: false,
    inStock: true,
  },
  // ===== CHANEL =====
  {
    name: "Bleu de Chanel",
    brand: "Chanel",
    description:
      "Bleu de Chanel — erkinlik va o'ziga ishonch ramzi. Grepfrut, zanjabil, sandal daraxti va tutun notalari uyg'unligi. Har qanday vaziyatga mos, zamonaviy jentlmenning ajralmas hamrohi. Dunyodagi eng ko'p sotiladigan erkaklar atirlaridan biri.",
    category: "erkaklar",
    price: 2300000,
    oldPrice: 2600000,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/9202894/pexels-photo-9202894.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: true,
    inStock: true,
  },
  {
    name: "Allure Homme Sport",
    brand: "Chanel",
    description:
      "Chanel Allure Homme Sport — sport va nafislik uyg'unligi. Apelsin, dengiz notalari, oq musk va seder daraxti. Faol hayot tarzidagi erkaklar uchun tetiklantiruvchi va barqaror ifor.",
    category: "erkaklar",
    price: 2200000,
    oldPrice: null,
    volume: 100,
    imageUrl: "/images/allure-sport.jpg",
    featured: false,
    inStock: true,
  },
  // ===== CHANEL (AYOLLAR) =====
  {
    name: "Coco Mademoiselle",
    brand: "Chanel",
    description:
      "Chanel Coco Mademoiselle — erkin va o'ziga ishongan ayol ifori. Apelsin, atirgul, patchouli va oq musk notalari. Parij nafosatining timsoli — har bir ayolning orzusidagi klassika.",
    category: "ayollar",
    price: 2400000,
    oldPrice: 2700000,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/6945831/pexels-photo-6945831.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: true,
    inStock: true,
  },
  {
    name: "Chance Eau Tendre",
    brand: "Chanel",
    description:
      "Chanel Chance Eau Tendre — noziklik va baxt ifori. Grepfrut, behi, yasemin va oq musk notalari. Yumshoq pudrali-mevali shleyf — romantik tabiatli ayollar uchun mukammal tanlov.",
    category: "ayollar",
    price: 2300000,
    oldPrice: null,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/26924213/pexels-photo-26924213.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  // ===== CREED =====
  {
    name: "Aventus",
    brand: "Creed",
    description:
      "Creed Aventus — dunyodagi eng afsonaviy niche atir. Ananas, qora smorodina, qayin va musk notalari. G'alaba va muvaffaqiyat ifori — yuqori martabali erkaklar tanlovi. Har bir flakon qo'lda tayyorlanadi.",
    category: "erkaklar",
    price: 4800000,
    oldPrice: 5500000,
    volume: 100,
    imageUrl: "/images/creed-aventus.jpg",
    featured: true,
    inStock: true,
  },
  // ===== DIOR =====
  {
    name: "Sauvage",
    brand: "Dior",
    description:
      "Dior Sauvage — yovvoyi tabiat ilhomidagi afsonaviy ifor. Kalabriya bergamoti, Sichuan murchi va ambroxan notalari. Kuchli, erkin va magnit kabi tortuvchi — dunyodagi eng mashhur erkaklar atiri.",
    category: "erkaklar",
    price: 2100000,
    oldPrice: 2400000,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/12562773/pexels-photo-12562773.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: true,
    inStock: true,
  },
  // ===== DIOR (AYOLLAR) =====
  {
    name: "J'adore",
    brand: "Dior",
    description:
      "Dior J'adore — oltin tomchi shaklidagi afsonaviy flakon. Ilang-ilang, Damask atirguli va yasemin notalari. Ayollik va hashamatning mutlaq timsoli — 25 yildan beri dunyoning eng sevimli ayollar atiri.",
    category: "ayollar",
    price: 2350000,
    oldPrice: 2650000,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/11059440/pexels-photo-11059440.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: true,
    inStock: true,
  },
  {
    name: "Miss Dior",
    brand: "Dior",
    description:
      "Miss Dior — bant bilan bezatilgan nafis flakonda sevgi ifori. Grasse atirguli, peoniya va oq musk notalari. Yosh va romantik ayollar uchun — go'zallik va muhabbatning parfyumdagi aksi.",
    category: "ayollar",
    price: 2250000,
    oldPrice: null,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/32630385/pexels-photo-32630385.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  // ===== DOLCE & GABBANA =====
  {
    name: "Light Blue",
    brand: "Dolce & Gabbana",
    description:
      "D&G Light Blue — Sitsiliya yozining ayollar uchun ifori. Limon, yashil olma, bambuk va oq atirgul notalari. Yengil, toza va tetiklantiruvchi — yozning eng sevimli ayollar atiri.",
    category: "ayollar",
    price: 1400000,
    oldPrice: 1600000,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/30232866/pexels-photo-30232866.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  {
    name: "Light Blue Pour Homme",
    brand: "Dolce & Gabbana",
    description:
      "D&G Light Blue Pour Homme — O'rta yer dengizi yozining ifori. Sitsiliya mandarini, bergamot, achchiq bodom va mushk notalari. Yoz kunlari va kundalik foydalanish uchun yengil, toza tanlov.",
    category: "erkaklar",
    price: 1350000,
    oldPrice: null,
    volume: 125,
    imageUrl:
      "https://images.pexels.com/photos/30233103/pexels-photo-30233103.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  // ===== GIORGIO ARMANI =====
  {
    name: "Acqua di Gio",
    brand: "Giorgio Armani",
    description:
      "Giorgio Armani Acqua di Gio — dengiz shabadasi va quyoshli orollar ifori. Bergamot, dengiz notalari, yasemin va oq musk. 25 yildan beri dunyoning eng sevimli yozgi atirlaridan biri.",
    category: "erkaklar",
    price: 1600000,
    oldPrice: 1850000,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/8747010/pexels-photo-8747010.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: true,
    inStock: true,
  },
  // ===== GIORGIO ARMANI (AYOLLAR) =====
  {
    name: "My Way",
    brand: "Giorgio Armani",
    description:
      "Giorgio Armani My Way — sayohat va kashfiyotlar ifori. Bergamot, tuberoza, hind yasemini va oq musk notalari. Dunyoni o'z yo'li bilan kashf etayotgan zamonaviy ayollar uchun.",
    category: "ayollar",
    price: 1950000,
    oldPrice: null,
    volume: 90,
    imageUrl: "/images/my-way.jpg",
    featured: false,
    inStock: true,
  },
  // ===== GUCCI =====
  {
    name: "Bloom",
    brand: "Gucci",
    description:
      "Gucci Bloom — gullagan bog' ifori. Tuberoza, yasemin va Rangun yoprog'i notalari. Tabiiy va samimiy ayollik — oq gullarning eng boy va halol talqini.",
    category: "ayollar",
    price: 1900000,
    oldPrice: 2150000,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/19251919/pexels-photo-19251919.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: true,
    inStock: true,
  },
  // ===== HUGO BOSS =====
  {
    name: "Boss Bottled",
    brand: "Hugo Boss",
    description:
      "Hugo Boss Bottled — klassik ishbilarmon erkak ifori. Olma, dolchin, sandal va vanil notalari. Ofis, uchrashuvlar va rasmiy tadbirlar uchun ishonchli, vazmin va elegant tanlov.",
    category: "erkaklar",
    price: 1250000,
    oldPrice: 1400000,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/20753035/pexels-photo-20753035.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  // ===== JEAN PAUL GAULTIER =====
  {
    name: "Le Male",
    brand: "Jean Paul Gaultier",
    description:
      "Jean Paul Gaultier Le Male — afsonaviy tanali flakondagi mashhur ifor. Lavanda, yalpiz, vanil va sandal daraxti. Romantik va jasur — 30 yildan beri millionlab erkaklarning sevimlisi.",
    category: "erkaklar",
    price: 1550000,
    oldPrice: null,
    volume: 125,
    imageUrl:
      "https://images.pexels.com/photos/37468237/pexels-photo-37468237.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  // ===== LANCOME =====
  {
    name: "La Vie Est Belle",
    brand: "Lancôme",
    description:
      "Lancôme La Vie Est Belle — 'Hayot go'zal' degan ma'noni anglatuvchi baxt ifori. Iris, yasemin, pralin va vanil notalari. Shirin gurman shleyf — dunyodagi eng ko'p sotiladigan ayollar atirlaridan biri.",
    category: "ayollar",
    price: 1800000,
    oldPrice: 2000000,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/30569235/pexels-photo-30569235.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: true,
    inStock: true,
  },
  // ===== MUGLER =====
  {
    name: "Alien",
    brand: "Mugler",
    description:
      "Mugler Alien — binafsha billur shaklidagi sirli flakon. Hind yasemini, kashmir yog'ochi va oq amber notalari. Koinotdan kelgan kabi o'zgacha ifor — kuchli va unutilmas shleyf.",
    category: "ayollar",
    price: 1750000,
    oldPrice: null,
    volume: 90,
    imageUrl:
      "https://images.pexels.com/photos/20695468/pexels-photo-20695468.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  // ===== PACO RABANNE =====
  {
    name: "1 Million",
    brand: "Paco Rabanne",
    description:
      "Paco Rabanne 1 Million — oltin quyma flakonda boylik va jasorat ifori. Qizil apelsin, dolchin, atirgul va teri notalari. O'ziga ishongan, e'tibor markazida bo'lishni yoqtiradigan erkaklar uchun.",
    category: "erkaklar",
    price: 1500000,
    oldPrice: 1700000,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/30588986/pexels-photo-30588986.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  // ===== PARFUMS DE MARLY =====
  {
    name: "Layton",
    brand: "Parfums de Marly",
    description:
      "Parfums de Marly Layton — qirollik hashamatining timsoli. Olma, lavanda, vanil va qahva notalari. Fransuz niche parfyumeriyasining eng yorqin yulduzi — maxsus kunlar va sovuq oqshomlar uchun mukammal.",
    category: "uniseks",
    price: 4200000,
    oldPrice: 4700000,
    volume: 125,
    imageUrl: "/images/pdm-layton.jpg",
    featured: true,
    inStock: true,
  },
  // ===== TOM FORD =====
  {
    name: "Oud Wood",
    brand: "Tom Ford",
    description:
      "Tom Ford Oud Wood — sharqona ud daraxtining g'arbona talqini. Ud, sandal, vetiver va tonka loviyasi notalari. Nozik did egalari uchun hashamatli uniseks ifor — Tom Ford Private Blend kolleksiyasining durdonasi.",
    category: "uniseks",
    price: 3900000,
    oldPrice: null,
    volume: 50,
    imageUrl:
      "https://images.pexels.com/photos/34143831/pexels-photo-34143831.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: true,
    inStock: true,
  },
  // ===== VERSACE =====
  {
    name: "Bright Crystal",
    brand: "Versace",
    description:
      "Versace Bright Crystal — pushti billur qopqoqli nafis flakon. Anor, peoniya, magnoliya va musk notalari. Yorqin, mevali-gulli ifor — yoz kunlari va quvnoq ayollar uchun mukammal.",
    category: "ayollar",
    price: 1400000,
    oldPrice: 1550000,
    volume: 90,
    imageUrl: "/images/bright-crystal.jpg",
    featured: false,
    inStock: true,
  },
  {
    name: "Eros",
    brand: "Versace",
    description:
      "Versace Eros — sevgi xudosi ilhomidagi kuchli ifor. Yalpiz, yashil olma, vanil va seder notalari. Yosh, jasur va energiyaga to'la erkaklar uchun — kechki hayotning eng yorqin atiri.",
    category: "erkaklar",
    price: 1450000,
    oldPrice: 1650000,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/28460123/pexels-photo-28460123.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: true,
    inStock: true,
  },
  // ===== VIKTOR & ROLF =====
  {
    name: "Flowerbomb",
    brand: "Viktor & Rolf",
    description:
      "Viktor & Rolf Flowerbomb — gul granatasi shaklidagi mashhur flakon. Yasemin, atirgul, orxideya va patchouli notalari. Gullar portlashi kabi boy va shirin ifor — maxsus kunlar uchun hashamatli tanlov.",
    category: "ayollar",
    price: 2100000,
    oldPrice: 2400000,
    volume: 100,
    imageUrl: "/images/flowerbomb.jpg",
    featured: false,
    inStock: true,
  },
  // ===== YVES SAINT LAURENT =====
  {
    name: "Libre",
    brand: "Yves Saint Laurent",
    description:
      "YSL Libre — erkinlik ifori. Lavanda, apelsin guli va vanil notalarining jasur uyg'unligi. 'Libre' — fransuzchada erkin degani. O'z qoidalari bilan yashaydigan ayollar uchun.",
    category: "ayollar",
    price: 2000000,
    oldPrice: 2250000,
    volume: 90,
    imageUrl:
      "https://images.pexels.com/photos/8981521/pexels-photo-8981521.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: true,
    inStock: true,
  },
  {
    name: "Y Eau de Parfum",
    brand: "Yves Saint Laurent",
    description:
      "YSL Y EDP — yangi avlod muvaffaqiyat ifori. Olma, zanjabil, shalfey va ambergris notalari. Maqsadga intiluvchi, zamonaviy erkaklar uchun — kunduzi ham, kechqurun ham mukammal.",
    category: "erkaklar",
    price: 1850000,
    oldPrice: 2100000,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/39591768/pexels-photo-39591768.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  {
    name: "La Nuit de L'Homme",
    brand: "Yves Saint Laurent",
    description:
      "YSL La Nuit de L'Homme — tungi uchrashuvlarning sirli ifori. Kardamon, seder, bergamot va vetiver notalari. Romantik oqshomlar uchun eng ko'p tavsiya etiladigan atir — nozik, ammo esda qolarli.",
    category: "erkaklar",
    price: 1650000,
    oldPrice: null,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/11920479/pexels-photo-11920479.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },

  // ============================================================
  // ========== TURKIYA ATIRLARI ==========
  // ============================================================
  {
    name: "Bargello 384",
    brand: "Bargello",
    description:
      "Bargello 384 — Turkiyaning eng mashhur parfyum brendidan Aventus uslubidagi ifor. Ananas, bergamot va musk notalari. Yuqori sifat, hamyonbop narx — Turkiya atirlarining yorqin namunasi.",
    category: "erkaklar",
    origin: "turkiya",
    price: 280000,
    oldPrice: 330000,
    volume: 50,
    imageUrl:
      "https://images.pexels.com/photos/7270663/pexels-photo-7270663.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  {
    name: "Bargello 122",
    brand: "Bargello",
    description:
      "Bargello 122 — Coco Mademoiselle uslubidagi ayollar ifori. Apelsin, atirgul va patchouli notalari. Turkiyada ishlab chiqarilgan, uzoq turadigan sifatli parfyum.",
    category: "ayollar",
    origin: "turkiya",
    price: 270000,
    oldPrice: null,
    volume: 50,
    imageUrl:
      "https://images.pexels.com/photos/16034366/pexels-photo-16034366.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  {
    name: "Eyfel W-5",
    brand: "Eyfel",
    description:
      "Eyfel W-5 — La Vie Est Belle uslubidagi shirin gurman ifor. Iris, pralin va vanil notalari. Turkiyaning sevimli brendidan kundalik foydalanish uchun ajoyib tanlov.",
    category: "ayollar",
    origin: "turkiya",
    price: 220000,
    oldPrice: 260000,
    volume: 50,
    imageUrl:
      "https://images.pexels.com/photos/6867436/pexels-photo-6867436.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  {
    name: "Eyfel M-73",
    brand: "Eyfel",
    description:
      "Eyfel M-73 — Sauvage uslubidagi erkaklar ifori. Bergamot, murch va ambroxan notalari. Turkiyada ishlab chiqarilgan, kuchli shleyfli hamyonbop atir.",
    category: "erkaklar",
    origin: "turkiya",
    price: 220000,
    oldPrice: null,
    volume: 50,
    imageUrl:
      "https://images.pexels.com/photos/16239693/pexels-photo-16239693.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },

  // ============================================================
  // ========== FRANSIYA MOYLI ATIRLARI ==========
  // ============================================================
  {
    name: "Sauvage Moyli",
    brand: "Dior",
    description:
      "Dior Sauvage asosidagi konsentrlangan moyli atir (parfyum moyi). Spirtsiz, teriga uzoq singib turadi — 12 soatgacha. Fransiya xomashyosidan tayyorlangan, roller flakonda. Namozxonlar uchun ham qulay.",
    category: "erkaklar",
    origin: "fransiya-moyli",
    price: 180000,
    oldPrice: 220000,
    volume: 12,
    imageUrl:
      "https://images.pexels.com/photos/37000509/pexels-photo-37000509.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  {
    name: "Baccarat Rouge 540 Moyli",
    brand: "Maison Francis Kurkdjian",
    description:
      "Baccarat Rouge 540 asosidagi hashamatli moyli atir. Za'faron, amber va seder notalari spirtsiz moy shaklida — teringizda kun bo'yi saqlanadi. Fransiya xomashyosi, roller flakonda.",
    category: "uniseks",
    origin: "fransiya-moyli",
    price: 250000,
    oldPrice: null,
    volume: 12,
    imageUrl:
      "https://images.pexels.com/photos/34051691/pexels-photo-34051691.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  {
    name: "Coco Mademoiselle Moyli",
    brand: "Chanel",
    description:
      "Coco Mademoiselle asosidagi nafis moyli atir. Apelsin, atirgul va oq musk notalari konsentrlangan moy shaklida. Spirtsiz — nozik teriga ham mos, Fransiya xomashyosidan.",
    category: "ayollar",
    origin: "fransiya-moyli",
    price: 200000,
    oldPrice: 240000,
    volume: 12,
    imageUrl:
      "https://images.pexels.com/photos/9464725/pexels-photo-9464725.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  {
    name: "Oud Wood Moyli",
    brand: "Tom Ford",
    description:
      "Tom Ford Oud Wood asosidagi sharqona moyli atir. Ud, sandal va vetiver notalari sof moy shaklida — an'anaviy attor uslubida. Fransiya xomashyosi, 12 ml roller flakonda.",
    category: "uniseks",
    origin: "fransiya-moyli",
    price: 230000,
    oldPrice: null,
    volume: 12,
    imageUrl:
      "https://images.pexels.com/photos/35237609/pexels-photo-35237609.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },

  // ============================================================
  // ========== O'ZBEKISTON ATIRLARI ==========
  // ============================================================
  {
    name: "Registon",
    brand: "Samarqand Parfum",
    description:
      "Registon — Samarqandning qadimiy go'zalligi ilhomidagi mahalliy ifor. Anor guli, sandal va amber notalari. O'zbekistonda ishlab chiqarilgan, milliy ruhdagi premium atir.",
    category: "erkaklar",
    origin: "ozbekiston",
    price: 150000,
    oldPrice: 180000,
    volume: 60,
    imageUrl:
      "https://images.pexels.com/photos/15096784/pexels-photo-15096784.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  {
    name: "Buxoro Oud",
    brand: "Sharq Atirlari",
    description:
      "Buxoro Oud — qadimiy ipak yo'li shaharlaridan ilhomlangan sharqona ud ifori. Ud, za'faron va atirgul notalari. O'zbek ustalari tomonidan an'anaviy usulda tayyorlangan.",
    category: "uniseks",
    origin: "ozbekiston",
    price: 190000,
    oldPrice: null,
    volume: 60,
    imageUrl:
      "https://images.pexels.com/photos/30618765/pexels-photo-30618765.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    featured: false,
    inStock: true,
  },
  {
    name: "Toshkent Bahori",
    brand: "Chimyon Parfum",
    description:
      "Toshkent Bahori — bahorgi gullagan bog'lar ifori. O'rik guli, yasemin va oq musk notalari. O'zbekistonda ishlab chiqarilgan yengil va nafis ayollar atiri.",
    category: "ayollar",
    origin: "ozbekiston",
    price: 130000,
    oldPrice: 160000,
    volume: 60,
    imageUrl:
      "https://images.pexels.com/photos/14736080/pexels-photo-14736080.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  {
    name: "Samarqand Gullari",
    brand: "Samarqand Parfum",
    description:
      "Samarqand Gullari — sharq ayolining nafosati ifori. Atirgul, binafsha va vanil notalari. Mahalliy xomashyo va an'anaviy retseptlar asosida O'zbekistonda tayyorlangan.",
    category: "ayollar",
    origin: "ozbekiston",
    price: 140000,
    oldPrice: null,
    volume: 60,
    imageUrl:
      "https://images.pexels.com/photos/37127787/pexels-photo-37127787.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    featured: false,
    inStock: true,
  },

  // ============================================================
  // ========== YANGI QO'SHIMCHA KOLLEKSIYA (30 ta) ==========
  // ============================================================
  // ===== LOUIS VUITTON =====
  {
    name: "Imagination",
    brand: "Louis Vuitton",
    description:
      "Louis Vuitton Imagination — cheksiz tasavvur ifori. Sitrus, zanjabil, qora choy va ambroxan notalari. Yengil, ammo o'ta barqaror — hashamatli frantsuz uyi mahsuloti.",
    category: "erkaklar",
    price: 7500000,
    oldPrice: null,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/10413737/pexels-photo-10413737.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  {
    name: "Ombre Nomade",
    brand: "Louis Vuitton",
    description:
      "Louis Vuitton Ombre Nomade — sahro kechasining ifori. Ud, atirgul, malina va benzoin notalari. Eng kuchli va eng hashamatli ud atirlaridan biri — chinakam boylik timsoli.",
    category: "uniseks",
    price: 8200000,
    oldPrice: null,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/11517300/pexels-photo-11517300.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  {
    name: "Pacific Chill",
    brand: "Louis Vuitton",
    description:
      "Louis Vuitton Pacific Chill — Tinch okean sohilining salqin ifori. Limon, bazilik, qora smorodina va o'tloq notalari. Detoks-kokteyl ilhomidagi tetiklantiruvchi luxury parfyum.",
    category: "uniseks",
    price: 7500000,
    oldPrice: null,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/19055592/pexels-photo-19055592.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  // ===== XERJOFF =====
  {
    name: "Naxos",
    brand: "Xerjoff",
    description:
      "Xerjoff Naxos — Sitsiliya asali va tamakining afsonaviy uyg'unligi. Lavanda, dolchin, asal va tonka loviyasi. Italyan niche parfyumeriyasining eng sevimli durdonasi.",
    category: "erkaklar",
    price: 5400000,
    oldPrice: 6000000,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/29255492/pexels-photo-29255492.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    imageUrl2:
      "https://images.pexels.com/photos/29255493/pexels-photo-29255493.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  // ===== AMOUAGE =====
  {
    name: "Guidance",
    brand: "Amouage",
    description:
      "Amouage Guidance — Ummon qirollik parfyumeriyasining zamonaviy shedevri. Nok, za'faron, yasemin va amber yog'ochi notalari. Sharq va G'arbning mukammal uyg'unligi.",
    category: "ayollar",
    price: 5800000,
    oldPrice: null,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/18833913/pexels-photo-18833913.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  {
    name: "Reflection Man",
    brand: "Amouage",
    description:
      "Amouage Reflection Man — oq gullarning erkaklar uchun eng nafis talqini. Neroli, yasemin, iris va sandal notalari. Oq ko'ylak kabi toza va elegant — jentlmen tanlovi.",
    category: "erkaklar",
    price: 4900000,
    oldPrice: null,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/28664165/pexels-photo-28664165.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  // ===== PARFUMS DE MARLY (yangi) =====
  {
    name: "Althaïr",
    brand: "Parfums de Marly",
    description:
      "Parfums de Marly Althaïr — vanilning qirollik talqini. Bergamot, dolchin, vanil va musk notalari. 2023-yilning eng ko'p muhokama qilingan erkaklar atiri.",
    category: "erkaklar",
    price: 4300000,
    oldPrice: 4800000,
    volume: 125,
    imageUrl:
      "https://images.pexels.com/photos/7702669/pexels-photo-7702669.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  {
    name: "Valaya",
    brand: "Parfums de Marly",
    description:
      "Parfums de Marly Valaya — oq paxta va musk tozaligining ifori. Apelsin guli, oq atirgul va vanil notalari. Ayollar uchun qirollik darajasidagi nafislik.",
    category: "ayollar",
    price: 4200000,
    oldPrice: null,
    volume: 125,
    imageUrl:
      "https://images.pexels.com/photos/16266286/pexels-photo-16266286.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  // ===== MONTALE =====
  {
    name: "Arabians Tonka",
    brand: "Montale",
    description:
      "Montale Arabians Tonka — ud va tonkaning shirin-sharqona portlashi. Bergamot, ud, tonka va shakar notalari. Kuchli shleyf va komplimentlar kafolatlangan!",
    category: "uniseks",
    price: 1650000,
    oldPrice: 1900000,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/10308841/pexels-photo-10308841.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  // ===== INITIO =====
  {
    name: "Side Effect",
    brand: "Initio",
    description:
      "Initio Side Effect — giyohvand qiluvchi darajada jozibali ifor. Rom, tamaki, vanil va dolchin notalari. Kechki klub va maxsus oqshomlar uchun — ta'siri kafolatlangan.",
    category: "uniseks",
    price: 4600000,
    oldPrice: null,
    volume: 90,
    imageUrl:
      "https://images.pexels.com/photos/31847824/pexels-photo-31847824.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  // ===== BY KILIAN =====
  {
    name: "Angels' Share",
    brand: "By Kilian",
    description:
      "By Kilian Angels' Share — konyak va vanilning ilohiy uyg'unligi. Konyak, dolchin, tonka va sandal notalari. 'Farishtalar ulushi' — eng ko'p sotilgan niche gurman atir.",
    category: "uniseks",
    price: 4800000,
    oldPrice: 5300000,
    volume: 50,
    imageUrl:
      "https://images.pexels.com/photos/10688062/pexels-photo-10688062.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  // ===== TOM FORD (yangi) =====
  {
    name: "Tobacco Vanille",
    brand: "Tom Ford",
    description:
      "Tom Ford Tobacco Vanille — tamaki barglari va vanilning afsonaviy dueti. Tamaki, vanil, kakao va quritilgan mevalar. Sovuq oqshomlarning eng hashamatli hamrohi.",
    category: "uniseks",
    price: 4500000,
    oldPrice: null,
    volume: 50,
    imageUrl:
      "https://images.pexels.com/photos/34143829/pexels-photo-34143829.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  // ===== EX NIHILO =====
  {
    name: "Blue Talisman",
    brand: "Ex Nihilo",
    description:
      "Ex Nihilo Blue Talisman — ko'k tumor ifori. Nok, bergamot, zanjabil va musk notalari. Parijning eng zamonaviy niche uyi mahsuloti — omad keltiruvchi ifor.",
    category: "uniseks",
    price: 4700000,
    oldPrice: null,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/3640668/pexels-photo-3640668.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  // ===== GIARDINI DI TOSCANA =====
  {
    name: "Bianco Latte",
    brand: "Giardini di Toscana",
    description:
      "Giardini di Toscana Bianco Latte — sutli karamelning eng mazali ifori. Sut, asal, karamel va vanil notalari. TikTok'da viral bo'lgan — quchoqlagisi keladigan iliq hid.",
    category: "ayollar",
    price: 3400000,
    oldPrice: 3800000,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/33691658/pexels-photo-33691658.png?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  // ===== CREED (yangi) =====
  {
    name: "Absolu Aventus",
    brand: "Creed",
    description:
      "Creed Absolu Aventus — afsonaviy Aventus'ning yanada konsentrlangan versiyasi. Greypfrut, ananas, vetiver va sandal. Cheklangan miqdorda — chinakam kolleksioner atiri.",
    category: "erkaklar",
    price: 6500000,
    oldPrice: null,
    volume: 75,
    imageUrl:
      "https://images.pexels.com/photos/7487833/pexels-photo-7487833.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  // ===== PRADA =====
  {
    name: "Paradoxe",
    brand: "Prada",
    description:
      "Prada Paradoxe — zamonaviy ayolning paradoksal tabiati. Neroli, amber va musk notalari. Uchburchak flakonda — nafis, kuchli va esda qolarli.",
    category: "ayollar",
    price: 2100000,
    oldPrice: 2350000,
    volume: 90,
    imageUrl:
      "https://images.pexels.com/photos/27274883/pexels-photo-27274883.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  // ===== MARC JACOBS =====
  {
    name: "Daisy Love",
    brand: "Marc Jacobs",
    description:
      "Marc Jacobs Daisy Love — quyoshli sohil romantikasi. Bulutli olma, marvarid gullari va musk notalari. Yosh va quvnoq qizlarning eng sevimli atiri.",
    category: "ayollar",
    price: 1500000,
    oldPrice: null,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/8747310/pexels-photo-8747310.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  // ===== NARCISO RODRIGUEZ =====
  {
    name: "For Her",
    brand: "Narciso Rodriguez",
    description:
      "Narciso Rodriguez For Her — muskning eng nafis talqini. Atirgul, shaftoli va musk notalari. 20 yildan beri ayollar garderobining klassikasi.",
    category: "ayollar",
    price: 1900000,
    oldPrice: 2100000,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/21546967/pexels-photo-21546967.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  // ===== CAROLINA HERRERA (yangi) =====
  {
    name: "Good Girl Blush",
    brand: "Carolina Herrera",
    description:
      "Carolina Herrera Good Girl Blush — pushti tuflidagi yangi afsona. Peoniya, vanil va ilang-ilang notalari. Yumshoqroq, pudraliroq Good Girl — bahor fasli uchun ideal.",
    category: "ayollar",
    price: 1950000,
    oldPrice: null,
    volume: 80,
    imageUrl:
      "https://images.pexels.com/photos/27274784/pexels-photo-27274784.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  // ===== MAISON MARGIELA =====
  {
    name: "Replica Jazz Club",
    brand: "Maison Margiela",
    description:
      "Maison Margiela Replica Jazz Club — Bruklin jaz klubining atmosferasi. Rom, tamaki, vanil va pink murch notalari. Sigara tutuni va viski — erkaklar uchun eng atmosferali ifor.",
    category: "erkaklar",
    price: 1800000,
    oldPrice: 2000000,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/38159915/pexels-photo-38159915.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  // ===== MONTBLANC =====
  {
    name: "Explorer Platinum",
    brand: "Montblanc",
    description:
      "Montblanc Explorer Platinum — platina cho'qqilar ifori. Violet barglari, chaqmoqtosh akkordi va seder notalari. Sarguzashtchi erkaklar uchun hamyonbop premium.",
    category: "erkaklar",
    price: 1300000,
    oldPrice: null,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/29638622/pexels-photo-29638622.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  // ===== CALVIN KLEIN =====
  {
    name: "Eternity",
    brand: "Calvin Klein",
    description:
      "Calvin Klein Eternity — abadiy sevgi ifori. Lavanda, mandarin, sandal va amber notalari. 35 yildan beri sevilgan klassika — sodda va benuqson.",
    category: "erkaklar",
    price: 1100000,
    oldPrice: 1250000,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/30829278/pexels-photo-30829278.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  {
    name: "Obsession",
    brand: "Calvin Klein",
    description:
      "Calvin Klein Obsession — ehtirosning klassik ifori. Vanil, amber, ziravorlar va sitrus notalari. 80-yillarning afsonasi — bugun ham dolzarb.",
    category: "ayollar",
    price: 1050000,
    oldPrice: null,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/36484298/pexels-photo-36484298.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  // ===== DAVIDOFF =====
  {
    name: "Cool Water",
    brand: "Davidoff",
    description:
      "Davidoff Cool Water — dengiz tozaligining timsoli. Yalpiz, lavanda, dengiz akkordi va musk. 35 yildan beri eng ko'p sotilgan erkaklar atirlaridan biri.",
    category: "erkaklar",
    price: 950000,
    oldPrice: 1100000,
    volume: 125,
    imageUrl:
      "https://images.pexels.com/photos/17461553/pexels-photo-17461553.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  // ===== GUY LAROCHE =====
  {
    name: "Drakkar Noir",
    brand: "Guy Laroche",
    description:
      "Guy Laroche Drakkar Noir — qora vikinglar kemasi ifori. Lavanda, rozmarin, teri va mox notalari. 80-yillarning jasur klassikasi — kuchli erkaklar tanlovi.",
    category: "erkaklar",
    price: 900000,
    oldPrice: null,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/3434530/pexels-photo-3434530.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  // ===== ELIZABETH ARDEN =====
  {
    name: "Red Door",
    brand: "Elizabeth Arden",
    description:
      "Elizabeth Arden Red Door — qizil eshik ortidagi hashamat. Atirgul, orxideya, asal va sandal notalari. Amerika go'zallik salonlarining afsonaviy ifori.",
    category: "ayollar",
    price: 1000000,
    oldPrice: 1150000,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/7359594/pexels-photo-7359594.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  // ===== NINA RICCI =====
  {
    name: "L'Air du Temps",
    brand: "Nina Ricci",
    description:
      "Nina Ricci L'Air du Temps — zamon nafasi. Gvozdika, gardeniya, atirgul va iris notalari. 1948-yildan beri nafislik ramzi — kaptarli flakon san'at asari.",
    category: "ayollar",
    price: 1200000,
    oldPrice: null,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/264819/pexels-photo-264819.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  // ===== ELIZABETH TAYLOR =====
  {
    name: "White Diamonds",
    brand: "Elizabeth Taylor",
    description:
      "Elizabeth Taylor White Diamonds — oq olmoslar jilosi. Aldegidlar, lilia, tuberoza va amber notalari. Gollivud afsonasining o'lmas merosi.",
    category: "ayollar",
    price: 950000,
    oldPrice: null,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/10629797/pexels-photo-10629797.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  // ===== MUGLER (yangi) =====
  {
    name: "Angel",
    brand: "Mugler",
    description:
      "Mugler Angel — gurman atirlar otasi. Shokolad, karamel, patchouli va vanil notalari. Yulduz shaklidagi flakonda — 30 yildan beri taqlid qilinadigan afsona.",
    category: "ayollar",
    price: 1850000,
    oldPrice: 2050000,
    volume: 50,
    imageUrl:
      "https://images.pexels.com/photos/13800881/pexels-photo-13800881.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  // ===== OSCAR DE LA RENTA =====
  {
    name: "Oscar",
    brand: "Oscar de la Renta",
    description:
      "Oscar de la Renta Oscar — oq gullarning klassik simfoniyasi. Tuberoza, yasemin, lavanda va sandal notalari. Moda olamining buyuk ustasi yaratgan nafislik.",
    category: "ayollar",
    price: 980000,
    oldPrice: null,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/7598173/pexels-photo-7598173.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },

  // ============================================================
  // ========== LATTAFA — ARAB ATIRLARI KOLLEKSIYASI (30 ta) =====
  // ============================================================
  {
    name: "Asad",
    brand: "Lattafa",
    description:
      "Lattafa Asad — 'Sher' degan ma'noni anglatadi. Qora murch, tamaki, vanil va qarag'ay notalari. Dior Sauvage Elixir uslubidagi kuchli va jasur ifor — Lattafaning eng mashhur erkaklar atiri.",
    category: "erkaklar",
    origin: "arab",
    price: 320000,
    oldPrice: 380000,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/7850600/pexels-photo-7850600.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: true,
    inStock: true,
  },
  {
    name: "Asad Bourbon",
    brand: "Lattafa",
    description:
      "Lattafa Asad Bourbon — Asadning yanada issiq va shirin versiyasi. Burbon vanili, olma, dolchin va amber notalari. Sovuq kunlar uchun mukammal — komplimentlar mashinasi.",
    category: "erkaklar",
    origin: "arab",
    price: 340000,
    oldPrice: null,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/39179564/pexels-photo-39179564.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  {
    name: "Asad Zanzibar",
    brand: "Lattafa",
    description:
      "Lattafa Asad Zanzibar — Asad oilasining eksklyuziv tropik talqini. Mandarin, zanjabil, vetiver va yog'ochli notalar. Yozgi oqshomlar uchun sarguzashtli ifor.",
    category: "erkaklar",
    origin: "arab",
    price: 350000,
    oldPrice: null,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/30981935/pexels-photo-30981935.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  {
    name: "Khamrah",
    brand: "Lattafa",
    description:
      "Lattafa Khamrah — dolchin, xurmo, vanil va tonka loviyasining shirin-ziravorli afsonasi. Kilian Angels' Share uslubida. Sovuq kunlarning eng sevimli gurman ifori — uniseks.",
    category: "uniseks",
    origin: "arab",
    price: 350000,
    oldPrice: 420000,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/38721551/pexels-photo-38721551.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: true,
    inStock: true,
  },
  {
    name: "Khamrah Qahwa",
    brand: "Lattafa",
    description:
      "Lattafa Khamrah Qahwa — arab qahvasining parfyumdagi aksi. Qahva, kardamon, zafaron va shirin vanil notalari. Qahva muxlislari uchun aynan o'sha ifor!",
    category: "uniseks",
    origin: "arab",
    price: 370000,
    oldPrice: null,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/11711832/pexels-photo-11711832.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  {
    name: "Khamrah Dukhan",
    brand: "Lattafa",
    description:
      "Lattafa Khamrah Dukhan — 'Tutun' ma'nosidagi eng yangi Khamrah. Tutunli ud, tamaki, dolchin va qora vanil. Sirli va chuqur — kechki tadbirlar yulduzi.",
    category: "uniseks",
    origin: "arab",
    price: 380000,
    oldPrice: null,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/31022286/pexels-photo-31022286.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  {
    name: "Yara",
    brand: "Lattafa",
    description:
      "Lattafa Yara — qizlar orasida viral bo'lgan afsona. Orxideya, heliotrop, tropik mevalar va vanil. Shirin pudrali ifor — TikTok'ning eng sevimli arab atiri.",
    category: "ayollar",
    origin: "arab",
    price: 320000,
    oldPrice: 370000,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/31612020/pexels-photo-31612020.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: true,
    inStock: true,
  },
  {
    name: "Yara Tous",
    brand: "Lattafa",
    description:
      "Lattafa Yara Tous — Yaraning pushti-mevali opasi. Qulupnay, malina, atirgul va musk notalari. Yanada yosh va o'ynoqi — bahorgi kayfiyat atiri.",
    category: "ayollar",
    origin: "arab",
    price: 330000,
    oldPrice: null,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/36437999/pexels-photo-36437999.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  {
    name: "Yara Moi",
    brand: "Lattafa",
    description:
      "Lattafa Yara Moi — Yara oilasining eng nafis a'zosi. Shaftoli, peoniya, vanil va sandal notalari. Yumshoq va ayollik to'la ifor — romantik uchrashuvlar uchun.",
    category: "ayollar",
    origin: "arab",
    price: 340000,
    oldPrice: null,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/32645088/pexels-photo-32645088.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  {
    name: "Yara Elixir",
    brand: "Lattafa",
    description:
      "Lattafa Yara Elixir — Yaraning eng konsentrlangan va boy versiyasi. Mango, karamel, orxideya va amber. Kuchliroq shleyf, uzoqroq barqarorlik — Yara muxlislari orzusi.",
    category: "ayollar",
    origin: "arab",
    price: 360000,
    oldPrice: 400000,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/36834060/pexels-photo-36834060.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  {
    name: "Fakhar Black",
    brand: "Lattafa",
    description:
      "Lattafa Fakhar Black — 'G'urur' ma'nosidagi erkaklar klassikasi. Lavanda, yashil olma, darchin va ambergris. YSL Y EDP uslubida — zamonaviy va sportiv.",
    category: "erkaklar",
    origin: "arab",
    price: 300000,
    oldPrice: 350000,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/32645070/pexels-photo-32645070.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  {
    name: "Fakhar Rose",
    brand: "Lattafa",
    description:
      "Lattafa Fakhar Rose — ayollar uchun atirgulli g'urur. Atirgul, litchi, peoniya va oq musk notalari. Parfums de Marly Delina uslubidagi nafislik — hamyonbop narxda.",
    category: "ayollar",
    origin: "arab",
    price: 310000,
    oldPrice: null,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/8747310/pexels-photo-8747310.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  {
    name: "Bade'e Al Oud Oud for Glory",
    brand: "Lattafa",
    description:
      "Lattafa Bade'e Al Oud Oud for Glory — shuhrat uchun ud. Za'faron, lavanda, ud va amber yog'ochi. Initio Oud for Greatness uslubida — kuchli sharqona shleyf.",
    category: "uniseks",
    origin: "arab",
    price: 380000,
    oldPrice: 430000,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/19864701/pexels-photo-19864701.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: true,
    inStock: true,
  },
  {
    name: "Bade'e Al Oud Honor & Glory",
    brand: "Lattafa",
    description:
      "Lattafa Bade'e Al Oud Honor & Glory — shon-sharaf ifori. Ananas, gardeniya, vanil va qaymoqli notalar. Shirin-tropik sharqona uyg'unlik — e'tibor markazida bo'lasiz.",
    category: "uniseks",
    origin: "arab",
    price: 390000,
    oldPrice: null,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/36389333/pexels-photo-36389333.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  {
    name: "Bade'e Al Oud Sublime",
    brand: "Lattafa",
    description:
      "Lattafa Bade'e Al Oud Sublime — yuksaklik ifori. Malina, za'faron, ud va amber notalari. MFK Baccarat Rouge 540 Extrait uslubida — hashamat hamyonbop narxda.",
    category: "uniseks",
    origin: "arab",
    price: 390000,
    oldPrice: 440000,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/36389331/pexels-photo-36389331.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  {
    name: "Ameer Al Oudh Intense Oud",
    brand: "Lattafa",
    description:
      "Lattafa Ameer Al Oudh Intense Oud — 'Ud amiri'. Qoramtir ud, shirin vanil, ziravorlar va yog'och tutuni. Haqiqiy arab udi muxlislari uchun — juda kuchli va chidamli.",
    category: "uniseks",
    origin: "arab",
    price: 330000,
    oldPrice: null,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/38721545/pexels-photo-38721545.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  {
    name: "Qaed Al Fursan",
    brand: "Lattafa",
    description:
      "Lattafa Qaed Al Fursan — 'Chavandozlar sardori'. Ananas, qora smorodina, ud va musk. Creed Aventus uslubidagi eng mashhur hamyonbop alternativa!",
    category: "erkaklar",
    origin: "arab",
    price: 290000,
    oldPrice: 340000,
    volume: 90,
    imageUrl:
      "https://images.pexels.com/photos/230778/pexels-photo-230778.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  {
    name: "Najdia",
    brand: "Lattafa",
    description:
      "Lattafa Najdia — Najd cho'llarining erkin shamoli. Bergamot, lavanda, amber va mushk notalari. Bleu de Chanel ruhidagi arab talqini — kundalik klassika.",
    category: "erkaklar",
    origin: "arab",
    price: 270000,
    oldPrice: null,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/3059609/pexels-photo-3059609.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  {
    name: "Ramz Silver",
    brand: "Lattafa",
    description:
      "Lattafa Ramz Silver — kumush ramz. Lavanda, bergamot, iris va yog'ochli notalar. Toza va zamonaviy — ofis va kundalik hayot uchun ishonchli tanlov.",
    category: "erkaklar",
    origin: "arab",
    price: 260000,
    oldPrice: null,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/16089870/pexels-photo-16089870.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  {
    name: "Nebras",
    brand: "Lattafa",
    description:
      "Lattafa Nebras — 'Mash'al' ma'nosidagi yorqin ifor. Ananas, bergamot, vanil va musk notalari. Quvnoq va yoshlik ruhidagi atir — har kuni foydalanish uchun.",
    category: "uniseks",
    origin: "arab",
    price: 300000,
    oldPrice: null,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/15007555/pexels-photo-15007555.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  {
    name: "Eclaire",
    brand: "Lattafa",
    description:
      "Lattafa Eclaire — shirinlik sevuvchilar orzusi. Sutli karamel, asal, vanil va musk notalari. Ekler pirojnoesi kabi mazali ifor — qizlarning yangi favoriti.",
    category: "ayollar",
    origin: "arab",
    price: 330000,
    oldPrice: 370000,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/33691658/pexels-photo-33691658.png?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  {
    name: "Teriaq",
    brand: "Lattafa",
    description:
      "Lattafa Teriaq — 'Malham' ma'nosidagi davolovchi ifor. Asal, kakao, atirgul va ud notalari. Kilian Angels' Share ruhidagi issiq gurman — sovuq oqshomlar malhami.",
    category: "uniseks",
    origin: "arab",
    price: 360000,
    oldPrice: null,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/5790458/pexels-photo-5790458.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  {
    name: "Teriaq Intense",
    brand: "Lattafa",
    description:
      "Lattafa Teriaq Intense — Teriaqning kuchaytirilgan versiyasi. Konyak, asal, dolchin va qora vanil. Chuqurroq, boyroq, uzoqroq — intense muxlislari uchun.",
    category: "uniseks",
    origin: "arab",
    price: 390000,
    oldPrice: null,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/38893412/pexels-photo-38893412.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  {
    name: "Liam Grey",
    brand: "Lattafa",
    description:
      "Lattafa Liam Grey — kulrang elegantlik. Bergamot, lavanda, geranium va mushk notalari. Zamonaviy minimalizm — har qanday libos va vaziyatga mos.",
    category: "erkaklar",
    origin: "arab",
    price: 280000,
    oldPrice: 320000,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/8747028/pexels-photo-8747028.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  {
    name: "Vintage Radio",
    brand: "Lattafa",
    description:
      "Lattafa Vintage Radio — nostalji to'lqinidagi ifor. Kola akkordi, dolchin, vanil va yog'ochli notalar. Radio shaklidagi flakon — eng original sovg'a varianti!",
    category: "uniseks",
    origin: "arab",
    price: 350000,
    oldPrice: null,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/7598173/pexels-photo-7598173.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  {
    name: "Maahir Legacy",
    brand: "Lattafa",
    description:
      "Lattafa Maahir Legacy — 'Mohir' ustaning merosi. Za'faron, atirgul, ud va teri notalari. Boy sharqona kompozitsiya — rasmiy tadbirlar uchun saloburli tanlov.",
    category: "erkaklar",
    origin: "arab",
    price: 340000,
    oldPrice: null,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/36779953/pexels-photo-36779953.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  {
    name: "Oud Mood",
    brand: "Lattafa",
    description:
      "Lattafa Oud Mood — ud kayfiyati. Ud, atirgul, amber va za'faron notalari. Lattafaning klassik sharqona durdonasi — ayollar va erkaklar birdek sevadi.",
    category: "uniseks",
    origin: "arab",
    price: 310000,
    oldPrice: 360000,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/38721543/pexels-photo-38721543.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: true,
    inStock: true,
  },
  {
    name: "Ana Abiyedh Rouge",
    brand: "Lattafa",
    description:
      "Lattafa Ana Abiyedh Rouge — oq flakondagi qizil ehtiros. Za'faron, malina, amber va musk. Baccarat Rouge 540 uslubidagi eng hamyonbop variant — top seller!",
    category: "uniseks",
    origin: "arab",
    price: 280000,
    oldPrice: 330000,
    volume: 60,
    imageUrl:
      "https://images.pexels.com/photos/16266295/pexels-photo-16266295.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  {
    name: "Musamam White Intense",
    brand: "Lattafa",
    description:
      "Lattafa Musamam White Intense — oq intensivlik. Sitrus, oq gullar, vanil va sandal. Toza, yorug' va barqaror — yozgi kunlarning eng yoqimli hamrohi.",
    category: "uniseks",
    origin: "arab",
    price: 320000,
    oldPrice: null,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/7364096/pexels-photo-7364096.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },
  {
    name: "The Kingdom",
    brand: "Lattafa",
    description:
      "Lattafa The Kingdom — qirollik saltanati ifori. Za'faron, atirgul, amber va qimmatbaho yog'ochlar. Lattafaning premium liniyasi — saroylarga munosib hashamat.",
    category: "uniseks",
    origin: "arab",
    price: 400000,
    oldPrice: 450000,
    volume: 100,
    imageUrl:
      "https://images.pexels.com/photos/13767420/pexels-photo-13767420.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    inStock: true,
  },

  // ============================================================
  // ========== KOSMETIKA BO'LIMI (30 ta) ==========
  // ============================================================
  // ===== YUZ PARVARISHI =====
  { name: "Hyaluronic Acid 2% + B5 Serum", brand: "The Ordinary", description: "The Ordinary gialuron kislotali serum — teriga chuqur namlik beradi. Barcha teri turlari uchun. 30 ml. Ertalab va kechqurun toza teriga suriladi.", category: "yuz-parvarishi", productType: "kosmetika", origin: "fransiya", price: 220000, oldPrice: 260000, volume: 30, imageUrl: "https://images.pexels.com/photos/8101520/pexels-photo-8101520.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", featured: true, inStock: true },
  { name: "Niacinamide 10% + Zinc Serum", brand: "The Ordinary", description: "The Ordinary niatsinamid serumi — g'ovaklarni toraytiradi, yog'li yaltirashni kamaytiradi va teri rangini tekislaydi. Muammoli teri uchun №1 tanlov.", category: "yuz-parvarishi", productType: "kosmetika", origin: "fransiya", price: 210000, oldPrice: null, volume: 30, imageUrl: "https://images.pexels.com/photos/7670680/pexels-photo-7670680.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", featured: false, inStock: true },
  { name: "Moisturising Lotion", brand: "CeraVe", description: "CeraVe namlantiruvchi losyon — seramidlar va gialuron kislota bilan. Quruq va sezgir teri uchun dermatologlar tavsiyasi. 236 ml.", category: "yuz-parvarishi", productType: "kosmetika", origin: "fransiya", price: 280000, oldPrice: 320000, volume: 236, imageUrl: "https://images.pexels.com/photos/7691162/pexels-photo-7691162.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", featured: true, inStock: true },
  { name: "Foaming Cleanser", brand: "CeraVe", description: "CeraVe ko'pikli yuz yuvish geli — normal va yog'li teri uchun. Terini quritmasdan chuqur tozalaydi. Seramidlar bilan himoya qatlamini saqlaydi.", category: "yuz-parvarishi", productType: "kosmetika", origin: "fransiya", price: 260000, oldPrice: null, volume: 236, imageUrl: "https://images.pexels.com/photos/7691166/pexels-photo-7691166.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", featured: false, inStock: true },
  { name: "Effaclar Duo+ Krem", brand: "La Roche-Posay", description: "La Roche-Posay Effaclar Duo+ — husnbuzarga qarshi krem. Yallig'lanishni kamaytiradi, dog'larni oldini oladi. Muammoli teri uchun Yevropa №1 dorixona brendi.", category: "yuz-parvarishi", productType: "kosmetika", origin: "fransiya", price: 420000, oldPrice: 470000, volume: 40, imageUrl: "https://images.pexels.com/photos/7670737/pexels-photo-7670737.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", featured: false, inStock: true },
  { name: "Anthelios SPF 50+ Quyosh Kremi", brand: "La Roche-Posay", description: "La Roche-Posay Anthelios — yuqori himoyali quyosh kremi. Yengil tekstura, yog'li iz qoldirmaydi. Har kuni foydalanish uchun — teri qarishining oldini oladi.", category: "yuz-parvarishi", productType: "kosmetika", origin: "fransiya", price: 450000, oldPrice: null, volume: 50, imageUrl: "https://images.pexels.com/photos/4841286/pexels-photo-4841286.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", featured: false, inStock: true },
  { name: "Advanced Snail 96 Mucin Essence", brand: "COSRX", description: "COSRX shilliqqurt essensiyasi — Koreya kosmetikasining afsonasi. Terini tiklaydi, namlaydi va yoshartiradi. 96% snail mucin — chandiq va dog'larga qarshi.", category: "yuz-parvarishi", productType: "kosmetika", origin: "fransiya", price: 350000, oldPrice: 390000, volume: 100, imageUrl: "https://images.pexels.com/photos/8100691/pexels-photo-8100691.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", featured: true, inStock: true },
  { name: "Low pH Good Morning Gel", brand: "COSRX", description: "COSRX ertalabki yuvish geli — past pH bilan terining tabiiy muvozanatini saqlaydi. Choy daraxti moyi bilan. Koreya parvarishining birinchi qadami.", category: "yuz-parvarishi", productType: "kosmetika", origin: "fransiya", price: 240000, oldPrice: null, volume: 150, imageUrl: "https://images.pexels.com/photos/7691160/pexels-photo-7691160.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", featured: false, inStock: true },
  { name: "Revitalift Filler Krem", brand: "L'Oréal", description: "L'Oréal Revitalift Filler — gialuron kislotali yoshartiruvchi krem. Ajinlarni to'ldiradi, terini taranglashtiradi. 40+ yosh uchun kunduzgi parvarish.", category: "yuz-parvarishi", productType: "kosmetika", origin: "fransiya", price: 380000, oldPrice: 430000, volume: 50, imageUrl: "https://images.pexels.com/photos/7691159/pexels-photo-7691159.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", featured: false, inStock: true },
  { name: "Aqualia Thermal Krem", brand: "Vichy", description: "Vichy Aqualia Thermal — 48 soatlik namlik kremi. Vulqon suvi va gialuron kislota bilan. Suvsizlangan teri uchun tetiklantiruvchi parvarish.", category: "yuz-parvarishi", productType: "kosmetika", origin: "fransiya", price: 410000, oldPrice: null, volume: 50, imageUrl: "https://images.pexels.com/photos/14473449/pexels-photo-14473449.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", featured: false, inStock: true },
  // ===== MAKIYAJ =====
  { name: "Rouge Pur Couture Pomada", brand: "Yves Saint Laurent", description: "YSL Rouge Pur Couture — afsonaviy qizil pomada. Boy pigment, atlas tekstura, 8 soatlik barqarorlik. Oltin korpusda — hashamatning o'zi.", category: "makiyaj", productType: "kosmetika", origin: "fransiya", price: 650000, oldPrice: 720000, volume: 4, imageUrl: "https://images.pexels.com/photos/14716056/pexels-photo-14716056.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", featured: true, inStock: true },
  { name: "Sky High Tush", brand: "Maybelline", description: "Maybelline Sky High — kipriklarni cheksiz uzaytiruvchi tush. Bambuk ekstrakti bilan, to'kilmaydi va yoyilmaydi. TikTok'da viral bo'lgan №1 tush.", category: "makiyaj", productType: "kosmetika", origin: "fransiya", price: 180000, oldPrice: 210000, volume: 7, imageUrl: "https://images.pexels.com/photos/2586073/pexels-photo-2586073.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", featured: true, inStock: true },
  { name: "Fit Me Tonal Krem", brand: "Maybelline", description: "Maybelline Fit Me — teringizga moslashuvchi tonal krem. Matoviy tugallanish, g'ovaklarni yashiradi. 40 dan ortiq tus — har bir teri rangiga mos.", category: "makiyaj", productType: "kosmetika", origin: "fransiya", price: 170000, oldPrice: null, volume: 30, imageUrl: "https://images.pexels.com/photos/4938515/pexels-photo-4938515.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", featured: false, inStock: true },
  { name: "Infaillible 32H Tonal Krem", brand: "L'Oréal", description: "L'Oréal Infaillible — 32 soatlik mustahkam tonal krem. Suv va terga chidamli, to'liq qoplama. Uzun kun va maxsus tadbirlar uchun.", category: "makiyaj", productType: "kosmetika", origin: "fransiya", price: 260000, oldPrice: 300000, volume: 30, imageUrl: "https://images.pexels.com/photos/4938502/pexels-photo-4938502.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", featured: false, inStock: true },
  { name: "Rouge Coco Flash Pomada", brand: "Chanel", description: "Chanel Rouge Coco Flash — nam yaltiroq effektli pomada. Bir surtishda to'yingan rang va namlik. Parij shikidagi har kungi hashamat.", category: "makiyaj", productType: "kosmetika", origin: "fransiya", price: 750000, oldPrice: null, volume: 3, imageUrl: "https://images.pexels.com/photos/3060257/pexels-photo-3060257.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", featured: false, inStock: true },
  { name: "Dior Addict Lip Glow", brand: "Dior", description: "Dior Addict Lip Glow — lablar rangini jonlantiruvchi balzam. Har bir labda o'ziga xos pushti tus hosil qiladi. Namlik + rang + parvarish bitta mahsulotda.", category: "makiyaj", productType: "kosmetika", origin: "fransiya", price: 680000, oldPrice: 750000, volume: 3, imageUrl: "https://images.pexels.com/photos/14716105/pexels-photo-14716105.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", featured: true, inStock: true },
  { name: "Soft Matte Lip Cream", brand: "NYX", description: "NYX Soft Matte Lip Cream — yumshoq matoviy suyuq pomada. Yengil krem tekstura, quritmaydi. 30+ trendy tuslar — hamyonbop professional sifat.", category: "makiyaj", productType: "kosmetika", origin: "fransiya", price: 150000, oldPrice: null, volume: 8, imageUrl: "https://images.pexels.com/photos/12592454/pexels-photo-12592454.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", featured: false, inStock: true },
  { name: "Naked Eyeshadow Palette", brand: "Urban Decay", description: "Urban Decay Naked — afsonaviy ko'z soyalari palitrasi. 12 ta universal nude tus — matoviy va shimmer. Kunduzgi va kechki makiyaj uchun bitta palitra.", category: "makiyaj", productType: "kosmetika", origin: "fransiya", price: 850000, oldPrice: 950000, volume: 15, imageUrl: "https://images.pexels.com/photos/5731785/pexels-photo-5731785.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", featured: false, inStock: true },
  { name: "Professional Makiyaj Cho'tkalari To'plami", brand: "Real Techniques", description: "Real Techniques cho'tkalar to'plami — 5 ta professional cho'tka. Tonal, pudra, soya va qosh uchun. Yumshoq sintetik tuklar — hayvonlarga zarar yetkazilmagan.", category: "makiyaj", productType: "kosmetika", origin: "fransiya", price: 320000, oldPrice: null, volume: 5, imageUrl: "https://images.pexels.com/photos/1115128/pexels-photo-1115128.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", featured: false, inStock: true },
  { name: "Lash Sensational Tush", brand: "Maybelline", description: "Maybelline Lash Sensational — yelpig'ich effektli tush. Maxsus cho'tka har bir kiprikka yetib boradi. Hajm + uzunlik + egilish bitta tushda.", category: "makiyaj", productType: "kosmetika", origin: "fransiya", price: 160000, oldPrice: 185000, volume: 9, imageUrl: "https://images.pexels.com/photos/2535913/pexels-photo-2535913.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", featured: false, inStock: true },
  { name: "Qizil Lak To'plami", brand: "OPI", description: "OPI professional lak — salon sifatidagi qizil tuslar. Uzoq turadi, yorqin yaltiraydi. Dunyodagi eng mashhur professional lak brendi.", category: "makiyaj", productType: "kosmetika", origin: "fransiya", price: 190000, oldPrice: null, volume: 15, imageUrl: "https://images.pexels.com/photos/12684691/pexels-photo-12684691.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", featured: false, inStock: true },
  { name: "Nude Lak Dueti", brand: "OPI", description: "OPI nude lak dueti — tabiiy va nafis tuslar juftligi. Ofis va kundalik hayot uchun mukammal. Professional qoplama 7 kungacha saqlanadi.", category: "makiyaj", productType: "kosmetika", origin: "fransiya", price: 280000, oldPrice: 320000, volume: 30, imageUrl: "https://images.pexels.com/photos/11236415/pexels-photo-11236415.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", featured: false, inStock: true },
  // ===== TANA PARVARISHI =====
  { name: "Namlantiruvchi Tana Losyoni", brand: "Nivea", description: "Nivea tana losyoni — 48 soatlik chuqur namlik. Jojoba moyi va vitamin E bilan. Barcha teri turlari uchun klassik nemis sifati.", category: "tana", productType: "kosmetika", origin: "fransiya", price: 120000, oldPrice: 140000, volume: 400, imageUrl: "https://images.pexels.com/photos/7262467/pexels-photo-7262467.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", featured: false, inStock: true },
  { name: "Qahvali Tana Skrabi", brand: "Organic Shop", description: "Organic Shop qahva skrabi — tabiiy qahva donalari bilan. O'lik hujayralarni tozalaydi, terini silliqlaydi va tselulitga qarshi kurashadi.", category: "tana", productType: "kosmetika", origin: "fransiya", price: 95000, oldPrice: null, volume: 250, imageUrl: "https://images.pexels.com/photos/31865248/pexels-photo-31865248.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", featured: false, inStock: true },
  { name: "Shea Moyi Tana Kremi", brand: "The Body Shop", description: "The Body Shop shea moyli krem — juda quruq teri uchun intensiv oziqlantirish. Gana sheasi bilan 96 soatlik namlik. Qish faslining qutqaruvchisi.", category: "tana", productType: "kosmetika", origin: "fransiya", price: 260000, oldPrice: 300000, volume: 200, imageUrl: "https://images.pexels.com/photos/3872898/pexels-photo-3872898.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", featured: false, inStock: true },
  { name: "Arab Musk Tana Kremi", brand: "Lattafa", description: "Lattafa musk tana kremi — atir bilan juftlikda ishlatish uchun. Oq musk ifori terida kun bo'yi saqlanadi. Atiringiz barqarorligini 2x oshiradi!", category: "tana", productType: "kosmetika", origin: "arab", price: 150000, oldPrice: 180000, volume: 250, imageUrl: "https://images.pexels.com/photos/8015781/pexels-photo-8015781.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", featured: true, inStock: true },
  { name: "Parfyumlangan Dush Geli", brand: "Nivea", description: "Nivea parfyumli dush geli — yumshoq tozalash va yoqimli ifor. Teri pH balansini saqlaydi. Har kungi dush uchun arzon va sifatli tanlov.", category: "tana", productType: "kosmetika", origin: "fransiya", price: 85000, oldPrice: null, volume: 500, imageUrl: "https://images.pexels.com/photos/7262993/pexels-photo-7262993.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", featured: false, inStock: true },
  // ===== SOCH PARVARISHI =====
  { name: "Elseve Soch Shampuni", brand: "L'Oréal", description: "L'Oréal Elseve — shikastlangan soch uchun tiklovchi shampun. Keratin va argan moyi bilan. Sochni mustahkamlaydi va yaltiratadi.", category: "soch", productType: "kosmetika", origin: "fransiya", price: 110000, oldPrice: 130000, volume: 400, imageUrl: "https://images.pexels.com/photos/13516802/pexels-photo-13516802.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", featured: false, inStock: true },
  { name: "Argan Moyi Soch Maskasi", brand: "Garnier", description: "Garnier argan maskasi — quruq soch uchun 3-in-1 parvarish. Maska, balzam yoki leave-in sifatida ishlatiladi. Marokash argan moyi bilan.", category: "soch", productType: "kosmetika", origin: "fransiya", price: 130000, oldPrice: null, volume: 300, imageUrl: "https://images.pexels.com/photos/10574130/pexels-photo-10574130.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", featured: false, inStock: true },
  { name: "Soch Uchun Atir Sprey", brand: "Lattafa", description: "Lattafa soch atiri — sochingizga maxsus yengil parfyum sprey. Yara ifori asosida. Soch tolasiga zarar yetkazmaydi, kun bo'yi xushbo'ylik beradi.", category: "soch", productType: "kosmetika", origin: "arab", price: 170000, oldPrice: 200000, volume: 50, imageUrl: "https://images.pexels.com/photos/4154194/pexels-photo-4154194.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", featured: true, inStock: true },
];

let seeded = false;

export async function ensureSeeded() {
  if (seeded) return;
  // Mavjud mahsulotlarga tegmasdan, seed'da bor-u bazada yo'q bo'lganlarni qo'shamiz
  const existing = await db
    .select({ name: products.name, brand: products.brand })
    .from(products);
  const existingKeys = new Set(
    existing.map((p) => `${p.brand.toLowerCase()}|${p.name.toLowerCase()}`)
  );
  const missing = SEED_PRODUCTS.filter(
    (p) =>
      !existingKeys.has(`${p.brand.toLowerCase()}|${p.name.toLowerCase()}`)
  );
  if (missing.length > 0) {
    await db.insert(products).values(
      missing.map((p) => ({
        ...p,
        origin: p.origin ?? "fransiya",
        productType: p.productType ?? "atir",
      }))
    );
  }
  seeded = true;
}

export async function getProducts(
  category?: string,
  origin?: string,
  query?: string,
  productType: string = "atir"
) {
  await ensureSeeded();
  const conditions = [eq(products.productType, productType)];
  if (category && category !== "barchasi") {
    conditions.push(eq(products.category, category));
  }
  if (origin && origin !== "barchasi") {
    conditions.push(eq(products.origin, origin));
  }
  if (query && query.trim().length >= 2) {
    const pattern = `%${query.trim()}%`;
    const searchCond = or(
      ilike(products.name, pattern),
      ilike(products.brand, pattern),
      ilike(products.description, pattern)
    );
    if (searchCond) conditions.push(searchCond);
  }
  if (conditions.length > 0) {
    return db
      .select()
      .from(products)
      .where(and(...conditions))
      .orderBy(asc(products.id));
  }
  return db.select().from(products).orderBy(asc(products.id));
}

export async function getFeaturedProducts() {
  await ensureSeeded();
  return db
    .select()
    .from(products)
    .where(and(eq(products.featured, true), eq(products.productType, "atir")))
    .orderBy(asc(products.id))
    .limit(6);
}

export async function getProduct(id: number) {
  await ensureSeeded();
  const rows = await db.select().from(products).where(eq(products.id, id));
  return rows[0] ?? null;
}
