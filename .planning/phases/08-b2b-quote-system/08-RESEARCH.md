# Phase 8: B2B Quote System - Research

**Created:** 2026-01-21
**Phase Goal:** B2B customers can request and track bulk order quotes

## Requirements Analysis

### User-Facing Requirements

| ID | Requirement | Implementation |
|----|-------------|----------------|
| QUOT-01 | User can request quote for bulk order | Quote request form page |
| QUOT-02 | User can specify products, quantities, notes | Form with product selector, quantity inputs, notes field |
| QUOT-03 | User receives confirmation when submitted | Email notification + success page |
| QUOT-04 | User can view quote request history | Account page at /fiok/ajanlatkeres |

### Admin Requirements

| ID | Requirement | Implementation |
|----|-------------|----------------|
| ADMN-20 | Admin can view quote requests | Strapi Content Manager (like Orders) |
| ADMN-21 | Admin can respond to quote requests | Manual email response, notes field |
| ADMN-22 | Admin can mark quotes as converted/declined | Status field with enum |

## Data Model

### QuoteRequest Content Type

```json
{
  "kind": "collectionType",
  "collectionName": "quote_requests",
  "info": {
    "singularName": "quote-request",
    "pluralName": "quote-requests",
    "displayName": "Quote Request"
  },
  "attributes": {
    "requestNumber": {
      "type": "string",
      "required": true,
      "unique": true
    },
    "status": {
      "type": "enumeration",
      "enum": ["pending", "quoted", "converted", "declined", "expired"],
      "default": "pending"
    },
    "user": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "plugin::users-permissions.user"
    },
    "items": {
      "type": "json",
      "required": true
    },
    "deliveryNotes": {
      "type": "text"
    },
    "companyName": {
      "type": "string"
    },
    "contactEmail": {
      "type": "email",
      "required": true
    },
    "contactPhone": {
      "type": "string"
    },
    "adminNotes": {
      "type": "text"
    },
    "quotedAt": {
      "type": "datetime"
    },
    "validUntil": {
      "type": "datetime"
    }
  }
}
```

### Quote Item Structure (JSON)

```typescript
interface QuoteItem {
  productId: string;        // documentId
  productName: string;
  variantId?: string;       // documentId
  variantName?: string;
  sku: string;
  quantity: number;
  unitPrice?: number;       // Filled by admin when quoting
  totalPrice?: number;      // Filled by admin when quoting
}
```

## User Flow

### Request Quote Flow

1. User navigates to /ajanlatkeres (quote request page)
2. User adds products with quantities
3. User adds delivery notes (optional)
4. User submits request
5. System creates QuoteRequest in Strapi
6. System sends confirmation email to user
7. User redirected to success page
8. User can view request in /fiok/ajanlatkeres

### Admin Response Flow

1. Admin sees new quote request in Strapi
2. Admin reviews items and quantities
3. Admin contacts customer with pricing (manual email)
4. Admin updates status to "quoted" with quotedAt date
5. If customer accepts, admin marks as "converted"
6. If customer declines/no response, admin marks as "declined" or "expired"

## Pages to Create

### Frontend Pages

| Route | Purpose |
|-------|---------|
| `/ajanlatkeres` | Quote request form |
| `/ajanlatkeres/sikeres` | Submission success page |
| `/fiok/ajanlatkeres` | Quote history list |
| `/fiok/ajanlatkeres/[id]` | Quote detail view |

### Components

| Component | Purpose |
|-----------|---------|
| `QuoteRequestForm` | Form with product selector |
| `ProductQuantityInput` | Product search + quantity |
| `QuoteCard` | Quote request summary card |
| `QuoteStatusBadge` | Status display badge |

## API Endpoints

### Fastify API (optional)

Could handle quote creation through Fastify for consistency, or use Strapi API directly with custom controller.

**Recommendation:** Use Strapi API directly with custom controller (like Orders).

### Strapi Custom Controller

```typescript
// POST /api/quote-requests - Create quote request
// GET /api/quote-requests - Get user's quote requests (filtered)
// GET /api/quote-requests/:id - Get single quote request (ownership check)
```

## Email Notifications

### Quote Request Confirmation

Sent to user when quote submitted:
- Request number
- Items requested
- Expected response time
- Contact info

### Admin Notification (Optional)

Sent to admin email when new quote received:
- Request number
- Customer info
- Items summary
- Link to Strapi admin

## Plan Structure

| Plan | Description | Wave |
|------|-------------|------|
| 08-01 | Create QuoteRequest content type in Strapi | 1 |
| 08-02 | Create quote request form and submission | 1 |
| 08-03 | Create quote history pages in account | 2 |
| 08-04 | Add email notifications and lifecycle hooks | 2 |
| 08-05 | Verify all requirements | 3 |

## Technical Notes

### Product Selection

Two options for product selection in quote form:
1. **Search-based:** User searches for products, adds to list
2. **Cart-based:** User can "Request Quote" from cart

**Recommendation:** Search-based for flexibility, but also allow starting from cart.

### Authentication

Quote requests require authentication (user must be logged in).
Company info pre-filled from user profile if available.

### Strapi Permissions

- Authenticated users: create, find (own), findOne (own)
- Admin/Store Manager: full access via Content Manager
