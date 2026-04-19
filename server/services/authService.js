const bcrypt = require('bcryptjs');
const db = require('../config/db');

function createAuthError(message, statusCode = 400, code = 'AUTH_ERROR') {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function titleCase(value) {
  return value
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function deriveNameFromEmail(email) {
  if (!email || !email.includes('@')) {
    return 'Safehouse User';
  }

  const localPart = email.split('@')[0].replace(/[^a-zA-Z0-9]+/g, ' ').trim();
  return localPart ? titleCase(localPart) : 'Safehouse User';
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

function parseProviders(value) {
  if (!value) return [];
  return String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

function mapUser(row) {
  if (!row) return null;

  return {
    user_id: row.user_id,
    username: row.username,
    name: row.name || row.username,
    email: row.email,
    avatar_url: row.avatar_url,
    created_at: row.created_at,
    updated_at: row.updated_at,
    providers: parseProviders(row.providers),
  };
}

async function getUserById(userId) {
  const [rows] = await db.query(
    `SELECT
       u.user_id,
       u.username,
       u.name,
       u.email,
       u.avatar_url,
       u.created_at,
       u.updated_at,
       GROUP_CONCAT(DISTINCT a.provider ORDER BY a.provider SEPARATOR ',') AS providers
     FROM users u
     LEFT JOIN auth_accounts a ON a.user_id = u.user_id
     WHERE u.user_id = ?
     GROUP BY u.user_id, u.username, u.name, u.email, u.avatar_url, u.created_at, u.updated_at
     LIMIT 1`,
    [userId]
  );

  return mapUser(rows[0]);
}

async function getUserByEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;

  const [rows] = await db.query(
    `SELECT
       u.user_id,
       u.username,
       u.name,
       u.email,
       u.avatar_url,
       u.created_at,
       u.updated_at,
       GROUP_CONCAT(DISTINCT a.provider ORDER BY a.provider SEPARATOR ',') AS providers
     FROM users u
     LEFT JOIN auth_accounts a ON a.user_id = u.user_id
     WHERE u.email = ?
     GROUP BY u.user_id, u.username, u.name, u.email, u.avatar_url, u.created_at, u.updated_at
     LIMIT 1`,
    [normalizedEmail]
  );

  return mapUser(rows[0]);
}

async function getAuthAccount(provider, providerId) {
  const [rows] = await db.query(
    `SELECT
       a.auth_account_id,
       a.user_id,
       a.provider,
       a.provider_id,
       a.password_hash,
       a.provider_email,
       a.email_verified,
       u.username,
       u.name,
       u.email,
       u.avatar_url,
       u.created_at,
       u.updated_at,
       GROUP_CONCAT(DISTINCT linked.provider ORDER BY linked.provider SEPARATOR ',') AS providers
     FROM auth_accounts a
     JOIN users u ON u.user_id = a.user_id
     LEFT JOIN auth_accounts linked ON linked.user_id = u.user_id
     WHERE a.provider = ? AND a.provider_id = ?
     GROUP BY a.auth_account_id, a.user_id, a.provider, a.provider_id, a.password_hash, a.provider_email, a.email_verified,
              u.username, u.name, u.email, u.avatar_url, u.created_at, u.updated_at
     LIMIT 1`,
    [provider, providerId]
  );

  if (!rows.length) {
    return null;
  }

  return {
    ...rows[0],
    user: mapUser(rows[0]),
  };
}

async function getLocalAccountByEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;

  const [rows] = await db.query(
    `SELECT
       u.user_id,
       u.username,
       u.name,
       u.email,
       u.avatar_url,
       u.created_at,
       u.updated_at,
       a.auth_account_id,
       a.password_hash,
       GROUP_CONCAT(DISTINCT linked.provider ORDER BY linked.provider SEPARATOR ',') AS providers
     FROM users u
     JOIN auth_accounts a ON a.user_id = u.user_id AND a.provider = 'local'
     LEFT JOIN auth_accounts linked ON linked.user_id = u.user_id
     WHERE u.email = ?
     GROUP BY u.user_id, u.username, u.name, u.email, u.avatar_url, u.created_at, u.updated_at, a.auth_account_id, a.password_hash
     LIMIT 1`,
    [normalizedEmail]
  );

  if (!rows.length) {
    return null;
  }

  return {
    ...rows[0],
    user: mapUser(rows[0]),
  };
}

async function generateUniqueUsername(seed) {
  const base = slugify(seed || 'safehouse-user') || 'safehouse-user';
  let attempt = base;
  let counter = 1;

  while (true) {
    const [rows] = await db.query('SELECT user_id FROM users WHERE username = ? LIMIT 1', [attempt]);
    if (!rows.length) {
      return attempt;
    }

    counter += 1;
    const suffix = `-${counter}`;
    attempt = `${base.slice(0, Math.max(1, 48 - suffix.length))}${suffix}`;
  }
}

async function createUser({ name, email, avatarUrl }) {
  const normalizedEmail = normalizeEmail(email) || null;
  const resolvedName = normalizeText(name) || deriveNameFromEmail(normalizedEmail);
  const username = await generateUniqueUsername(resolvedName);

  const [result] = await db.query(
    'INSERT INTO users (username, name, email, avatar_url) VALUES (?, ?, ?, ?)',
    [username, resolvedName, normalizedEmail, avatarUrl || null]
  );

  return getUserById(result.insertId);
}

async function updateUserProfile(userId, { name, email, avatarUrl }) {
  const existingUser = await getUserById(userId);
  if (!existingUser) {
    return null;
  }

  const normalizedEmail = normalizeEmail(email);
  const updates = [];
  const params = [];

  if (normalizeText(name) && !existingUser.name) {
    updates.push('name = ?');
    params.push(normalizeText(name));
  }

  if (avatarUrl && !existingUser.avatar_url) {
    updates.push('avatar_url = ?');
    params.push(avatarUrl);
  }

  if (normalizedEmail && !existingUser.email) {
    updates.push('email = ?');
    params.push(normalizedEmail);
  }

  if (updates.length) {
    params.push(userId);
    await db.query(`UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`, params);
  }

  return getUserById(userId);
}

async function linkAuthAccount({ userId, provider, providerId, passwordHash = null, providerEmail = null, emailVerified = false, profile = null }) {
  await db.query(
    `INSERT INTO auth_accounts (
       user_id,
       provider,
       provider_id,
       password_hash,
       provider_email,
       email_verified,
       profile_json
     )
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       password_hash = COALESCE(VALUES(password_hash), password_hash),
       provider_email = COALESCE(VALUES(provider_email), provider_email),
       email_verified = GREATEST(email_verified, VALUES(email_verified)),
       profile_json = COALESCE(VALUES(profile_json), profile_json),
       updated_at = CURRENT_TIMESTAMP`,
    [
      userId,
      provider,
      providerId,
      passwordHash,
      normalizeEmail(providerEmail) || null,
      emailVerified ? 1 : 0,
      profile ? JSON.stringify(profile) : null,
    ]
  );
}

async function registerLocalUser({ email, password, name }) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    throw createAuthError('A valid email address is required.', 400, 'EMAIL_REQUIRED');
  }

  const existingUser = await getUserByEmail(normalizedEmail);
  const passwordHash = await bcrypt.hash(password, 12);

  if (existingUser) {
    const [localRows] = await db.query(
      'SELECT auth_account_id FROM auth_accounts WHERE user_id = ? AND provider = ? LIMIT 1',
      [existingUser.user_id, 'local']
    );

    if (localRows.length) {
      throw createAuthError('An account with this email already exists. Please log in instead.', 409, 'EMAIL_ALREADY_USED');
    }

    await linkAuthAccount({
      userId: existingUser.user_id,
      provider: 'local',
      providerId: `local-${existingUser.user_id}`,
      passwordHash,
      providerEmail: normalizedEmail,
      emailVerified: true,
      profile: { linkedAt: new Date().toISOString() },
    });

    if (normalizeText(name)) {
      await updateUserProfile(existingUser.user_id, { name });
    }

    return getUserById(existingUser.user_id);
  }

  const user = await createUser({
    name,
    email: normalizedEmail,
    avatarUrl: null,
  });

  await linkAuthAccount({
    userId: user.user_id,
    provider: 'local',
    providerId: `local-${user.user_id}`,
    passwordHash,
    providerEmail: normalizedEmail,
    emailVerified: true,
    profile: { createdAt: new Date().toISOString() },
  });

  return getUserById(user.user_id);
}

