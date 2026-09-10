const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/supportdesk',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret_for_development_only',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d'
};

module.exports = env;
