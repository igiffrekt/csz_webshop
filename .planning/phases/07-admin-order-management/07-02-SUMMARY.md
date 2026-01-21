# 07-02-SUMMARY: Add Lifecycle Hooks for Notifications

**Completed:** 2026-01-21
**Status:** Success

## What Was Built

Created lifecycle hooks for Order status change notifications.

## File Created

```
apps/cms/src/api/order/content-types/order/lifecycles.ts
```

## Implementation

### afterUpdate Hook

Triggers when an order is updated. If status changes to "shipped":

1. Fetches order with user relation
2. Sends email notification to customer
3. Logs status change for audit trail

### Email Content

- Subject: `Rendelése úton van! - {orderNumber}`
- Body includes:
  - Personalized greeting
  - Order number
  - Shipping address confirmation
  - Thank you message

### Logging

All status changes are logged:
```
Order CSZ-2026-XXX status changed to: shipped
Shipping notification sent for order CSZ-2026-XXX to customer@email.com
```

## Technical Details

- TypeScript with proper type definitions
- Non-blocking email (errors don't prevent status save)
- Uses Strapi's email plugin (configured in Phase 5)
- Proper Hungarian text with accents

## Requirements Covered

- ADMN-13: Admin can update order status (with notification)
