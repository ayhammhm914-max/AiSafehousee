const db = require('../config/db');

async function tableExists(tableName) {
  const [rows] = await db.query('SHOW TABLES LIKE ?', [tableName]);
  return rows.length > 0;
}

async function columnExists(tableName, columnName) {
  const [rows] = await db.query(`SHOW COLUMNS FROM ${tableName} LIKE ?`, [columnName]);
  return rows.length > 0;
}

async function indexExists(tableName, indexName) {
  const [rows] = await db.query(`SHOW INDEX FROM ${tableName} WHERE Key_name = ?`, [indexName]);
  return rows.length > 0;
}

async function run() {
  if (!(await tableExists('users'))) {
    throw new Error('The users table does not exist in the configured database.');
  }

  if (!(await columnExists('users', 'name'))) {
    await db.query('ALTER TABLE users ADD COLUMN name VARCHAR(150) NULL AFTER username');
  }

  if (!(await columnExists('users', 'avatar_url'))) {
    await db.query('ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255) NULL AFTER email');
  }

  if (!(await columnExists('users', 'updated_at'))) {
    await db.query('ALTER TABLE users ADD COLUMN updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at');
  }

  await db.query('UPDATE users SET email = LOWER(email) WHERE email IS NOT NULL');
  await db.query("UPDATE users SET email = NULL WHERE email IS NOT NULL AND TRIM(email) = ''");
  await db.query("UPDATE users SET name = username WHERE (name IS NULL OR TRIM(name) = '') AND username IS NOT NULL");

  const [duplicateEmails] = await db.query(`
    SELECT email, COUNT(*) AS duplicates
    FROM users
    WHERE email IS NOT NULL
    GROUP BY email
    HAVING COUNT(*) > 1
  `);

  if (duplicateEmails.length) {
    const emails = duplicateEmails.map(row => row.email).join(', ');
    throw new Error(`Cannot add a unique email index because duplicate emails already exist: ${emails}`);
  }

  if (!(await indexExists('users', 'uq_users_email'))) {
    await db.query('ALTER TABLE users ADD UNIQUE KEY uq_users_email (email)');
  }

  if (!(await tableExists('auth_accounts'))) {
    await db.query(`
      CREATE TABLE auth_accounts (
        auth_account_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        provider ENUM('local', 'google', 'apple') NOT NULL,
        provider_id VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NULL,
        provider_email VARCHAR(255) NULL,
        email_verified TINYINT(1) NOT NULL DEFAULT 0,
        profile_json JSON NULL,
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_auth_provider_provider_id (provider, provider_id),
        UNIQUE KEY uq_auth_user_provider (user_id, provider),
        CONSTRAINT fk_auth_accounts_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
  }

  if (await columnExists('users', 'password')) {
    await db.query(`
      INSERT INTO auth_accounts (
        user_id,
        provider,
        provider_id,
        password_hash,
        provider_email,
        email_verified,
        profile_json
      )
      SELECT
        user_id,
        'local',
        CONCAT('local-', user_id),
        password,
        email,
        CASE WHEN email IS NULL THEN 0 ELSE 1 END,
        JSON_OBJECT('migratedFrom', 'users.password', 'migratedAt', NOW())
      FROM users
      WHERE password IS NOT NULL AND TRIM(password) <> ''
      ON DUPLICATE KEY UPDATE
        password_hash = COALESCE(VALUES(password_hash), password_hash),
        provider_email = COALESCE(VALUES(provider_email), provider_email),
        email_verified = GREATEST(email_verified, VALUES(email_verified)),
        updated_at = CURRENT_TIMESTAMP
    `);

    await db.query('ALTER TABLE users DROP COLUMN password');
  }

  const [userCountRows] = await db.query('SELECT COUNT(*) AS totalUsers FROM users');
  const [authCountRows] = await db.query('SELECT COUNT(*) AS totalAuthAccounts FROM auth_accounts');

  console.log('Auth migration completed successfully.');
  console.log(`Users: ${userCountRows[0].totalUsers}`);
  console.log(`Auth accounts: ${authCountRows[0].totalAuthAccounts}`);
}

run()
  .catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await db.end();
    } catch (error) {
      // ignore pool shutdown noise
    }
  });
