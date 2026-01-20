# Phase 2: Product Catalog Backend - Research

**Researched:** 2026-01-20
**Domain:** Strapi 5 Content Types for Ecommerce Product Catalog
**Confidence:** HIGH

## Summary

This research covers the creation of content types in Strapi 5 for managing a fire safety equipment product catalog. The phase establishes all data structures needed for ADMN-01 through ADMN-09: products with variants, categories, certifications, specifications, downloadable documents, and inventory management.

The standard approach is to:
1. Create collection types for Product, ProductVariant, and Category using Strapi's Content-Type Builder
2. Use components for reusable structures (Specification, Certification)
3. Use relations for Product-to-Variant (one-to-many) and Product-to-Category (many-to-many)
4. Leverage Strapi's Media Library for images and downloadable PDFs
5. Create all schemas in development first, backup database before any production deployment

**Primary recommendation:** Use the Content-Type Builder admin UI to create content types interactively, then verify the generated schema.json files in version control. ProductVariant should be a separate collection type (not a component) to enable independent inventory tracking and SKU management.

---

## Standard Stack

The established libraries/tools for this phase:

### Core

| Technology | Version | Purpose | Why Standard |
|------------|---------|---------|--------------|
| **Strapi Content-Type Builder** | 5.33.3 | Schema creation | Native Strapi feature, interactive UI |
| **Strapi Media Library** | 5.33.3 | Image/PDF management | Built-in asset management with folder organization |
| **Strapi Relations** | 5.33.3 | Content linking | Native support for all relation types |
| **Strapi Components** | 5.33.3 | Reusable field groups | Built-in component system |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **qs** | latest | Query string parsing | Building complex populate queries in API |
| **strapi generate** | CLI | Content type scaffolding | Initial content type creation |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| ProductVariant collection | Repeatable component | Components lack independent IDs, can't have separate inventory/SKU |
| Manual schema.json | Content-Type Builder | Manual is error-prone, Builder generates correct structure |
| JSON field for specs | Component | Components provide better admin UX with typed fields |

---

## Architecture Patterns

### Recommended Content Type Structure

```
src/api/
├── product/
│   └── content-types/
│       └── product/
│           └── schema.json          # Main product content type
├── product-variant/
│   └── content-types/
│       └── product-variant/
│           └── schema.json          # Variant with own SKU/inventory
├── category/
│   └── content-types/
│       └── category/
│           └── schema.json          # Product categories

src/components/
├── product/
│   ├── specification.json           # Key-value spec pairs
│   └── certification.json           # Certification entry
└── shared/
    └── seo-meta.json                 # Reusable SEO fields
```

### Pattern 1: Product Collection Type Schema

**What:** Main product content type with all required fields
**When to use:** Core product entity for the catalog

```json
{
  "kind": "collectionType",
  "collectionName": "products",
  "info": {
    "singularName": "product",
    "pluralName": "products",
    "displayName": "Product"
  },
  "options": {
    "draftAndPublish": true
  },
  "attributes": {
    "name": {
      "type": "string",
      "required": true,
      "maxLength": 255
    },
    "slug": {
      "type": "uid",
      "targetField": "name",
      "required": true
    },
    "description": {
      "type": "richtext"
    },
    "shortDescription": {
      "type": "text",
      "maxLength": 500
    },
    "basePrice": {
      "type": "integer",
      "required": true,
      "min": 0
    },
    "compareAtPrice": {
      "type": "integer",
      "min": 0
    },
    "sku": {
      "type": "string",
      "unique": true,
      "required": true
    },
    "images": {
      "type": "media",
      "multiple": true,
      "allowedTypes": ["images"]
    },
    "documents": {
      "type": "media",
      "multiple": true,
      "allowedTypes": ["files"]
    },
    "stock": {
      "type": "integer",
      "default": 0,
      "min": 0
    },
    "weight": {
      "type": "decimal"
    },
    "isFeatured": {
      "type": "boolean",
      "default": false
    },
    "isOnSale": {
      "type": "boolean",
      "default": false
    },
    "specifications": {
      "type": "component",
      "repeatable": true,
      "component": "product.specification"
    },
    "certifications": {
      "type": "component",
      "repeatable": true,
      "component": "product.certification"
    },
    "variants": {
      "type": "relation",
      "relation": "oneToMany",
      "target": "api::product-variant.product-variant",
      "mappedBy": "product"
    },
    "categories": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::category.category",
      "inversedBy": "products"
    }
  }
}
```

### Pattern 2: ProductVariant Collection Type

