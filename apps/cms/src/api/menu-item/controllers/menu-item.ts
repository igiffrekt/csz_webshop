/**
 * menu-item controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::menu-item.menu-item', ({ strapi }) => ({
  // Custom action to reorder menu items
  async reorder(ctx) {
    const { items } = ctx.request.body;

    if (!Array.isArray(items)) {
      return ctx.badRequest('Items must be an array');
    }

    try {
      // Update each item's order and parent
      for (const item of items) {
        await strapi.documents('api::menu-item.menu-item').update({
          documentId: item.documentId,
          data: {
            sorrend: item.sorrend,
            parent: item.parentId || null,
          },
        });
      }

      return { success: true };
    } catch (error) {
      strapi.log.error('Failed to reorder menu items:', error);
      return ctx.internalServerError('Failed to reorder menu items');
    }
  },

  // Get menu tree (hierarchical structure)
  async tree(ctx) {
    try {
      // Get all published menu items
      const allItems = await strapi.documents('api::menu-item.menu-item').findMany({
        status: 'published',
        populate: {
          kategoria: {
            fields: ['name', 'slug'],
          },
          parent: {
            fields: ['documentId'],
          },
        },
        sort: ['sorrend:asc'],
      });

      // Build tree structure manually
      const itemMap = new Map();
      const rootItems: any[] = [];

      // First pass: create map
      allItems.forEach((item: any) => {
        itemMap.set(item.documentId, { ...item, children: [] });
      });

      // Second pass: build tree
      allItems.forEach((item: any) => {
        const mappedItem = itemMap.get(item.documentId);
        if (item.parent?.documentId) {
          const parentItem = itemMap.get(item.parent.documentId);
          if (parentItem) {
            parentItem.children.push(mappedItem);
          } else {
            rootItems.push(mappedItem);
          }
        } else {
          rootItems.push(mappedItem);
        }
      });

      return { data: rootItems };
    } catch (error) {
      strapi.log.error('Failed to get menu tree:', error);
      return ctx.internalServerError('Failed to get menu tree');
    }
  },
}));
