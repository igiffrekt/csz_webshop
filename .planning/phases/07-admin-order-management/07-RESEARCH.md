# Phase 7: Admin Order Management - Research

**Created:** 2026-01-21
**Phase Goal:** Admin can manage orders and view customer information

## Requirements Analysis

| ID | Requirement | Strapi Built-in | Custom Work Needed |
|----|-------------|-----------------|-------------------|
| ADMN-10 | Admin can view all orders | ✓ Content Manager | Configure list view columns |
| ADMN-11 | Admin can filter orders by status, date, customer | ✓ Built-in filters | Verify filter configuration |
| ADMN-12 | Admin can view order details | ✓ Edit view | Configure field layout |
| ADMN-13 | Admin can update order status | ✓ Edit field | Add lifecycle hooks for notifications |
| ADMN-14 | Admin can view customer information for order | ✓ Relation field | Ensure user relation populated |

## Current State

### Order Content Type (Already Exists)
- Location: `apps/cms/src/api/order/content-types/order/schema.json`
- Status enum: pending, paid, processing, shipped, delivered, cancelled, refunded
- User relation: manyToOne to users-permissions.user
- All pricing fields: subtotal, discount, shipping, vatAmount, total
- Address fields: shippingAddress (JSON), billingAddress (JSON)
- Line items: JSON array
- Payment info: paymentMethod, paymentId, stripeSessionId, paidAt

### What Strapi Provides Out-of-Box
1. **List View** - Table of all orders with sortable/filterable columns
2. **Filters** - Can filter by any field including status, dates, relations
3. **Edit View** - Form to view/edit order details
4. **Relation Display** - Shows related user info
5. **Role-Based Access** - Admin/Store Manager permissions already configured

## Implementation Strategy

Since Strapi already provides core functionality, this phase focuses on:

### 1. List View Configuration
- Configure which columns show in order list
- Set default sort order (newest first)
- Configure searchable fields

### 2. Edit View Configuration
- Organize fields into logical groups
- Make certain fields read-only (orderNumber, line items, totals)
- Configure status field for easy updates

### 3. Lifecycle Hooks (Optional Enhancement)
- Send email notification when status changes to "shipped"
- Log status change history

### 4. API Permissions
- Verify Store Manager role can manage orders
- Ensure public API doesn't expose order admin endpoints

## Strapi Admin Customization Options

### Option A: Content-Type Configuration Only
- Configure via `schema.json` settings
- No custom code needed
- Limited customization

### Option B: Admin Panel Extensions (Recommended)
- Create custom list view configuration
- Add field grouping in edit view
- Use Strapi's plugin system

### Option C: Custom Admin Plugin
- Full custom order management interface
- More development effort
- Maximum flexibility

**Recommendation:** Option B - Use Strapi's built-in customization without building custom plugins.

## Plan Structure

Given the scope, Phase 7 can be completed in 2-3 small plans:

1. **07-01**: Configure Order list view and edit view in Strapi
2. **07-02**: Add lifecycle hooks for status change notifications
3. **07-03**: Verify all admin requirements and permissions

## Success Criteria Mapping

| Success Criteria | How to Verify |
|------------------|---------------|
| Admin can see list of all orders with status, date, customer, total | Log in as Admin, go to Content Manager > Orders |
| Admin can filter to "Pending" orders placed this week | Use status filter + date filter |
| Admin can view full order details | Click on order to see edit view |
| Admin can update status and customer sees change | Change status, verify in customer's order history |

## Technical Notes

### Strapi 5 Admin Customization
- List view config: `src/api/order/content-types/order/schema.json` → `pluginOptions`
- Edit view: Configure via Admin panel Settings or custom extensions
- Lifecycle hooks: `src/api/order/content-types/order/lifecycles.ts`

### Email Notifications
- Strapi email plugin already configured (Phase 5)
- Can reuse email templates for order status updates
