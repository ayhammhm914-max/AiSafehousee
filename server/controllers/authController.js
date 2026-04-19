const { randomBytes, createHash } = require('crypto');
const jwt = require('jsonwebtoken');
const {
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_MAX_AGE_MS,
  FLOW_COOKIE_MAX_AGE_MS,
  CLIENT_URL,
  JWT_EXPIRES_IN,
  JWT_SECRET,
  getApplePrivateKey,
  getSharedCookieOptions,
  isAppleConfigured,
  isGoogleConfigured,
} = require('../config/auth');
const {
  createAuthError,
  getUserById,
  loginLocalUser,
  normalizeEmail,
  normalizeText,
  provisionSocialUser,
  registerLocalUser,
} = require('../services/authService');

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const APPLE_AUTH_URL = 'https://appleid.apple.com/auth/authorize';
const APPLE_TOKEN_URL = 'https://appleid.apple.com/auth/token';
const FLOW_COOKIE_PREFIX = 'ai_safehouse_oauth';

function getCookieBaseOptions() {
  const { maxAge, ...base } = getSharedCookieOptions(AUTH_COOKIE_MAX_AGE_MS);
  return base;
}

function getFlowCookieName(provider) {
  return `${FLOW_COOKIE_PREFIX}_${provider}`;
}

function buildClientRedirect(pathname, params = {}) {
  const url = new URL(pathname, CLIENT_URL);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

function createSessionToken(user) {
  if (!JWT_SECRET) {
    throw createAuthError('JWT_SECRET is missing from the server environment.', 500, 'JWT_SECRET_MISSING');
  }

  return jwt.sign(
    {
      sub: user.user_id,
      email: user.email,
      providers: user.providers,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function setAuthCookie(res, user) {
  const token = createSessionToken(user);
  res.cookie(AUTH_COOKIE_NAME, token, getSharedCookieOptions(AUTH_COOKIE_MAX_AGE_MS));
}

function clearAuthCookie(res) {
  res.clearCookie(AUTH_COOKIE_NAME, getCookieBaseOptions());
}

function issueFlowCookie(res, provider, payload) {
  if (!JWT_SECRET) {
    throw createAuthError('JWT_SECRET is missing from the server environment.', 500, 'JWT_SECRET_MISSING');
  }

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: Math.ceil(FLOW_COOKIE_MAX_AGE_MS / 1000) });
  res.cookie(getFlowCookieName(provider), token, getSharedCookieOptions(FLOW_COOKIE_MAX_AGE_MS));
}

function readFlowCookie(req, provider, state) {
  const rawToken = req.cookies?.[getFlowCookieName(provider)];
  if (!rawToken) {
    throw createAuthError('The sign-in request expired. Please try again.', 400, 'OAUTH_FLOW_EXPIRED');
  }

  if (!JWT_SECRET) {
    throw createAuthError('JWT_SECRET is missing from the server environment.', 500, 'JWT_SECRET_MISSING');
  }

  const payload = jwt.verify(rawToken, JWT_SECRET);
  if (!state || payload.state !== state) {
    throw createAuthError('The social login state check failed. Please retry.', 400, 'OAUTH_STATE_INVALID');
  }

  return payload;
}

function clearFlowCookie(res, provider) {
  res.clearCookie(getFlowCookieName(provider), getCookieBaseOptions());
}

function redirectWithError(res, message, provider = 'auth') {
  res.redirect(buildClientRedirect('/login', { error: message, provider }));
}

function randomToken(size = 32) {
  return randomBytes(size).toString('base64url');
}

function createCodeChallenge(codeVerifier) {
  return createHash('sha256').update(codeVerifier).digest('base64url');
}

function parseBoolean(value) {
  return value === true || value === 'true' || value === '1' || value === 1;
}

async function getJose() {
  return import('jose');
}

async function verifyGoogleIdToken(idToken, expectedNonce) {
  const { createRemoteJWKSet, jwtVerify } = await getJose();
  const jwks = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
  const { payload } = await jwtVerify(idToken, jwks, {
    audience: process.env.GOOGLE_CLIENT_ID,
    nonce: expectedNonce,
  });

  if (!['https://accounts.google.com', 'accounts.google.com'].includes(payload.iss)) {
    throw createAuthError('Google returned an unexpected token issuer.', 401, 'GOOGLE_ISSUER_INVALID');
  }

  return payload;
}

async function createAppleClientSecret() {
  const { importPKCS8, SignJWT } = await getJose();
  const privateKey = await importPKCS8(getApplePrivateKey(), 'ES256');

  return new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: process.env.APPLE_KEY_ID })
    .setIssuer(process.env.APPLE_TEAM_ID)
    .setSubject(process.env.APPLE_CLIENT_ID)
    .setAudience('https://appleid.apple.com')
    .setIssuedAt()
    .setExpirationTime('10m')
    .sign(privateKey);
}