async function loginLocalUser({ email, password }) {
  const normalizedEmail = normalizeEmail(email);
  const localAccount = await getLocalAccountByEmail(normalizedEmail);

  if (!localAccount || !localAccount.password_hash) {
    throw createAuthError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  const passwordMatches = await bcrypt.compare(password, localAccount.password_hash);
  if (!passwordMatches) {
    throw createAuthError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  return localAccount.user;
}

async function provisionSocialUser({ provider, providerId, email, emailVerified, name, avatarUrl, profile }) {
  const existingAuthAccount = await getAuthAccount(provider, providerId);

  if (existingAuthAccount) {
    await linkAuthAccount({
      userId: existingAuthAccount.user_id,
      provider,
      providerId,
      providerEmail: email,
      emailVerified,
      profile,
    });

    await updateUserProfile(existingAuthAccount.user_id, {
      name,
      email: emailVerified ? email : null,
      avatarUrl,
    });

    return getUserById(existingAuthAccount.user_id);
  }

  const normalizedEmail = normalizeEmail(email);

  if (normalizedEmail && emailVerified) {
    const existingUser = await getUserByEmail(normalizedEmail);

    if (existingUser) {
      await linkAuthAccount({
        userId: existingUser.user_id,
        provider,
        providerId,
        providerEmail: normalizedEmail,
        emailVerified,
        profile,
      });

      await updateUserProfile(existingUser.user_id, {
        name,
        email: normalizedEmail,
        avatarUrl,
      });

      return getUserById(existingUser.user_id);
    }
  }

  if (!normalizedEmail) {
    throw createAuthError('This social login did not return a usable email address. Please use email/password or retry after sharing email access.', 400, 'SOCIAL_EMAIL_MISSING');
  }

  const user = await createUser({
    name,
    email: normalizedEmail,
    avatarUrl,
  });

  await linkAuthAccount({
    userId: user.user_id,
    provider,
    providerId,
    providerEmail: normalizedEmail,
    emailVerified,
    profile,
  });

  return getUserById(user.user_id);
}

module.exports = {
  createAuthError,
  normalizeEmail,
  normalizeText,
  getUserById,
  getUserByEmail,
  registerLocalUser,
  loginLocalUser,
  provisionSocialUser,
};
