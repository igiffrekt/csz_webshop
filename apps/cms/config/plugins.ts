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
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST', 'sandbox.smtp.mailtrap.io'),
        port: env.int('SMTP_PORT', 587),
        auth: {
          user: env('SMTP_USERNAME'),
          pass: env('SMTP_PASSWORD'),
        },
      },
      settings: {
        defaultFrom: env('SMTP_FROM', 'noreply@csz-webshop.hu'),
        defaultReplyTo: env('SMTP_REPLY_TO', 'info@csz-webshop.hu'),
      },
    },
  },
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '7d',
      },
      register: {
        allowedFields: ['firstName', 'lastName', 'phone', 'companyName', 'vatNumber'],
      },
      ratelimit: {
        enabled: true,
        interval: { min: 5 },
        max: 5,
      },
    },
  },
});