async function verifyAppleIdToken(idToken, expectedNonce) {
  const { createRemoteJWKSet, jwtVerify } = await getJose();
  const jwks = createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'));
  const { payload } = await jwtVerify(idToken, jwks, {
    audience: process.env.APPLE_CLIENT_ID,
    issuer: 'https://appleid.apple.com',
    nonce: expectedNonce,
  });

  return payload;
}

async function exchangeCodeForTokens(url, params) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(params).toString(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw createAuthError(data.error_description || data.error || 'The provider refused the authorization code exchange.', 400, 'OAUTH_TOKEN_EXCHANGE_FAILED');
  }

  return data;
}

function validateEmailAndPassword(email, password) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    throw createAuthError('Please enter a valid email address.', 400, 'EMAIL_INVALID');
  }

  if (typeof password !== 'string' || password.length < 8) {
    throw createAuthError('Password must be at least 8 characters long.', 400, 'PASSWORD_TOO_SHORT');
  }

  return normalizedEmail;
}

function formatAppleName(rawUser) {
  if (!rawUser?.name) return '';
  return [rawUser.name.firstName, rawUser.name.lastName].filter(Boolean).join(' ').trim();
}

function sendAuthSuccess(res, statusCode, message, user) {
  setAuthCookie(res, user);
  res.status(statusCode).json({
    message,
    user,
  });
}

exports.getProviders = (req, res) => {
  res.json({
    google: isGoogleConfigured(),
    apple: isAppleConfigured(),
  });
};

exports.register = async (req, res, next) => {
  try {
    const email = validateEmailAndPassword(req.body.email, req.body.password);
    const name = normalizeText(req.body.name);
    const user = await registerLocalUser({
      email,
      password: req.body.password,
      name,
    });

    sendAuthSuccess(res, 201, 'Account created successfully.', user);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const email = validateEmailAndPassword(req.body.email, req.body.password);
    const user = await loginLocalUser({
      email,
      password: req.body.password,
    });

    sendAuthSuccess(res, 200, 'Login successful.', user);
  } catch (error) {
    next(error);
  }
};

exports.logout = (req, res) => {
  clearAuthCookie(res);
  res.json({ message: 'Logged out successfully.' });
};

