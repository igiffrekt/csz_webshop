import { factories } from '@strapi/strapi';

// Category controller - productCount is now stored in database
// and automatically updated via product lifecycle hooks
export default factories.createCoreController('api::category.category');
