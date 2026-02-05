module.exports = {
  apps: [
    {
      name: "botpro-bot",
      script: "bot/index.js",  // caminho relativo
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
