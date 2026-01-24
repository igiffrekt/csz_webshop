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
    // Coupon (find only - for validation by code)
    { action: 'api::coupon.coupon.find' },
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

/**
 * Configure authenticated user API permissions for user account features
 * This grants CRUD access to shipping addresses for logged-in users
 */
async function configureAuthenticatedPermissions(strapi: Core.Strapi) {
  // Find the Authenticated role from Users & Permissions plugin
  const authenticatedRole = await strapi.db.query('plugin::users-permissions.role').findOne({
    where: { type: 'authenticated' },
  });

  if (!authenticatedRole) {
    strapi.log.warn('Authenticated role not found - skipping permission configuration');
    return;
  }

  // Define authenticated permissions for user account features
  const authenticatedPermissions = [
    // Custom profile API - allow users to read and update their own profile
    { action: 'api::profile.profile.me' },
    { action: 'api::profile.profile.update' },
    // ShippingAddress CRUD
    { action: 'api::shipping-address.shipping-address.find' },
    { action: 'api::shipping-address.shipping-address.findOne' },
    { action: 'api::shipping-address.shipping-address.create' },
    { action: 'api::shipping-address.shipping-address.update' },
    { action: 'api::shipping-address.shipping-address.delete' },
  ];

  for (const permission of authenticatedPermissions) {
    // Check if permission already exists
    const existingPermission = await strapi.db.query('plugin::users-permissions.permission').findOne({
      where: {
        action: permission.action,
        role: authenticatedRole.id,
      },
    });

    if (!existingPermission) {
      // Create the permission
      await strapi.db.query('plugin::users-permissions.permission').create({
        data: {
          action: permission.action,
          role: authenticatedRole.id,
        },
      });
      strapi.log.info(`Created authenticated permission: ${permission.action}`);
    }
  }

  strapi.log.info('Authenticated API permissions configured for user account features');
}

/**
 * Configure Store Manager role with product catalog permissions
 * This grants CRUD + publish access to Product, ProductVariant, Category in admin panel
 */
async function configureStoreManagerPermissions(strapi: Core.Strapi) {
  // Find the Store Manager role from Admin RBAC
  const storeManagerRole = await strapi.db.query('admin::role').findOne({
    where: { name: 'Store Manager' },
  });

  if (!storeManagerRole) {
    strapi.log.warn('Store Manager role not found - skipping admin permission configuration');
    return;
  }

  // Content types that Store Manager needs access to
  const contentTypes = ['api::product.product', 'api::product-variant.product-variant', 'api::category.category', 'api::coupon.coupon'];

  // CRUD actions for content-manager plugin
  const actions = ['create', 'read', 'update', 'delete', 'publish'];

  for (const contentType of contentTypes) {
    for (const action of actions) {
      const actionName = `plugin::content-manager.explorer.${action}`;

      // Check if permission already exists
      const existingPermission = await strapi.db.query('admin::permission').findOne({
        where: {
          action: actionName,
          subject: contentType,
          role: storeManagerRole.id,
        },
      });

      if (!existingPermission) {
        // Create the permission
        await strapi.db.query('admin::permission').create({
          data: {
            action: actionName,
            subject: contentType,
            properties: {},
            conditions: [],
            role: storeManagerRole.id,
          },
        });
        strapi.log.info(`Created Store Manager permission: ${action} on ${contentType}`);
      }
    }
  }

  strapi.log.info('Store Manager admin permissions configured for product catalog');
}

/**
 * Update product counts for all categories (both draft and published versions)
 * In Strapi 5, each document can have draft and published versions with same document_id
 */
async function updateCategoryProductCounts(strapi: Core.Strapi) {
  // Get unique document IDs for categories
  const categories = await strapi.db.query('api::category.category').findMany({
    select: ['id', 'documentId', 'name'],
  });

  if (categories.length === 0) {
    strapi.log.debug('No categories found');
    return;
  }

  // Group by documentId to get unique categories
  const uniqueDocIds = [...new Set(categories.map((c: any) => c.documentId))];
  strapi.log.info(`Recalculating product counts for ${uniqueDocIds.length} unique categories...`);

  let updatedCount = 0;
  for (const docId of uniqueDocIds) {
    // Get all versions of this category (draft + published)
    const versions = categories.filter((c: any) => c.documentId === docId);

    // Count products linked to any version of this category
    const count = await strapi.db.query('api::product.product').count({
      where: {
        categories: {
          documentId: docId,
        },
      },
    });

    // Update ALL versions (draft and published) with the same count
    for (const version of versions) {
      await strapi.db.query('api::category.category').update({
        where: { id: version.id },
        data: { productCount: count },
      });
    }

    if (versions.length > 0) {
      updatedCount++;
      strapi.log.debug(`Category "${versions[0].name}" (${versions.length} versions): ${count} products`);
    }
  }

  strapi.log.info(`Category product counts updated (${updatedCount} categories)`);
}

/**
 * One-time fix: Reset broken Content Manager configurations
 * Uses a marker to only run once
 */
async function resetContentManagerConfigs(strapi: Core.Strapi) {
  const markerKey = 'csz_config_reset_v1';
  const marker = await strapi.db.query('strapi::core-store').findOne({
    where: { key: markerKey },
  });

  if (marker) {
    // Already ran this fix
    return;
  }

  // Delete broken category configuration to let Strapi regenerate it
  const categoryConfigKey = 'plugin_content_manager_configuration_content_types::api::category.category';
  await strapi.db.query('strapi::core-store').delete({
    where: { key: categoryConfigKey },
  });

  // Mark as done
  await strapi.db.query('strapi::core-store').create({
    data: { key: markerKey, value: JSON.stringify({ done: true, at: new Date().toISOString() }) },
  });

  strapi.log.info('Category Content Manager configuration reset (one-time fix)');
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
    await configureAuthenticatedPermissions(strapi);
    await configureStoreManagerPermissions(strapi);
    await updateCategoryProductCounts(strapi);
    await resetContentManagerConfigs(strapi);
  },
};
