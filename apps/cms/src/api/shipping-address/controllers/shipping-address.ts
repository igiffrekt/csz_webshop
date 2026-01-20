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

    // Parse additional filters from query (e.g., isDefault)
    const queryFilters = (ctx.query.filters || {}) as Record<string, { $eq?: string }>;
    const additionalFilters: Record<string, unknown> = {};

    // Handle isDefault filter
    if (queryFilters.isDefault?.$eq) {
      additionalFilters.isDefault = queryFilters.isDefault.$eq === 'true';
    }

    // Query directly using documents API to filter by user
    const addresses = await strapi.documents('api::shipping-address.shipping-address').findMany({
      filters: {
        user: { id: user.id },
        ...additionalFilters,
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

    try {
      // Use documents API directly with proper relation format
      const requestData = ctx.request.body.data || {};
      const address = await strapi.documents('api::shipping-address.shipping-address').create({
        data: {
          label: requestData.label,
          recipientName: requestData.recipientName,
          street: requestData.street,
          city: requestData.city,
          postalCode: requestData.postalCode,
          country: requestData.country || 'Magyarország',
          phone: requestData.phone,
          isDefault: requestData.isDefault || false,
          user: user.id,
        },
      });

      const sanitizedAddress = await this.sanitizeOutput(address, ctx);
      return { data: sanitizedAddress };
    } catch (error) {
      strapi.log.error('Error creating shipping address:', error);
      return ctx.badRequest('Failed to create address');
    }
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

    try {
      // Use documents API directly, don't allow changing the user
      const requestData = ctx.request.body.data || {};
      const updateData: Record<string, unknown> = {};

      // Only allow updating these fields
      const allowedFields = ['label', 'recipientName', 'street', 'city', 'postalCode', 'country', 'phone', 'isDefault'];
      for (const field of allowedFields) {
        if (requestData[field] !== undefined) {
          updateData[field] = requestData[field];
        }
      }

      const updatedAddress = await strapi.documents('api::shipping-address.shipping-address').update({
        documentId: id,
        data: updateData,
      });

      const sanitizedAddress = await this.sanitizeOutput(updatedAddress, ctx);
      return { data: sanitizedAddress };
    } catch (error) {
      strapi.log.error('Error updating shipping address:', error);
      return ctx.badRequest('Failed to update address');
    }
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

    try {
      await strapi.documents('api::shipping-address.shipping-address').delete({
        documentId: id,
      });

      return { data: { documentId: id } };
    } catch (error) {
      strapi.log.error('Error deleting shipping address:', error);
      return ctx.badRequest('Failed to delete address');
    }
  },
}));