exports.me = async (req, res, next) => {
  try {
    const user = await getUserById(req.user.user_id);
    if (!user) {
      throw createAuthError('The current user could not be loaded.', 404, 'USER_NOT_FOUND');
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

exports.startGoogle = (req, res, next) => {
  try {
    if (!isGoogleConfigured()) {
      return redirectWithError(res, 'Google sign-in is not configured yet.', 'google');
    }

    const state = randomToken(24);
    const nonce = randomToken(24);
    const codeVerifier = randomToken(48);
    const codeChallenge = createCodeChallenge(codeVerifier);

    issueFlowCookie(res, 'google', { state, nonce, codeVerifier });

    const url = new URL(GOOGLE_AUTH_URL);
    url.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID);
    url.searchParams.set('redirect_uri', process.env.GOOGLE_REDIRECT_URI);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'openid email profile');
    url.searchParams.set('state', state);
    url.searchParams.set('nonce', nonce);
    url.searchParams.set('code_challenge', codeChallenge);
    url.searchParams.set('code_challenge_method', 'S256');
    url.searchParams.set('prompt', 'select_account');

    res.redirect(url.toString());
  } catch (error) {
    next(error);
  }
};

exports.googleCallback = async (req, res, next) => {
  try {
    if (req.query.error) {
      clearFlowCookie(res, 'google');
      return redirectWithError(res, req.query.error_description || 'Google sign-in was canceled.', 'google');
    }

    const code = req.query.code;
    const state = req.query.state;

    if (!code || !state) {
      throw createAuthError('Google did not return the required authorization response.', 400, 'GOOGLE_RESPONSE_INVALID');
    }

    const flow = readFlowCookie(req, 'google', state);
    const tokenData = await exchangeCodeForTokens(GOOGLE_TOKEN_URL, {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code,
      code_verifier: flow.codeVerifier,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    });

    const payload = await verifyGoogleIdToken(tokenData.id_token, flow.nonce);
    const user = await provisionSocialUser({
      provider: 'google',
      providerId: payload.sub,
      email: payload.email,
      emailVerified: parseBoolean(payload.email_verified),
      name: payload.name,
      avatarUrl: payload.picture,
      profile: payload,
    });

    clearFlowCookie(res, 'google');
    setAuthCookie(res, user);
    res.redirect(buildClientRedirect('/auth/callback', { provider: 'google' }));
  } catch (error) {
    clearFlowCookie(res, 'google');
    redirectWithError(res, error.message || 'Google sign-in failed.', 'google');
  }
};

exports.startApple = (req, res, next) => {
  try {
    if (!isAppleConfigured()) {
      return redirectWithError(res, 'Apple sign-in is not configured yet.', 'apple');
    }

    const state = randomToken(24);
    const nonce = randomToken(24);

    issueFlowCookie(res, 'apple', { state, nonce });

    const url = new URL(APPLE_AUTH_URL);
    url.searchParams.set('response_type', 'code id_token');
    url.searchParams.set('response_mode', 'form_post');
    url.searchParams.set('client_id', process.env.APPLE_CLIENT_ID);
    url.searchParams.set('redirect_uri', process.env.APPLE_REDIRECT_URI);
    url.searchParams.set('scope', 'name email');
    url.searchParams.set('state', state);
    url.searchParams.set('nonce', nonce);

    res.redirect(url.toString());
  } catch (error) {
    next(error);
  }
};

exports.appleCallback = async (req, res) => {
  try {
    if (req.body.error || req.query.error) {
      clearFlowCookie(res, 'apple');
      return redirectWithError(res, req.body.error_description || req.query.error_description || 'Apple sign-in was canceled.', 'apple');
    }

    const code = req.body.code || req.query.code;
    const state = req.body.state || req.query.state;
    const callbackIdToken = req.body.id_token || req.query.id_token;
    const rawUser = req.body.user || req.query.user;

    if (!code || !state) {
      throw createAuthError('Apple did not return the required authorization response.', 400, 'APPLE_RESPONSE_INVALID');
    }

    const flow = readFlowCookie(req, 'apple', state);
    const clientSecret = await createAppleClientSecret();
    const tokenData = await exchangeCodeForTokens(APPLE_TOKEN_URL, {
      client_id: process.env.APPLE_CLIENT_ID,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: process.env.APPLE_REDIRECT_URI,
    });

    const idToken = tokenData.id_token || callbackIdToken;
    if (!idToken) {
      throw createAuthError('Apple did not return a usable identity token.', 400, 'APPLE_ID_TOKEN_MISSING');
    }

    const payload = await verifyAppleIdToken(idToken, flow.nonce);
    const parsedUser = typeof rawUser === 'string' ? JSON.parse(rawUser) : rawUser;
    const user = await provisionSocialUser({
      provider: 'apple',
      providerId: payload.sub,
      email: payload.email,
      emailVerified: parseBoolean(payload.email_verified),
      name: formatAppleName(parsedUser) || payload.name || '',
      avatarUrl: null,
      profile: {
        token: payload,
        user: parsedUser || null,
      },
    });

    clearFlowCookie(res, 'apple');
    setAuthCookie(res, user);
    res.redirect(buildClientRedirect('/auth/callback', { provider: 'apple' }));
  } catch (error) {
    clearFlowCookie(res, 'apple');
    redirectWithError(res, error.message || 'Apple sign-in failed.', 'apple');
  }
};
