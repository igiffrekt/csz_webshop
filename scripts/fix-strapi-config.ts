// Fix broken Strapi Content Manager configurations
// Run with: cd apps/cms && npx strapi console < ../../scripts/fix-strapi-config.ts

(async () => {
  const strapi = (global as any).strapi;

  console.log('Deleting broken Content Manager configurations...');

  // Delete all content manager configurations to reset
  const deleted = await strapi.db.query('strapi::core-store').deleteMany({
    where: {
      key: {
        $startsWith: 'plugin_content_manager_configuration_content_types',
      },
    },
  });

  console.log(`Deleted ${deleted.count} configuration entries`);
  console.log('Done! Restart Strapi to regenerate default configurations.');

  process.exit(0);
})();
