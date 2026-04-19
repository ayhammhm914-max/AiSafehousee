USE ai_safehouse;

ALTER TABLE users
  ADD COLUMN name VARCHAR(150) NULL AFTER username,
  ADD COLUMN avatar_url VARCHAR(255) NULL AFTER email,
  ADD COLUMN updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

UPDATE users
SET email = LOWER(email)
WHERE email IS NOT NULL;

UPDATE users
SET email = NULL
WHERE email IS NOT NULL AND TRIM(email) = '';

UPDATE users
SET name = username
WHERE (name IS NULL OR TRIM(name) = '') AND username IS NOT NULL;

ALTER TABLE users
  ADD UNIQUE KEY uq_users_email (email);

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
);

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
WHERE password IS NOT NULL AND TRIM(password) <> '';

ALTER TABLE users DROP COLUMN password;