**What:** Separate collection for variants with independent inventory
**When to use:** Products with size/type/capacity variations (e.g., 2kg, 6kg, 12kg extinguishers)

```json
{
  "kind": "collectionType",
  "collectionName": "product_variants",
  "info": {
    "singularName": "product-variant",
    "pluralName": "product-variants",
    "displayName": "Product Variant"
  },
  "options": {
    "draftAndPublish": true
  },
  "attributes": {
    "name": {
      "type": "string",
      "required": true
    },
    "sku": {
      "type": "string",
      "unique": true,
      "required": true
    },
    "price": {
      "type": "integer",
      "required": true,
      "min": 0
    },
    "compareAtPrice": {
      "type": "integer",
      "min": 0
    },
    "stock": {
      "type": "integer",
      "default": 0,
      "min": 0
    },
    "weight": {
      "type": "decimal"
    },
    "attributeLabel": {
      "type": "string"
    },
    "attributeValue": {
      "type": "string"
    },
    "image": {
      "type": "media",
      "multiple": false,
      "allowedTypes": ["images"]
    },
    "product": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::product.product",
      "inversedBy": "variants"
    }
  }
}
```

### Pattern 3: Category Collection Type

**What:** Product categories with hierarchical support
**When to use:** Organizing products into browsable categories

```json
{
  "kind": "collectionType",
  "collectionName": "categories",
  "info": {
    "singularName": "category",
    "pluralName": "categories",
    "displayName": "Category"
  },
  "options": {
    "draftAndPublish": true
  },
  "attributes": {
    "name": {
      "type": "string",
      "required": true
    },
    "slug": {
      "type": "uid",
      "targetField": "name",
      "required": true
    },
    "description": {
      "type": "text"
    },
    "image": {
      "type": "media",
      "multiple": false,
      "allowedTypes": ["images"]
    },
    "parent": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::category.category",
      "inversedBy": "children"
    },
    "children": {
      "type": "relation",
      "relation": "oneToMany",
      "target": "api::category.category",
      "mappedBy": "parent"
    },
    "products": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::product.product",
      "mappedBy": "categories"
    }
  }
}
```

### Pattern 4: Specification Component

**What:** Reusable key-value pairs for technical specs
**When to use:** Product specifications like weight, dimensions, fire rating

```json
{
  "collectionName": "components_product_specifications",
  "info": {
    "displayName": "Specification"
  },
  "attributes": {
    "key": {
      "type": "string",
      "required": true
    },
    "value": {
      "type": "string",
      "required": true
    },
    "unit": {
      "type": "string"
    }
  }
}
```

### Pattern 5: Certification Component

**What:** Fire safety certification information
**When to use:** CE marks, EN standards for compliance display

```json
{
  "collectionName": "components_product_certifications",
  "info": {
    "displayName": "Certification"
  },
  "attributes": {
    "name": {
      "type": "string",
      "required": true
    },
    "standard": {
      "type": "string"
    },
    "validUntil": {
      "type": "date"
    },
    "certificate": {
      "type": "media",
      "multiple": false,
      "allowedTypes": ["files"]
    }
  }
}
```

### Anti-Patterns to Avoid

- **Using components for variants:** Components lack independent document IDs. Variants need separate SKUs and inventory tracking - use a collection type with relation.
- **Storing prices as decimals:** Store prices as integers in smallest currency unit (HUF). Avoids floating-point precision issues.
- **Flat category structure:** Use self-referential parent/children relations for category hierarchy.
- **Hardcoded enum for certifications:** Use a component to allow arbitrary certification types (CE, EN3, EN1866, etc.) without schema changes.
- **Creating content types in production:** Always create/modify in development, backup before deployment.

---

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Media management | Custom file upload system | Strapi Media Library | Folder organization, image optimization, multiple formats |
| Slug generation | Manual slug creation | Strapi UID field with targetField | Auto-generates from name, ensures uniqueness |
| Draft/publish workflow | Custom status field | Strapi draftAndPublish option | Built-in workflow with preview support |
| Relation management | Foreign key handling | Strapi Relations | Automatic cascade, bidirectional sync |
| Image thumbnails | Manual resizing | Strapi breakpoints config | Auto-generates responsive sizes |
| API population | Manual joins | Strapi populate parameter | Handles nested relations and components |

**Key insight:** Strapi's Content-Type Builder handles schema generation, database migrations, and API exposure automatically. Manual schema manipulation should only be done after understanding the generated structure.

---

## Common Pitfalls

