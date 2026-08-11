module.exports = {
  apps: [{
    name: 'admin_nuxt4',
    script: '.output/server/index.mjs',
    cwd: '/var/www/admin_nuxt4/current',
    watch: false,
    instances: 1,
    autorestart: true,
    max_restarts: 3,
    env_file: '.env.production',
    env: {
      PORT: 3003,
      NODE_ENV: 'production'
    }
  }]
}
