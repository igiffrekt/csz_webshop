import type { StrapiApp } from '@strapi/strapi/admin';
import hu from './translations/hu.json';

// Field label mappings for Hungarian
const fieldLabels: Record<string, string> = {
  // Product fields
  name: 'Név',
  slug: 'URL cím (webcím)',
  sku: 'Cikkszám',
  description: 'Leírás',
  shortDescription: 'Rövid leírás',
  basePrice: 'Alapár (Ft)',
  compareAtPrice: 'Eredeti ár (Ft)',
  stock: 'Készlet (db)',
  weight: 'Súly (kg)',
  isFeatured: 'Kiemelt termék',
  isOnSale: 'Akciós',
  images: 'Képek',
  documents: 'Dokumentumok',
  specifications: 'Műszaki adatok',
  certifications: 'Tanúsítványok',
  categories: 'Kategóriák',
  variants: 'Változatok',
  productCount: 'Termékek száma',

  // Category fields
  image: 'Kép',
  parent: 'Szülő kategória',
  children: 'Alkategóriák',
  products: 'Termékek',

  // Page fields
  title: 'Cím',
  content: 'Tartalom',
  seo: 'SEO beállítások',

  // FAQ fields
  question: 'Kérdés',
  answer: 'Válasz',
  order: 'Sorrend',
  category: 'Kategória',

  // Coupon fields
  code: 'Kupon kód',
  discountType: 'Kedvezmény típusa',
  discountValue: 'Kedvezmény értéke',
  minimumOrderAmount: 'Min. rendelési összeg (Ft)',
  maximumDiscount: 'Max. kedvezmény (Ft)',
  usageLimit: 'Felhasználási limit',
  usedCount: 'Használva (db)',
  validFrom: 'Érvényesség kezdete',
  validUntil: 'Érvényesség vége',
  isActive: 'Aktív',

  // Order fields
  orderNumber: 'Rendelésszám',
  status: 'Státusz',
  user: 'Felhasználó',
  subtotal: 'Részösszeg (Ft)',
  discount: 'Kedvezmény (Ft)',
  shipping: 'Szállítási díj (Ft)',
  vatAmount: 'ÁFA (Ft)',
  total: 'Végösszeg (Ft)',
  shippingAddress: 'Szállítási cím',
  billingAddress: 'Számlázási cím',
  lineItems: 'Tételek',
  couponCode: 'Kupon kód',
  couponDiscount: 'Kupon kedvezmény (Ft)',
  poReference: 'Vevői rendelésszám',
  paymentMethod: 'Fizetési mód',
  paymentId: 'Tranzakció azonosító',
  stripeSessionId: 'Stripe azonosító',
  paidAt: 'Fizetés időpontja',
  notes: 'Megjegyzések',

  // Quote request fields
  requestNumber: 'Kérés száma',
  items: 'Tételek',
  deliveryNotes: 'Szállítási megjegyzés',
  companyName: 'Cégnév',
  contactEmail: 'E-mail cím',
  contactPhone: 'Telefonszám',
  adminNotes: 'Belső megjegyzések',
  adminResponse: 'Válasz az ügyfélnek',
  quotedAmount: 'Ajánlati összeg (Ft)',
  quotedAt: 'Ajánlat dátuma',

  // Product variant fields
  price: 'Ár (Ft)',
  attributeLabel: 'Tulajdonság neve',
  attributeValue: 'Tulajdonság értéke',
  product: 'Termék',

  // Specification component
  key: 'Tulajdonság',
  value: 'Érték',
  unit: 'Mértékegység',

  // Certification component
  standard: 'Szabvány',
  certificate: 'Tanúsítvány fájl',

  // SEO component
  metaTitle: 'Meta cím',
  metaDescription: 'Meta leírás',
  metaImage: 'Megosztási kép',
  keywords: 'Kulcsszavak',

  // Homepage fields
  hero: 'Hero szekció',
  kategoriakSzekcio: 'Kategóriák szekció',
  kiemeltTermekek: 'Kiemelt termékek',
  akciokSzekcio: 'Akciók szekció',
  promoBannerek: 'Promóciós bannerek',
  gyikSzekcio: 'GYIK szekció',
  bizalmiJelvenyek: 'Bizalmi jelvények',

  // Hero component
  cimke: 'Címke',
  focim: 'Főcím',
  leiras: 'Leírás',
  elsoGombSzoveg: 'Első gomb szövege',
  elsoGombLink: 'Első gomb linkje',
  masodikGombSzoveg: 'Második gomb szövege',
  masodikGombLink: 'Második gomb linkje',
  kepek: 'Képek',

  // Product section component
  szekcioCim: 'Szekció címe',
  termekekSzama: 'Termékek száma',
  forrasTipus: 'Forrás típus',

  // Banner component
  kep: 'Kép',
  link: 'Link',
  hatterSzin: 'Háttérszín',

  // FAQ section component
  kerdesekSzama: 'Kérdések száma',

  // Trust badges component
  jelvenyek: 'Jelvények',
  ikon: 'Ikon',
  szoveg: 'Szöveg',

  // System fields
  createdAt: 'Létrehozva',
  updatedAt: 'Módosítva',
  publishedAt: 'Közzétéve',
  createdBy: 'Létrehozta',
  updatedBy: 'Módosította',
  id: 'Azonosító',
  documentId: 'Dokumentum ID',
  locale: 'Nyelv',
};

