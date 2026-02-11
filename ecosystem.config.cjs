module.exports = {
  apps: [
    {
      name: 'csz-webshop',
      script: 'apps/web/.next/standalone/apps/web/server.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        HOSTNAME: '127.0.0.1',
        PORT: 3000,
      },
      max_memory_restart: '512M',
      autorestart: true,
      watch: false,
      out_file: 'logs/out.log',
      error_file: 'logs/error.log',
      merge_logs: true,
      time: true,
    },
  ],
}
