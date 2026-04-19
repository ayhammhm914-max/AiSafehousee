USE ai_safehouse;

CREATE TABLE chat_sessions (
  session_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(160) NOT NULL DEFAULT 'New AiMaster Session',
  summary TEXT NULL,
  last_user_prompt TEXT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_chat_sessions_user_updated (user_id, updated_at DESC),
  CONSTRAINT fk_chat_sessions_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE chat_messages (
  message_id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  role ENUM('system', 'user', 'assistant') NOT NULL,
  content LONGTEXT NOT NULL,
  metadata_json JSON NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_chat_messages_session_created (session_id, created_at, message_id),
  CONSTRAINT fk_chat_messages_session FOREIGN KEY (session_id) REFERENCES chat_sessions(session_id) ON DELETE CASCADE
);

CREATE TABLE chat_message_tools (
  suggestion_id INT AUTO_INCREMENT PRIMARY KEY,
  message_id INT NOT NULL,
  model_id INT NOT NULL,
  rank_order INT NOT NULL,
  reason VARCHAR(255) NULL,
  relevance_score DECIMAL(6,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_chat_message_tool_rank (message_id, rank_order),
  INDEX idx_chat_message_tools_model (model_id),
  CONSTRAINT fk_chat_message_tools_message FOREIGN KEY (message_id) REFERENCES chat_messages(message_id) ON DELETE CASCADE,
  CONSTRAINT fk_chat_message_tools_model FOREIGN KEY (model_id) REFERENCES ai_models(model_id) ON DELETE CASCADE
);
