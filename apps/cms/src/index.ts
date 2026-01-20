import type { Core } from '@strapi/strapi';

/**
 * Configure public API permissions for product catalog
 * This runs on every Strapi startup but only updates if permissions are missing
 */
async function configurePublicPermissions(strapi: Core.Strapi) {
  // Find the Public role from Users & Permissions plugin
  const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
    where: { type: 'public' },
  });

  if (!publicRole) {
    strapi.log.warn('Public role not found - skipping permission configuration');
    return;
  }

  // Define public read permissions for product catalog content types
  const publicPermissions = [
    // Product
    { action: 'api::product.product.find' },
    { action: 'api::product.product.findOne' },
    // ProductVariant
    { action: 'api::product-variant.product-variant.find' },
    { action: 'api::product-variant.product-variant.findOne' },
    // Category
    { action: 'api::category.category.find' },
    { action: 'api::category.category.findOne' },
  ];

  for (const permission of publicPermissions) {
    // Check if permission already exists
    const existingPermission = await strapi.db.query('plugin::users-permissions.permission').findOne({
      where: {
        action: permission.action,
        role: publicRole.id,
      },
    });

    if (!existingPermission) {
      // Create the permission
      await strapi.db.query('plugin::users-permissions.permission').create({
        data: {
          action: permission.action,
          role: publicRole.id,
        },
      });
      strapi.log.info(`Created public permission: ${permission.action}`);
    }
  }

  strapi.log.info('Public API permissions configured for product catalog');
}

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await configurePublicPermissions(strapi);
  },
};
