module.exports = {
  apps: [
    {
      name: 'workday-controller',
      script: './workday-controller.js',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        START_HOUR: 8,    // Start at 8 AM
        WORK_HOURS: 8     // Run for 8 hours
      }
    }
  ]
};
