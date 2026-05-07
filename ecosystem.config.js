module.exports = {
  apps: [{
    name: 'museum',
    script: 'npm',
    args: 'start -- --port 3001',
    cwd: '/opt/museum',
    env: {
      NODE_ENV: 'production',
      MONGODB_URI: 'mongodb://museum_admin:Museum%402026Secure@127.0.0.1:27017/museum',
      MONGO_DB_NAME: 'museum',
      DEFAULT_PASSWORD: '123456'
    }
  }]
};
