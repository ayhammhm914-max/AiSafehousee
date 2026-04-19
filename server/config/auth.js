const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const NODE_ENV = process.env.NODE_ENV || 'development';
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'ai_safehouse_auth';
const AUTH_COOKIE_MAX_AGE_MS = Number(process.env.AUTH_COOKIE_MAX_AGE_MS || 7 * 24 * 60 * 60 * 1000);
const FLOW_COOKIE_MAX_AGE_MS = Number(process.env.FLOW_COOKIE_MAX_AGE_MS || 10 * 60 * 1000);
const COOKIE_SAME_SITE = process.env.COOKIE_SAME_SITE || 'lax';
const IS_PRODUCTION = NODE_ENV === 'production';

function getSharedCookieOptions(maxAge) {
  return {
    httpOnly: true,
    sameSite: COOKIE_SAME_SITE,
    secure: IS_PRODUCTION,
    path: '/',
    maxAge,
  };
}

function getApplePrivateKey() {
  return (process.env.APPLE_PRIVATE_KEY || '').replace(/\\n/g, '\n').trim();
}

function isGoogleConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REDIRECT_URI
  );
}

function isAppleConfigured() {
  return Boolean(
    process.env.APPLE_CLIENT_ID &&
    process.env.APPLE_TEAM_ID &&
    process.env.APPLE_KEY_ID &&
    process.env.APPLE_REDIRECT_URI &&
    getApplePrivateKey()
  );
}

module.exports = {
  CLIENT_URL,
  NODE_ENV,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_MAX_AGE_MS,
  FLOW_COOKIE_MAX_AGE_MS,
  COOKIE_SAME_SITE,
  IS_PRODUCTION,
  getSharedCookieOptions,
  getApplePrivateKey,
  isGoogleConfigured,
  isAppleConfigured,
};
