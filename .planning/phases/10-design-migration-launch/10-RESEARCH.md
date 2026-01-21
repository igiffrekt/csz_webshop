# Phase 10 Research: Design Implementation, Migration & Launch

## Design Analysis

### Reference Design: 01_Home.jpg

The reference design is a modern e-commerce template with the following sections:

#### 1. Header
- **Top bar**: Contact info, store locator, order tracking, currency/language
- **Main header**: Logo (left), search bar (center), icons (right: wishlist, compare, cart, account)
- **Navigation**: Mega-menu with categories dropdown, main nav links
- **Sticky behavior**: Header should stick on scroll

#### 2. Hero Section
- Large promotional banner (full-width or contained)
- Featured product/campaign with headline
- Call-to-action button
- Background image with overlay text

#### 3. Trust Badges Row
- Free shipping icon + text
- Flexible payment icon + text
- 24/7 support icon + text
- Clean horizontal layout with icons

#### 4. Category Grid
- 4-6 category blocks in grid layout
- Each block: Image + category name + item count
- Hover effect on images
- Links to category pages

#### 5. Product Collections
- Tab navigation: All Products | Latest | Best Sellers | Featured
- Product grid (4 columns desktop)
- Product cards with:
  - Discount badge (e.g., "10% off")
  - Countdown timer for deals
  - Product image with hover effect
  - Rating stars + review count
  - Product name
  - Price (current + original if discounted)

#### 6. Deals of the Day
- Section header with "Today Deals" label
- Larger product cards (2-column layout)
- Discount percentage badge
- Countdown timer
- Product details + "Shop Now" link

#### 7. Promotional Banners
- Two side-by-side banners
- Background images with text overlay
- Discount callout (e.g., "Flat 20% Discount")
- Collection name
- "Shop Now" button

#### 8. Blog/News Section
- Section header: "Our Latest News & Blogs"
- 3-column card layout
- Each card: Date badge, image, title, excerpt, "Read More" link
- "View All Blogs" button

#### 9. FAQ Section
- Section header: "Question? Look here."
- Accordion-style expandable questions
- Yellow highlight on expanded item
- Plus/minus icons for expand/collapse

#### 10. Instagram Section
- Section header: "Follow Us On Instagram"
- 6-image grid
- Hover overlay effect
- Links to Instagram profile

#### 11. Footer
- Dark background
- Logo + tagline
- Social media icons
- Multi-column links: Product, Company, Resources
- Copyright + terms links

---

## Adaptation for CSZ Tűzvédelem

### Brand Adaptation

| Original | CSZ Adaptation |
|----------|----------------|
| "electro" logo | CSZ Tűzvédelem logo |
| Furniture categories | Fire safety categories (Tűzoltó készülékek, Tűzjelző rendszerek, etc.) |
| Furniture products | Fire extinguishers, smoke detectors, safety equipment |
| Generic trust badges | Fire safety certifications (CE, EN3, EN1866) |
| Blog about furniture | Fire safety tips, regulations, news |
| Yellow accent color | Keep yellow (works for safety branding) |

### Hungarian Localization

All text must be in Hungarian:
- "Free Shipping" → "Ingyenes szállítás"
- "Flexible Payment" → "Rugalmas fizetés"
- "24/7 Support" → "0-24 ügyfélszolgálat"
- "Our Products" → "Termékeink"
- "Best Sellers" → "Legnépszerűbb"
- "Deals of the Day" → "Napi ajánlatok"
- "Latest News & Blogs" → "Legfrissebb hírek"
- "Question? Look here." → "Kérdése van? Nézze meg itt."
- "Follow Us On Instagram" → "Kövessen minket az Instagramon"

### Color Scheme

Based on design analysis:
- **Primary**: Yellow/Gold (#F5C518 or similar)
- **Secondary**: Dark gray/black (#1a1a1a)
- **Background**: White (#ffffff)
- **Text**: Dark gray (#333333)
- **Muted**: Light gray (#f5f5f5)
- **Success**: Green for stock status
- **Danger**: Red for safety warnings/out of stock

### Typography

- **Headings**: Bold sans-serif (Inter or similar)
- **Body**: Regular sans-serif
- **Prices**: Bold, larger size
- **Labels**: Small caps or uppercase for badges

---

## Component Breakdown

### New Components to Create

1. **TopBar** - Contact info, order tracking links
2. **MegaMenu** - Category dropdown with subcategories and images
3. **HeroBanner** - Full-width promotional banner
4. **TrustBadges** - Horizontal row of trust indicators
5. **CategoryGrid** - Visual category blocks
6. **ProductTabs** - Tabbed product collections
7. **ProductCardEnhanced** - Card with rating, countdown, badges
8. **DealsSection** - Featured deals with countdown
9. **PromoBanners** - Side-by-side promotional banners
10. **BlogSection** - Blog post cards
11. **FooterEnhanced** - Multi-column footer

### Components to Modify

1. **Header** - Add mega-menu, search, top bar
2. **ProductCard** - Add ratings, badges, countdown
3. **HomePage** - Complete redesign with all sections
4. **CategoryPage** - Grid layout improvements
5. **Footer** - Multi-column layout

---

## Technical Requirements

### Dependencies to Add

```json
{
  "dependencies": {
    "@radix-ui/react-tabs": "^1.x",
    "@radix-ui/react-navigation-menu": "^1.x",
    "embla-carousel-react": "^8.x"
  }
}
```

### CSS/Styling

- Extend Tailwind with brand colors
- Add custom animations for:
  - Mega-menu slide down
  - Product card hover effects
  - Countdown timer
  - Image zoom on hover

### Performance Considerations

- Lazy load below-fold sections
- Optimize hero image (WebP, responsive sizes)
- Skeleton loaders for product grids
- Intersection Observer for animations

---

## Phase 10 Plan Structure

### Wave 1: Design Foundation
- 10-01: Design system (colors, typography, spacing)
- 10-02: Header redesign with mega-menu

### Wave 2: Home Page Sections
- 10-03: Hero banner and trust badges
- 10-04: Category grid section
- 10-05: Product collections with tabs

### Wave 3: Home Page Completion
- 10-06: Deals section and promo banners
- 10-07: Blog section and enhanced footer

### Wave 4: Product Pages
- 10-08: Enhanced product cards
- 10-09: Product listing page polish
- 10-10: Product detail page polish

### Wave 5: Migration
- 10-11: WooCommerce data migration scripts
- 10-12: URL redirects and SEO preservation

### Wave 6: Launch
- 10-13: Production deployment
- 10-14: Final verification and go-live

---

## Success Criteria

1. Home page matches reference design adapted for fire safety
2. All sections responsive (mobile, tablet, desktop)
3. Hungarian text throughout
4. Product cards show ratings, prices, badges
5. Mega-menu works with existing categories
6. Performance: Lighthouse 80+ on all metrics
7. WooCommerce data successfully migrated
8. URL redirects working (no 404s for old URLs)

---

## Open Questions

1. **Logo**: Do we have CSZ Tűzvédelem logo files? (SVG preferred)
2. **Hero images**: What promotional images for hero banner?
3. **Blog content**: Will there be blog posts at launch?
4. **Product ratings**: Will we import ratings from WooCommerce or start fresh?
5. **Countdown timers**: Which products should have deal timers?

---

*Research completed: 2026-01-21*
