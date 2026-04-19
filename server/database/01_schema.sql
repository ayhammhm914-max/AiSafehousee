CREATE DATABASE IF NOT EXISTS ai_safehouse
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ai_safehouse;

CREATE TABLE IF NOT EXISTS Users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  avatar_url VARCHAR(255) NULL,
  bio VARCHAR(255) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS User_Settings (
  user_id INT PRIMARY KEY,
  theme ENUM('dark', 'light', 'system') NOT NULL DEFAULT 'dark',
  language_code VARCHAR(10) NOT NULL DEFAULT 'en',
  notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  email_updates BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_settings_user
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS Categories (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(50) NULL,
  description VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS AI_Models (
  model_id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  created_by INT NULL,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  website_url VARCHAR(255) NOT NULL,
  logo_url VARCHAR(255) NULL,
  model_type ENUM('text', 'vision', 'code') NOT NULL,
  is_free BOOLEAN NOT NULL DEFAULT TRUE,
  avg_rating DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  pricing_label VARCHAR(50) NOT NULL DEFAULT 'Free',
  tags VARCHAR(255) NULL,
  status ENUM('active', 'archived') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ai_models_category
    FOREIGN KEY (category_id) REFERENCES Categories(category_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_ai_models_creator
    FOREIGN KEY (created_by) REFERENCES Users(user_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  INDEX idx_ai_models_category (category_id),
  INDEX idx_ai_models_type (model_type),
  INDEX idx_ai_models_rating (avg_rating)
);

CREATE TABLE IF NOT EXISTS Text_Models (
  model_id INT PRIMARY KEY,
  max_words INT NOT NULL,
  supports_multilingual BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_text_models_model
    FOREIGN KEY (model_id) REFERENCES AI_Models(model_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS Vision_Models (
  model_id INT PRIMARY KEY,
  resolution VARCHAR(50) NOT NULL,
  supports_editing BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_vision_models_model
    FOREIGN KEY (model_id) REFERENCES AI_Models(model_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS Code_Models (
  model_id INT PRIMARY KEY,
  supported_languages VARCHAR(255) NOT NULL,
  supports_debugging BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_code_models_model
    FOREIGN KEY (model_id) REFERENCES AI_Models(model_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS Reviews (
  review_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  model_id INT NOT NULL,
  rating TINYINT NOT NULL,
  comment TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT uq_reviews_user_model UNIQUE (user_id, model_id),
  CONSTRAINT fk_reviews_user
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_reviews_model
    FOREIGN KEY (model_id) REFERENCES AI_Models(model_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  INDEX idx_reviews_model_created (model_id, created_at)
);

CREATE TABLE IF NOT EXISTS Contact_Messages (
  contact_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  subject VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('new', 'read', 'resolved') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_contact_messages_user
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS Spark_Ideas (
  idea_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  title VARCHAR(150) NOT NULL,
  idea_text TEXT NOT NULL,
  status ENUM('new', 'reviewing', 'planned', 'implemented') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_spark_ideas_user
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS Tool_Usage (
  usage_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  model_id INT NOT NULL,
  used_for VARCHAR(150) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tool_usage_user
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT fk_tool_usage_model
    FOREIGN KEY (model_id) REFERENCES AI_Models(model_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  INDEX idx_tool_usage_user (user_id),
  INDEX idx_tool_usage_model (model_id)
);

CREATE TABLE IF NOT EXISTS Chat_Sessions (
  session_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  title VARCHAR(150) NOT NULL,
  started_from ENUM('home', 'aimaster', 'admin') NOT NULL DEFAULT 'aimaster',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_chat_sessions_user
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS Chat_Messages (
  message_id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  sender ENUM('user', 'assistant', 'system') NOT NULL,
  message_text TEXT NOT NULL,
  related_model_id INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_chat_messages_session
    FOREIGN KEY (session_id) REFERENCES Chat_Sessions(session_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_chat_messages_model
    FOREIGN KEY (related_model_id) REFERENCES AI_Models(model_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);

DROP TRIGGER IF EXISTS trg_reviews_after_insert;
DROP TRIGGER IF EXISTS trg_reviews_after_update;
DROP TRIGGER IF EXISTS trg_reviews_after_delete;
DROP TRIGGER IF EXISTS trg_text_models_type_check;
DROP TRIGGER IF EXISTS trg_vision_models_type_check;
DROP TRIGGER IF EXISTS trg_code_models_type_check;
DROP VIEW IF EXISTS vw_ai_models_catalog;

DELIMITER $$

CREATE TRIGGER trg_reviews_after_insert
AFTER INSERT ON Reviews
FOR EACH ROW
BEGIN
  UPDATE AI_Models
  SET avg_rating = COALESCE(
    (SELECT ROUND(AVG(r.rating), 2) FROM Reviews r WHERE r.model_id = NEW.model_id),
    0.00
  )
  WHERE model_id = NEW.model_id;
END$$

CREATE TRIGGER trg_reviews_after_update
AFTER UPDATE ON Reviews
FOR EACH ROW
BEGIN
  UPDATE AI_Models
  SET avg_rating = COALESCE(
    (SELECT ROUND(AVG(r.rating), 2) FROM Reviews r WHERE r.model_id = OLD.model_id),
    0.00
  )
  WHERE model_id = OLD.model_id;

  UPDATE AI_Models
  SET avg_rating = COALESCE(
    (SELECT ROUND(AVG(r.rating), 2) FROM Reviews r WHERE r.model_id = NEW.model_id),
    0.00
  )
  WHERE model_id = NEW.model_id;
END$$

CREATE TRIGGER trg_reviews_after_delete
AFTER DELETE ON Reviews
FOR EACH ROW
BEGIN
  UPDATE AI_Models
  SET avg_rating = COALESCE(
    (SELECT ROUND(AVG(r.rating), 2) FROM Reviews r WHERE r.model_id = OLD.model_id),
    0.00
  )
  WHERE model_id = OLD.model_id;
END$$

CREATE TRIGGER trg_text_models_type_check
BEFORE INSERT ON Text_Models
FOR EACH ROW
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM AI_Models
    WHERE model_id = NEW.model_id AND model_type = 'text'
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Text_Models requires AI_Models.model_type = text';
  END IF;
END$$

CREATE TRIGGER trg_vision_models_type_check
BEFORE INSERT ON Vision_Models
FOR EACH ROW
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM AI_Models
    WHERE model_id = NEW.model_id AND model_type = 'vision'
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Vision_Models requires AI_Models.model_type = vision';
  END IF;
END$$

CREATE TRIGGER trg_code_models_type_check
BEFORE INSERT ON Code_Models
FOR EACH ROW
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM AI_Models
    WHERE model_id = NEW.model_id AND model_type = 'code'
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Code_Models requires AI_Models.model_type = code';
  END IF;
END$$

DELIMITER ;

CREATE OR REPLACE VIEW vw_ai_models_catalog AS
SELECT
  m.model_id,
  m.name,
  m.description,
  m.website_url,
  m.logo_url,
  m.model_type,
  m.is_free,
  m.avg_rating,
  m.pricing_label,
  m.tags,
  m.status,
  c.category_id,
  c.name AS category_name,
  c.icon AS category_icon,
  t.max_words,
  t.supports_multilingual,
  v.resolution,
  v.supports_editing,
  cd.supported_languages,
  cd.supports_debugging,
  m.created_at,
  m.updated_at
FROM AI_Models m
JOIN Categories c ON c.category_id = m.category_id
LEFT JOIN Text_Models t ON t.model_id = m.model_id
LEFT JOIN Vision_Models v ON v.model_id = m.model_id
LEFT JOIN Code_Models cd ON cd.model_id = m.model_id;
