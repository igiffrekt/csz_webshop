import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::order.order', ({ strapi }) => ({
  /**
   * Find orders - automatically filtered by authenticated user
   */
  async find(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }

    // Query directly using documents API to filter by user
    const orders = await strapi.documents('api::order.order').findMany({
      filters: {
        user: { id: user.id },
      },
      sort: ctx.query.sort || 'createdAt:desc',
    });

    // Sanitize output
    const sanitizedOrders = await Promise.all(
      orders.map((order) => this.sanitizeOutput(order, ctx))
    );

    return { data: sanitizedOrders, meta: { pagination: { total: orders.length } } };
  },

  /**
   * Find one order - verify ownership
   */
  async findOne(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }

    const { id } = ctx.params;
    const order = await strapi.documents('api::order.order').findOne({
      documentId: id,
      populate: ['user'],
    });

    if (!order) {
      return ctx.notFound('Order not found');
    }

    if (order.user?.id !== user.id) {
      return ctx.forbidden('You do not have access to this order');
    }

    // Return sanitized response
    const sanitizedOrder = await this.sanitizeOutput(order, ctx);
    return { data: sanitizedOrder };
  },

  /**
   * Create order - for internal API use with API token
   * Requires valid API token or system-level access
   */
  async create(ctx) {
    // Allow creation with API token (from Fastify backend)
    // The token authentication is handled by Strapi automatically
    return super.create(ctx);
  },

  /**
   * Update order - for internal API use (webhook updates, admin)
   */
  async update(ctx) {
    // Allow updates with API token (for webhook status updates)
    return super.update(ctx);
  },

  /**
   * Delete is not allowed for orders
   */
  async delete(ctx) {
    return ctx.forbidden('Orders cannot be deleted');
  },
}));
