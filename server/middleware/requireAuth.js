const jwt = require('jsonwebtoken');
const { AUTH_COOKIE_NAME, JWT_SECRET } = require('../config/auth');
const { createAuthError, getUserById } = require('../services/authService');

async function requireAuth(req, res, next) {
  const token = req.cookies?.[AUTH_COOKIE_NAME];

  if (!token) {
    return next(createAuthError('Authentication required.', 401, 'AUTH_REQUIRED'));
  }

  if (!JWT_SECRET) {
    return next(createAuthError('JWT secret is not configured on the server.', 500, 'JWT_SECRET_MISSING'));
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await getUserById(payload.sub);

    if (!user) {
      return next(createAuthError('The active session no longer matches a valid user.', 401, 'SESSION_USER_MISSING'));
    }

    req.auth = payload;
    req.user = user;
    return next();
  } catch (error) {
    return next(createAuthError('Your session is invalid or expired. Please sign in again.', 401, 'INVALID_SESSION'));
  }
}

module.exports = {
  requireAuth,
};
