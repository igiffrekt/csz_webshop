// Product lifecycle hooks to maintain category product counts
import type { Core } from '@strapi/strapi';

type CategoryId = number | string;

/**
 * Update product count for a category (all versions: draft + published)
 * In Strapi 5, we need to update all document versions
 */
async function updateCategoryCountByDocumentId(strapi: Core.Strapi, documentId: string) {
  // Count products linked to this category document
  const count = await strapi.db.query('api::product.product').count({
    where: {
      categories: {
        documentId: documentId,
      },
    },
  });

  // Update ALL versions of this category (draft and published)
  await strapi.db.query('api::category.category').updateMany({
    where: { documentId: documentId },
    data: { productCount: count },
  });
}

async function updateCategoryCounts(strapi: Core.Strapi, categoryIds: CategoryId[]) {
  // Get unique document IDs for these categories
  const categories = await strapi.db.query('api::category.category').findMany({
    where: { id: { $in: categoryIds } },
    select: ['documentId'],
  });

  const uniqueDocIds = [...new Set(categories.map((c: any) => c.documentId))];

  for (const docId of uniqueDocIds) {
    await updateCategoryCountByDocumentId(strapi, docId);
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

    if (result.categories) {
      const categoryIds = getCategoryIds(result.categories);
      if (categoryIds.length > 0) {
        await updateCategoryCounts(strapi, categoryIds);
      }
    }
  },

  async afterUpdate(event: any) {
    const { result, params } = event;
    const strapi = (global as any).strapi as Core.Strapi;

    const categoryIds = new Set<CategoryId>();

    // Categories from the update data
    if (params.data?.categories) {
      const ids = getCategoryIds(params.data.categories);
      ids.forEach(id => categoryIds.add(id));

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
      await updateCategoryCounts(strapi, Array.from(categoryIds));
    }
  },

  async beforeDelete(event: any) {
    const { params } = event;
    const strapi = (global as any).strapi as Core.Strapi;

    const product = await strapi.db.query('api::product.product').findOne({
      where: params.where,
      populate: { categories: true },
    });

    if (product?.categories) {
      event.state = { categoryIds: getCategoryIds(product.categories) };
    }
  },

  async afterDelete(event: any) {
    const strapi = (global as any).strapi as Core.Strapi;
    const categoryIds = event.state?.categoryIds || [];

    if (categoryIds.length > 0) {
      await updateCategoryCounts(strapi, categoryIds);
    }
  },
};
