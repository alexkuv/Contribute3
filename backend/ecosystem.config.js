// backend/ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'backend',
      script: './dist/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 8000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 8000,
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './logs/app-error.log',
      out_file: './logs/app-out.log',
      combine_logs: true,
      cwd: './',
    },
  ],
};
