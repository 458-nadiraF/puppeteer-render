module.exports = {
  apps: [
    {
      name: 'stock-monitor',
      script: 'index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'ngrok-scheduler',
      script: '/usr/src/app/start_ngrok.sh',
      interpreter: '/bin/bash',
      cron_restart: '0 8 * * 1-5',  // Run at 8 AM Monday-Friday
      autorestart: false
    }
  ]
};
