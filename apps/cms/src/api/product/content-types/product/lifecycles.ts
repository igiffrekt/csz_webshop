// Product lifecycle hooks to maintain category product counts
import type { Core } from '@strapi/strapi';

type CategoryId = number | string;

async function updateCategoryCount(strapi: Core.Strapi, categoryId: CategoryId) {
  const count = await strapi.db.query('api::product.product').count({
    where: {
      categories: {
        id: categoryId,
      },
      publishedAt: { $notNull: true },
    },
  });

  await strapi.db.query('api::category.category').update({
    where: { id: categoryId },
    data: { productCount: count },
  });
}

async function updateMultipleCategoryCounts(strapi: Core.Strapi, categoryIds: CategoryId[]) {
  for (const categoryId of categoryIds) {
    await updateCategoryCount(strapi, categoryId);
  }
}

function getCategoryIds(categories: any): CategoryId[] {
  if (!categories) return [];
  if (Array.isArray(categories)) {
    return categories.map((c: any) => c.id || c).filter(Boolean);
  }
  if (categories.connect) {
    return categories.connect.map((c: any) => c.id || c).filter(Boolean);
  }
  return [];
}

export default {
  async afterCreate(event: any) {
    const { result } = event;
    const strapi = (global as any).strapi as Core.Strapi;

    // Get categories from the created product
    if (result.categories) {
      const categoryIds = getCategoryIds(result.categories);
      await updateMultipleCategoryCounts(strapi, categoryIds);
    }
  },

  async afterUpdate(event: any) {
    const { result, params } = event;
    const strapi = (global as any).strapi as Core.Strapi;

    // Get all categories that might be affected
    const categoryIds = new Set<CategoryId>();

    // Categories from the update data
    if (params.data?.categories) {
      const ids = getCategoryIds(params.data.categories);
      ids.forEach(id => categoryIds.add(id));

      // Also handle disconnect
      if (params.data.categories.disconnect) {
        params.data.categories.disconnect.forEach((c: any) => {
          categoryIds.add(c.id || c);
        });
      }
    }

    // Categories from the result
    if (result.categories) {
      const ids = getCategoryIds(result.categories);
      ids.forEach(id => categoryIds.add(id));
    }

    if (categoryIds.size > 0) {
      await updateMultipleCategoryCounts(strapi, Array.from(categoryIds));
    }
  },

  async beforeDelete(event: any) {
    const { params } = event;
    const strapi = (global as any).strapi as Core.Strapi;

    // Get the product's categories before deletion
    const product = await strapi.db.query('api::product.product').findOne({
      where: params.where,
      populate: { categories: true },
    });

    if (product?.categories) {
      // Store category IDs for afterDelete
      event.state = { categoryIds: getCategoryIds(product.categories) };
    }
  },

  async afterDelete(event: any) {
    const strapi = (global as any).strapi as Core.Strapi;
    const categoryIds = event.state?.categoryIds || [];

    if (categoryIds.length > 0) {
      await updateMultipleCategoryCounts(strapi, categoryIds);
    }
  },

};
