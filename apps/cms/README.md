# CSZ Webshop CMS (Strapi)

This is the Strapi CMS backend for CSZ Webshop, a fire safety equipment e-commerce site.

## Development

Start Strapi with autoReload enabled:

```bash
pnpm dev
# or
pnpm develop
```

Build admin panel for production:

```bash
pnpm build
```

Start production server:

```bash
pnpm start
```

## Content Types

### Product Content Types

- **Category** - Product categories with hierarchical parent/child relationships
- **Product** - Fire safety products with specifications and certifications
- **ProductVariant** - Product variants (sizes, colors) with individual SKU and pricing
- **Coupon** - Discount coupons with percentage/fixed amount options

### User & Account

- **ShippingAddress** - Customer shipping addresses linked to user accounts

### Orders

- **Order** - Customer orders with line items, pricing, and payment tracking

## API Permissions

Permissions are configured via Strapi admin panel at Settings > Users & Permissions > Roles.

### Public Role

| Content Type | find | findOne | create | update | delete |
|--------------|------|---------|--------|--------|--------|
| Category     | YES  | YES     | -      | -      | -      |
| Product      | YES  | YES     | -      | -      | -      |
| ProductVariant| YES | YES     | -      | -      | -      |
| Coupon       | YES  | -       | -      | -      | -      |

### Authenticated Role (Customers)

| Content Type     | find | findOne | create | update | delete |
|------------------|------|---------|--------|--------|--------|
| Category         | YES  | YES     | -      | -      | -      |
| Product          | YES  | YES     | -      | -      | -      |
| ProductVariant   | YES  | YES     | -      | -      | -      |
| Coupon           | YES  | -       | -      | -      | -      |
| ShippingAddress  | YES  | YES     | YES    | YES    | YES    |
| **Order**        | -    | YES*    | YES    | -      | -      |

*Note: Order findOne should only return orders belonging to the authenticated user. A custom controller override may be needed to enforce this.

### Store Manager Role

| Content Type     | find | findOne | create | update | delete |
|------------------|------|---------|--------|--------|--------|
| All Content Types| YES  | YES     | YES    | YES    | YES    |

Full access to all content types for order management, product updates, and inventory control.

## Configuring Order Permissions

After starting Strapi for the first time:

1. Start Strapi: `pnpm dev`
2. Log into admin panel at http://localhost:1337/admin
3. Navigate to: Settings > Users & Permissions > Roles

**For Authenticated role:**
1. Click on "Authenticated"
2. Expand "Order" section
3. Enable: `findOne`, `create`
4. Save

**For Store Manager role:**
1. Click on "Store Manager"
2. Expand "Order" section
3. Enable: all permissions
4. Save

### Important Security Note

The default `findOne` permission allows any authenticated user to fetch any order by ID. To restrict users to only view their own orders, implement a custom controller policy:

```typescript
// src/api/order/controllers/order.ts
import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::order.order', ({ strapi }) => ({
  async findOne(ctx) {
    const { id } = ctx.params;
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }

    const order = await strapi.documents('api::order.order').findOne({
      documentId: id,
      populate: ['user'],
    });

    if (!order || order.user?.id !== user.id) {
      return ctx.notFound('Order not found');
    }

    return this.transformResponse(order);
  },
}));
```

## Environment Variables

Required environment variables in `.env`:

```env
# Database
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=csz_webshop
DATABASE_USERNAME=csz_user
DATABASE_PASSWORD=csz_secure_password_2024

# Server
HOST=0.0.0.0
PORT=1337

# Security
APP_KEYS=your-app-keys
API_TOKEN_SALT=your-api-token-salt
ADMIN_JWT_SECRET=your-admin-jwt-secret
TRANSFER_TOKEN_SALT=your-transfer-token-salt
JWT_SECRET=your-jwt-secret

# Email (Mailtrap for development)
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=587
SMTP_USERNAME=your-mailtrap-username
SMTP_PASSWORD=your-mailtrap-password
```

## Learn More

- [Strapi Documentation](https://docs.strapi.io)
- [Strapi GitHub](https://github.com/strapi/strapi)
