# WooCommerce to Strapi Migration

This guide covers migrating data from WooCommerce to the new Strapi-based CSZ Webshop.

## Prerequisites

### 1. Export WooCommerce Data

In your WordPress admin:

1. **Products Export**
   - Go to WooCommerce → Products
   - Click "Export" button
   - Select all columns
   - Download as CSV
   - Save as `data/woocommerce-products.csv`

2. **Categories** (optional)
   - Categories are extracted from product CSV
   - For complex hierarchies, export separately from Products → Categories

3. **Customers** (optional, for future use)
   - WooCommerce → Customers → Export
   - Or use a plugin like "Export Users to CSV"

### 2. Set Up Environment

Create a Strapi API token:

1. In Strapi admin, go to Settings → API Tokens
2. Create new token with "Full access"
3. Copy the token

Set environment variables:

```bash
# Windows (PowerShell)
$env:STRAPI_URL = "http://localhost:1337"
$env:STRAPI_ADMIN_TOKEN = "your-api-token-here"

# Linux/Mac
export STRAPI_URL=http://localhost:1337
export STRAPI_ADMIN_TOKEN=your-api-token-here
```

### 3. Install Dependencies

```bash
pnpm add -D csv-parse tsx
```

## Running the Migration

### Basic Usage

```bash
npx tsx scripts/migration/woocommerce-import.ts data/woocommerce-products.csv
```

### What Gets Migrated

| WooCommerce Field | Strapi Field | Notes |
|-------------------|--------------|-------|
| Name | name | Product title |
| SKU | sku | Unique identifier |
| Short description | shortDescription | Summary text |
| Description | description | Full HTML description |
| Regular price | basePrice or compareAtPrice | Depends on sale |
| Sale price | basePrice | If on sale |
| Stock | stock | Inventory count |
| Published | isActive | Active status |
| Categories | categories | First category only |

### Migration Steps

1. **Categories First** - Creates all unique categories
2. **Products** - Creates simple products (skips variable products)

## Post-Migration Steps

### 1. Review in Strapi

- Check imported products in Strapi admin
- Verify categories are correct
- Check price calculations

### 2. Upload Images

Images are NOT automatically migrated. You need to:

1. Export images from WordPress uploads folder
2. Upload to Strapi Media Library
3. Attach to products manually or via script

### 3. Add Fire Safety Metadata

For each product, add:

- Certifications (CE, EN3, EN1866)
- Technical specifications
- Fire class compatibility
- Downloadable documents (PDF certificates)

### 4. Create Variants

WooCommerce variations need to be recreated:

1. Identify products that need variants
2. Create ProductVariant entries in Strapi
3. Link variants to parent products

### 5. Publish Products

Products are created as drafts. To publish:

- Review each product
- Click "Publish" in Strapi admin
- Or bulk publish via API

## Troubleshooting

### "unique constraint" errors

Product or category already exists. Safe to ignore.

### "Cannot connect to Strapi"

1. Ensure Strapi is running: `pnpm --filter cms dev`
2. Check STRAPI_URL is correct
3. Verify API token has correct permissions

### Rate limiting

The script includes delays between requests. If you hit limits:

1. Increase delay in script (line with `await delay(100)`)
2. Run in smaller batches

### Missing categories

1. Ensure product CSV has Categories column
2. Check for encoding issues in CSV
3. Manually create categories if needed

## Advanced: Image Migration Script

For automatic image migration, create a separate script:

```typescript
// scripts/migration/import-images.ts
// Reads image URLs from CSV, downloads, uploads to Strapi
// Then attaches to products
```

## Data Backup

Before running migration on production:

1. Export Strapi database
2. Create database backup
3. Test migration on staging first

## Support

For issues with migration:

1. Check CSV format matches WooCommerce export
2. Verify Strapi schema matches expected fields
3. Review error messages in console output