### Pitfall 1: Schema Modification Data Loss

**What goes wrong:** Modifying content type schemas in production causes Strapi to delete all records in affected tables on restart.

**Why it happens:** Strapi syncs database tables with schemas on restart. When schema files don't match database state, Strapi may drop and recreate tables.

**How to avoid:**
1. NEVER modify content types directly in production
2. Always backup database before ANY deployment: `pg_dump csz_strapi > backup.sql`
3. Test schema changes in development with production data copy
4. Use development -> staging -> production workflow

**Warning signs:** Schema files modified in production, missing database backups, no staging environment.

### Pitfall 2: Relations Not Populating in API

**What goes wrong:** GET requests return relation fields as null or empty arrays.

**Why it happens:** Strapi REST API does not populate relations by default. Must explicitly request with `populate` parameter.

**How to avoid:**
1. Use explicit populate: `?populate[variants]=*&populate[categories]=*`
2. For nested relations: `?populate[variants][populate][image]=*`
3. Consider strapi-plugin-populate-all for deep population

**Warning signs:** Frontend showing missing product variants or categories.

### Pitfall 3: Component Nesting Limits

**What goes wrong:** Admin UI becomes unusable with deeply nested components.

**Why it happens:** Strapi admin UI supports only 2 levels of component nesting by default.

**How to avoid:**
1. Keep component nesting shallow (max 2 levels)
2. For complex structures, use relations to separate collection types
3. Use dynamic zones for flexible content areas

**Warning signs:** "Add component" button doesn't work, UI freezing.

### Pitfall 4: Media Upload Size Limits

**What goes wrong:** PDF certificate uploads fail silently or with unhelpful errors.

**Why it happens:** Default upload limit is 200MB but middleware and Nginx may have lower limits.

**How to avoid:**
1. Configure upload plugin in `config/plugins.ts`:
```typescript
export default () => ({
  upload: {
    config: {
      sizeLimit: 50 * 1024 * 1024, // 50MB
    },
  },
});
```
2. Configure body parser middleware for larger payloads
3. Check Nginx `client_max_body_size` in production

**Warning signs:** Upload fails with no clear error, works in dev but not production.

### Pitfall 5: Permissions Not Configured for API Access

**What goes wrong:** API returns 403 Forbidden for public product endpoints.

**Why it happens:** Strapi content types are private by default. Permissions must be explicitly granted.

**How to avoid:**
1. Go to Settings > Roles > Public
2. Enable `find` and `findOne` for Product, ProductVariant, Category
3. Keep `create`, `update`, `delete` disabled for public role

**Warning signs:** API works when logged in but not for anonymous requests.

---

## Code Examples

Verified patterns from official sources:

### Creating Content Type via CLI

```bash
# Source: https://docs.strapi.io/cms/cli
cd apps/cms

# Interactive CLI - will prompt for fields
npx strapi generate content-type

# Or create manually, then restart Strapi to sync
```

### Upload Plugin Configuration

```typescript
// apps/cms/config/plugins.ts
// Source: https://docs.strapi.io/cms/features/media-library

export default ({ env }) => ({
  upload: {
    config: {
      provider: 'local',
      providerOptions: {
        localServer: {
          maxage: 300000,
        },
      },
      sizeLimit: 50 * 1024 * 1024, // 50MB for PDF certificates
      breakpoints: {
        xlarge: 1920,
        large: 1000,
        medium: 750,
        small: 500,
        xsmall: 64,
      },
    },
  },
});
```

### Populating Nested Relations in API

```typescript
// In Fastify API backend - fetching products with all relations
// Source: https://docs.strapi.io/cms/api/rest/guides/understanding-populate

import qs from 'qs';

const query = qs.stringify({
  populate: {
    images: true,
    documents: true,
    specifications: true,
    certifications: {
      populate: ['certificate']
    },
    variants: {
      populate: ['image']
    },
    categories: true
  }
}, { encodeValuesOnly: true });

const response = await fetch(`${STRAPI_URL}/api/products?${query}`);
```

### Configuring Public API Permissions

```
Steps in Strapi Admin:
Source: https://docs.strapi.io/cms/features/rbac

1. Navigate to: Settings > Users & Permissions Plugin > Roles
2. Click on "Public" role
3. Under "Product":
   - Enable: find, findOne
   - Disable: create, update, delete
4. Under "Product-variant":
   - Enable: find, findOne
5. Under "Category":
   - Enable: find, findOne
6. Click "Save"

This allows the API backend to fetch products without authentication.
```

### Database Backup Before Schema Changes

