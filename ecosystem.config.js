module.exports = {
  apps: [
    {
      name: "botpro-bot",
      script: "bot/index.js",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "botpro-web",
      script: "web/app.js",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
