export default {
  routes: [
    {
      method: 'GET',
      path: '/profile/me',
      handler: 'profile.me',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/profile/me',
      handler: 'profile.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
