export default ({ env }) => ({
  // Preview button for content preview
  'preview-button': {
    enabled: true,
    config: {
      contentTypes: [
        {
          uid: 'api::product.product',
          draft: {
            url: env('FRONTEND_URL', 'http://localhost:3000') + '/hu/termekek/{slug}?preview=true',
          },
          published: {
            url: env('FRONTEND_URL', 'http://localhost:3000') + '/hu/termekek/{slug}',
          },
        },
        {
          uid: 'api::category.category',
          draft: {
            url: env('FRONTEND_URL', 'http://localhost:3000') + '/hu/kategoriak/{slug}?preview=true',
          },
          published: {
            url: env('FRONTEND_URL', 'http://localhost:3000') + '/hu/kategoriak/{slug}',
          },
        },
        {
          uid: 'api::page.page',
          draft: {
            url: env('FRONTEND_URL', 'http://localhost:3000') + '/hu/{slug}?preview=true',
          },
          published: {
            url: env('FRONTEND_URL', 'http://localhost:3000') + '/hu/{slug}',
          },
        },
      ],
    },
  },
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
      // Password reset URL - Strapi will append ?code=<token> to this URL
      advanced: {
        email_reset_password: env('STRAPI_RESET_PASSWORD_URL', 'http://localhost:3000/hu/auth/jelszo-visszaallitas'),
      },
    },
  },
});