// Content type display names in Hungarian
const contentTypeLabels: Record<string, { singular: string; plural: string }> = {
  'api::product.product': { singular: 'Termék', plural: 'Termékek' },
  'api::category.category': { singular: 'Kategória', plural: 'Kategóriák' },
  'api::order.order': { singular: 'Rendelés', plural: 'Rendelések' },
  'api::coupon.coupon': { singular: 'Kupon', plural: 'Kuponok' },
  'api::quote-request.quote-request': { singular: 'Árajánlat kérés', plural: 'Árajánlat kérések' },
  'api::faq.faq': { singular: 'GYIK', plural: 'GYIK' },
  'api::page.page': { singular: 'Oldal', plural: 'Oldalak' },
  'api::product-variant.product-variant': { singular: 'Termék változat', plural: 'Termék változatok' },
  'api::homepage.homepage': { singular: 'Főoldal', plural: 'Főoldal' },
};

export default {
  config: {
    // Set Hungarian as the default and only locale
    locales: ['hu'],
    translations: {
      hu: {
        ...hu,
        // Add content type translations
        ...Object.fromEntries(
          Object.entries(contentTypeLabels).flatMap(([uid, labels]) => [
            [`content-manager.containers.ListPage.${uid}.title`, labels.plural],
            [`content-manager.content-types.${uid}.name`, labels.singular],
            [`content-manager.content-types.${uid}.plural`, labels.plural],
          ])
        ),
        // Add field label translations with content-manager prefix
        ...Object.fromEntries(
          Object.entries(fieldLabels).map(([key, value]) => [
            `content-manager.form.attribute.item.${key}`,
            value,
          ])
        ),
        // Also add without prefix for direct field name matching
        ...fieldLabels,
        // Admin menu items
        'app.components.LeftMenu.navlink.Content': 'Tartalom',
        'app.components.LeftMenu.navlink.Plugins': 'Bővítmények',
        'app.components.LeftMenu.navlink.General': 'Általános',
        'content-manager.containers.ListPage.table.header.productCount': 'Termékek száma',
      },
    },
    // Customize the theme with CSZ brand colors
    theme: {
      light: {
        colors: {
          primary100: '#FFF8E6',
          primary200: '#FFEBB3',
          primary500: '#FFBB36',
          primary600: '#E5A830',
          primary700: '#CC952A',
          buttonPrimary500: '#FFBB36',
          buttonPrimary600: '#E5A830',
        },
      },
    },
    // Customize head
    head: {
      favicon: '/favicon.png',
    },
    // Customize menu
    menu: {
      logo: '/logo.png',
    },
    // Tutorial videos are disabled
    tutorials: false,
    // Disable notifications about new Strapi versions
    notifications: {
      releases: false,
    },
  },
  bootstrap(app: StrapiApp) {
    console.log('CSZ Tűzvédelem CMS initialized');
  },
  async register(app: StrapiApp) {
    // Register custom field labels through the app's customFields if available
    // This runs before the app is mounted
  },
};
