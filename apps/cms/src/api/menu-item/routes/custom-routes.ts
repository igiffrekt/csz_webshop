/**
 * Custom routes for menu-item
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/menu-items/reorder',
      handler: 'menu-item.reorder',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/menu-items/tree',
      handler: 'menu-item.tree',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
