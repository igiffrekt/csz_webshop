import { PLUGIN_ID } from './pluginId';

export default {
  register(app: any) {
    app.addMenuLink({
      to: `plugins/${PLUGIN_ID}`,
      icon: () => {
        // Using a simple text icon to avoid JSX issues
        return null;
      },
      intlLabel: {
        id: `${PLUGIN_ID}.plugin.name`,
        defaultMessage: 'Kategória szűrő',
      },
      permissions: [],
      Component: () => import('./pages/App').then((mod) => ({ default: mod.App })),
    });

    app.registerPlugin({
      id: PLUGIN_ID,
      name: PLUGIN_ID,
    });
  },

  bootstrap() {},

  async registerTrads({ locales }: { locales: string[] }) {
    return locales.map((locale: string) => ({
      data: {
        [`${PLUGIN_ID}.plugin.name`]: 'Kategória szűrő',
      },
      locale,
    }));
  },
};
