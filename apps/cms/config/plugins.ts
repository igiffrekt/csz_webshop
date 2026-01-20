export default ({ env }) => ({
  upload: {
    config: {
      provider: 'local',
      providerOptions: {
        localServer: {
          maxage: 300000,
        },
      },
      sizeLimit: 50 * 1024 * 1024, // 50MB for PDF certificates
      breakpoints: {
        xlarge: 1920,
        large: 1000,
        medium: 750,
        small: 500,
        xsmall: 64,
      },
    },
  },
});
