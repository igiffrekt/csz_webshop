import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::shipping-address.shipping-address', ({ strapi }) => ({
  /**
   * Find addresses - automatically filtered by authenticated user
   */
  async find(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }

    // Query directly using documents API to filter by user
    const addresses = await strapi.documents('api::shipping-address.shipping-address').findMany({
      filters: {
        user: { id: user.id },
      },
      sort: ctx.query.sort || 'createdAt:desc',
    });

    // Sanitize output
    const sanitizedAddresses = await Promise.all(
      addresses.map((address) => this.sanitizeOutput(address, ctx))
    );

    return { data: sanitizedAddresses, meta: { pagination: { total: addresses.length } } };
  },

  /**
   * Find one address - verify ownership
   */
  async findOne(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }

    const { id } = ctx.params;
    const address = await strapi.documents('api::shipping-address.shipping-address').findOne({
      documentId: id,
      populate: ['user'],
    });

    if (!address) {
      return ctx.notFound('Address not found');
    }

    if (address.user?.id !== user.id) {
      return ctx.forbidden('You do not have access to this address');
    }

    // Return sanitized response
    const sanitizedAddress = await this.sanitizeOutput(address, ctx);
    return { data: sanitizedAddress };
  },

  /**
   * Create address - automatically assign to authenticated user
   */
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }

    // Force set user to current authenticated user
    ctx.request.body.data = {
      ...ctx.request.body.data,
      user: user.id,
    };

    const response = await super.create(ctx);
    return response;
  },

  /**
   * Update address - verify ownership first
   */
  async update(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }

    const { id } = ctx.params;
    const address = await strapi.documents('api::shipping-address.shipping-address').findOne({
      documentId: id,
      populate: ['user'],
    });

    if (!address) {
      return ctx.notFound('Address not found');
    }

    if (address.user?.id !== user.id) {
      return ctx.forbidden('You do not have access to this address');
    }

    // Don't allow changing the user
    if (ctx.request.body.data) {
      delete ctx.request.body.data.user;
    }

    const response = await super.update(ctx);
    return response;
  },

  /**
   * Delete address - verify ownership first
   */
  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }

    const { id } = ctx.params;
    const address = await strapi.documents('api::shipping-address.shipping-address').findOne({
      documentId: id,
      populate: ['user'],
    });

    if (!address) {
      return ctx.notFound('Address not found');
    }

    if (address.user?.id !== user.id) {
      return ctx.forbidden('You do not have access to this address');
    }

    const response = await super.delete(ctx);
    return response;
  },
}));
