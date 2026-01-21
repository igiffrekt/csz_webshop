import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::quote-request.quote-request', ({ strapi }) => ({
  /**
   * Find quote requests - filtered by authenticated user
   */
  async find(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('Bejelentkezés szükséges');
    }

    const quoteRequests = await strapi.documents('api::quote-request.quote-request').findMany({
      filters: {
        user: { id: user.id },
      },
      sort: ctx.query.sort || 'createdAt:desc',
    });

    const sanitizedResults = await Promise.all(
      quoteRequests.map((qr) => this.sanitizeOutput(qr, ctx))
    );

    return { data: sanitizedResults, meta: { pagination: { total: quoteRequests.length } } };
  },

  /**
   * Find one quote request - verify ownership
   */
  async findOne(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('Bejelentkezés szükséges');
    }

    const { id } = ctx.params;
    const quoteRequest = await strapi.documents('api::quote-request.quote-request').findOne({
      documentId: id,
      populate: ['user'],
    });

    if (!quoteRequest) {
      return ctx.notFound('Árajánlat kérés nem található');
    }

    if (quoteRequest.user?.id !== user.id) {
      return ctx.forbidden('Nincs hozzáférése ehhez az árajánlat kéréshez');
    }

    const sanitizedResult = await this.sanitizeOutput(quoteRequest, ctx);
    return { data: sanitizedResult };
  },

  /**
   * Create quote request
   */
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('Bejelentkezés szükséges');
    }

    // Generate request number
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 4).toUpperCase();
    const requestNumber = `QR-${year}-${timestamp}${random}`;

    // Add user and request number to data
    ctx.request.body.data = {
      ...ctx.request.body.data,
      user: user.id,
      requestNumber,
      status: 'pending',
      contactEmail: ctx.request.body.data.contactEmail || user.email,
    };

    return super.create(ctx);
  },

  /**
   * Update not allowed for users (admin only via Content Manager)
   */
  async update(ctx) {
    // Only allow updates via API token (admin)
    if (ctx.state.auth?.credentials?.type !== 'api-token') {
      return ctx.forbidden('Árajánlat kérés módosítása nem engedélyezett');
    }
    return super.update(ctx);
  },

  /**
   * Delete not allowed
   */
  async delete(ctx) {
    return ctx.forbidden('Árajánlat kérés törlése nem engedélyezett');
  },
}));
