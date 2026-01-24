import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::category.category', ({ strapi }) => ({
  // Override find to include product count
  async find(ctx) {
    // Call the default find
    const { data, meta } = await super.find(ctx);

    // Add product count to each category
    const categoriesWithCount = await Promise.all(
      data.map(async (category: any) => {
        const count = await strapi.db.query('api::product.product').count({
          where: {
            categories: {
              id: category.id,
            },
          },
        });

        return {
          ...category,
          productCount: count,
        };
      })
    );

    return { data: categoriesWithCount, meta };
  },

  // Override findOne to include product count
  async findOne(ctx) {
    const response = await super.findOne(ctx);

    if (response.data) {
      const count = await strapi.db.query('api::product.product').count({
        where: {
          categories: {
            id: response.data.id,
          },
        },
      });

      response.data.productCount = count;
    }

    return response;
  },
}));
