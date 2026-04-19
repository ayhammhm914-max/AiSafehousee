const jwt = require('jsonwebtoken');
const { AUTH_COOKIE_NAME, JWT_SECRET } = require('../config/auth');
const { createAuthError, getUserById } = require('../services/authService');

async function attachUserFromCookie(req, res, next) {
  const token = req.cookies?.[AUTH_COOKIE_NAME];

  if (!token || !JWT_SECRET) {
    return next();
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await getUserById(payload.sub);

    if (user) {
      req.auth = payload;
      req.user = user;
    }
  } catch {
    // ignore invalid guest cookies here; protected routes use requireAuth instead
  }

  return next();
}

module.exports = {
  attachUserFromCookie,
};
