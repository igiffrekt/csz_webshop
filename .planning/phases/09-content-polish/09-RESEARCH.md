# Phase 9: Content & Polish - Research

**Created:** 2026-01-21
**Phase Goal:** All content pages are live and animations deliver premium UX

## Requirements Analysis

### Content Pages (7 requirements)

| ID | Requirement | Implementation |
|----|-------------|----------------|
| CONT-04 | About page (CMS-managed) | Page content type + /rolunk page |
| CONT-05 | FAQ page with accordion | FAQ content type + /gyik page |
| CONT-06 | Contact page | Static page /kapcsolat with form |
| CONT-07 | Privacy Policy page | Page content type + /adatvedelem |
| CONT-08 | Terms and Conditions page | Page content type + /aszf |
| CONT-09 | Refund Policy page | Page content type + /visszaterites |
| CONT-10 | Instagram placeholder | Home page section (static for now) |

### Admin Content Management (3 requirements)

| ID | Requirement | Implementation |
|----|-------------|----------------|
| ADMN-23 | Edit CMS pages | Page content type with rich text |
| ADMN-24 | Upload media assets | Already available via Media Library |
| ADMN-25 | Manage SEO metadata | SEO component on pages |

### Animations (8 requirements)

| ID | Requirement | Implementation |
|----|-------------|----------------|
| ANIM-01 | Animated hero with scroll storytelling | GSAP ScrollTrigger or Motion |
| ANIM-02 | Section reveals on scroll | Intersection Observer + CSS |
| ANIM-03 | Smooth page transitions | View Transitions API or Motion |
| ANIM-04 | Product card hover | CSS transforms + transitions |
| ANIM-06 | Button/input micro-interactions | CSS + Motion for complex |
| ANIM-07 | Skeleton/shimmer loading | CSS animation keyframes |
| ANIM-08 | Respect reduced-motion | prefers-reduced-motion media query |
| ANIM-09 | Animations don't block actions | Non-blocking async animations |

### Performance & SEO (3 requirements)

| ID | Requirement | Implementation |
|----|-------------|----------------|
| PERF-01 | SEO-optimized product pages | Meta tags, structured data |
| PERF-02 | Good Lighthouse scores (80+) | Image optimization, code splitting |
| LANG-02 | CMS content in Hungarian | Content entry in Strapi |

## Content Type Design

### Page Content Type

For About, Privacy, Terms, Refund pages:

```json
{
  "kind": "collectionType",
  "collectionName": "pages",
  "info": {
    "singularName": "page",
    "pluralName": "pages",
    "displayName": "Page"
  },
  "attributes": {
    "title": { "type": "string", "required": true },
    "slug": { "type": "uid", "targetField": "title", "required": true },
    "content": { "type": "richtext" },
    "seo": { "type": "component", "component": "shared.seo" }
  }
}
```

### FAQ Content Type

```json
{
  "kind": "collectionType",
  "collectionName": "faqs",
  "info": {
    "singularName": "faq",
    "pluralName": "faqs",
    "displayName": "FAQ"
  },
  "attributes": {
    "question": { "type": "string", "required": true },
    "answer": { "type": "richtext", "required": true },
    "order": { "type": "integer", "default": 0 },
    "category": { "type": "string" }
  }
}
```

### SEO Component

```json
{
  "collectionName": "components_shared_seos",
  "info": {
    "displayName": "SEO",
    "icon": "search"
  },
  "attributes": {
    "metaTitle": { "type": "string", "maxLength": 60 },
    "metaDescription": { "type": "text", "maxLength": 160 },
    "metaImage": { "type": "media", "allowedTypes": ["images"] },
    "keywords": { "type": "string" }
  }
}
```

## Animation Strategy

### Technology Choice

**Motion (Framer Motion)** - Already installed for cart animations
- Good for component-level animations
- React-native, declarative API
- AnimatePresence for exit animations

**CSS Animations** - For simple effects
- Product card hover
- Skeleton shimmer
- Micro-interactions

**Intersection Observer** - For scroll reveals
- Native browser API
- Works with CSS classes
- No JS animation library overhead

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Page Routes

| Route | Purpose |
|-------|---------|
| `/rolunk` | About page |
| `/gyik` | FAQ page |
| `/kapcsolat` | Contact page |
| `/adatvedelem` | Privacy Policy |
| `/aszf` | Terms and Conditions |
| `/visszaterites` | Refund Policy |

## Plan Structure

| Plan | Description | Wave |
|------|-------------|------|
| 09-01 | Create Page and FAQ content types with SEO component | 1 |
| 09-02 | Create static content pages (About, Legal pages) | 2 |
| 09-03 | Create FAQ page with accordion | 2 |
| 09-04 | Create Contact page with form | 2 |
| 09-05 | Add Instagram placeholder to home page | 3 |
| 09-06 | Add scroll animations and section reveals | 3 |
| 09-07 | Add product card hover and micro-interactions | 4 |
| 09-08 | Add skeleton loaders and page transitions | 4 |
| 09-09 | SEO optimization and Lighthouse audit | 5 |
| 09-10 | Verify all requirements | 5 |

## Technical Notes

### Contact Form

Simple contact form that sends email via Strapi or external service:
- Name, Email, Subject, Message fields
- Validation with zod
- Server action to send email

### View Transitions API

Next.js 16 supports View Transitions:
```typescript
// In layout.tsx
export const experimental_viewTransition = true;
```

### Skeleton Components

Use shadcn/ui Skeleton component pattern:
```tsx
<Skeleton className="h-4 w-[200px]" />
```

## Dependencies

- Motion already installed
- May need: gsap for complex scroll effects (optional)
- shadcn/ui Skeleton, Accordion components