```bash
# Source: https://docs.strapi.io/cms/database-migrations

# Before any schema modification in staging/production:
docker exec csz-postgres pg_dump -U strapi csz_strapi > backup_$(date +%Y%m%d_%H%M%S).sql

# To restore if something goes wrong:
docker exec -i csz-postgres psql -U strapi csz_strapi < backup_YYYYMMDD_HHMMSS.sql
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Strapi 4 schema format | Strapi 5 schema format | 2024 | New `documentId` field, simplified relations |
| `populate=*` for deep | Explicit populate strategy | Strapi 5 | Wildcard only goes 1 level deep now |
| Components for variants | Collection types with relations | Best practice | Variants need independent lifecycle |
| Direct Strapi API calls | Via API backend facade | Architecture decision | Frontend never calls Strapi directly |

**Deprecated/outdated:**
- `api::` prefix in relation targets - Still required in Strapi 5
- `inversedBy`/`mappedBy` syntax - Still the standard for bidirectional relations
- Draft/Publish via custom field - Use built-in `draftAndPublish` option

---

## Open Questions

Things that couldn't be fully resolved:

1. **Product Import from WooCommerce**
   - What we know: Phase 10 handles migration, need compatible schema
   - What's unclear: Exact WooCommerce field mapping
   - Recommendation: Design schema to accommodate common WooCommerce product fields, validate during Phase 10

2. **Fire Rating/Class Field**
   - What we know: Fire safety products have ratings like "21A 113B C"
   - What's unclear: Whether to use enumeration or free text
   - Recommendation: Use component with free text for now, can add validation later based on actual data patterns

3. **Variant Attribute Types**
   - What we know: Products have variants like size (2kg, 6kg) or type (powder, foam)
   - What's unclear: Whether to enforce attribute types via enumeration
   - Recommendation: Use flexible string fields (attributeLabel, attributeValue) to support any variant dimension

---

## Field Mapping: Requirements to Schema

| Requirement | Schema Field | Content Type |
|-------------|--------------|--------------|
| ADMN-01: title, description, images | name, description, images | Product |
| ADMN-02: price, compare-at price | basePrice, compareAtPrice | Product, ProductVariant |
| ADMN-03: product variants | variants relation | Product -> ProductVariant |
| ADMN-04: categories | categories relation | Product -> Category |
| ADMN-05: certifications | certifications component | Product |
| ADMN-06: technical specifications | specifications component | Product |
| ADMN-07: downloadable documents | documents media field | Product |
| ADMN-08: inventory quantities | stock field | Product, ProductVariant |
| ADMN-09: featured, on sale | isFeatured, isOnSale | Product |

---

## Sources

### Primary (HIGH confidence)

- [Strapi 5 Content-Type Builder](https://docs.strapi.io/cms/features/content-type-builder) - Field types, component creation
- [Strapi 5 Models Documentation](https://docs.strapi.io/cms/backend-customization/models) - Schema structure, relation syntax
- [Strapi 5 Media Library](https://docs.strapi.io/cms/features/media-library) - File handling, folder organization
- [Strapi 5 Understanding Populate](https://docs.strapi.io/cms/api/rest/guides/understanding-populate) - API query patterns
- [Strapi 5 Database Migrations](https://docs.strapi.io/cms/database-migrations) - Migration lifecycle, backup practices

### Secondary (MEDIUM confidence)

- [Strapi Ecommerce Store Tutorial](https://strapi.io/blog/how-to-build-an-ecommerce-store) - Product schema patterns
- [Strapi Relations 101](https://strapi.io/blog/strapi-relations-101) - Relation type selection guidance
- [Strapi Product Variants Forum](https://forum.strapi.io/t/product-variants/11289) - Component vs relation for variants

### Tertiary (LOW confidence)

- [GitHub Issue #19141](https://github.com/strapi/strapi/issues/19141) - Schema modification data loss reports
- Community forum discussions on variant handling - Varied approaches, validate with testing

---

## Metadata

**Confidence breakdown:**

- Content type structure: HIGH - Official documentation verified
- Component vs relation decision: HIGH - Clear guidance from Strapi team
- API population: HIGH - Official documentation with examples
- Data loss pitfall: HIGH - Documented in multiple sources including GitHub issues
- Upload configuration: MEDIUM - Official docs, but some edge cases in production
- Migration safety: MEDIUM - Based on community experience and official warnings

**Research date:** 2026-01-20
**Valid until:** 2026-02-20 (30 days - Strapi 5 is stable)
