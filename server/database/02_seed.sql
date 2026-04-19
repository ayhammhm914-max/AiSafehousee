USE ai_safehouse;

INSERT INTO Users (username, email, password, role, avatar_url, bio, is_active)
VALUES
  ('safehouse_admin', 'admin@aisafehouse.local', '$2b$10$G4r56HOd82M3WBZT3Y.ISuMx1tXCDK4gmQHziEYVdqyXPb0mh.ywu', 'admin', 'https://ui-avatars.com/api/?name=Admin&background=0f172a&color=67e8f9', 'Main project administrator account.', TRUE),
  ('ali_sultan', 'ali@student.local', '$2b$10$G4r56HOd82M3WBZT3Y.ISuMx1tXCDK4gmQHziEYVdqyXPb0mh.ywu', 'user', 'https://ui-avatars.com/api/?name=Ali&background=312e81&color=ffffff', 'Demo reviewer and student owner.', TRUE),
  ('ayham_sharif', 'ayham@student.local', '$2b$10$G4r56HOd82M3WBZT3Y.ISuMx1tXCDK4gmQHziEYVdqyXPb0mh.ywu', 'user', 'https://ui-avatars.com/api/?name=Ayham&background=1d4ed8&color=ffffff', 'Demo reviewer and student collaborator.', TRUE),
  ('noor_demo', 'noor@student.local', '$2b$10$G4r56HOd82M3WBZT3Y.ISuMx1tXCDK4gmQHziEYVdqyXPb0mh.ywu', 'user', 'https://ui-avatars.com/api/?name=Noor&background=7c3aed&color=ffffff', 'Demo user for activity data.', TRUE)
ON DUPLICATE KEY UPDATE
  email = VALUES(email),
  password = VALUES(password),
  role = VALUES(role),
  avatar_url = VALUES(avatar_url),
  bio = VALUES(bio),
  is_active = VALUES(is_active);

INSERT INTO User_Settings (user_id, theme, language_code, notifications_enabled, email_updates)
SELECT user_id, 'dark', 'en', TRUE, FALSE
FROM Users
WHERE username IN ('safehouse_admin', 'ali_sultan', 'ayham_sharif', 'noor_demo')
ON DUPLICATE KEY UPDATE
  theme = VALUES(theme),
  language_code = VALUES(language_code),
  notifications_enabled = VALUES(notifications_enabled),
  email_updates = VALUES(email_updates);

INSERT INTO Categories (name, icon, description)
VALUES
  ('Text & Writing', 'WR', 'Writing assistants, research copilots, and prompt-driven text systems.'),
  ('Image & Art', 'IM', 'Image generation, concept art, and creative visual tools.'),
  ('Code & Dev', 'CD', 'Developer-focused copilots, debugging helpers, and coding assistants.'),
  ('Video', 'VD', 'Video generation, storyboard systems, and cinematic production tools.'),
  ('Audio & Music', 'AU', 'Voice, speech, sound design, and music-related AI experiences.'),
  ('Productivity', 'PR', 'Organization, summarization, workflow, and productivity tools.')
ON DUPLICATE KEY UPDATE
  icon = VALUES(icon),
  description = VALUES(description);

INSERT INTO AI_Models (
  category_id,
  created_by,
  name,
  description,
  website_url,
  logo_url,
  model_type,
  is_free,
  pricing_label,
  tags,
  status
)
VALUES
  ((SELECT category_id FROM Categories WHERE name = 'Text & Writing'), (SELECT user_id FROM Users WHERE username = 'safehouse_admin'), 'ChatGPT', 'General-purpose conversational AI for writing, ideation, tutoring, and structured assistance.', 'https://chat.openai.com', 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg', 'text', TRUE, 'Freemium', 'chat,writing,research,assistant', 'active'),
  ((SELECT category_id FROM Categories WHERE name = 'Text & Writing'), (SELECT user_id FROM Users WHERE username = 'safehouse_admin'), 'Claude', 'Long-context AI assistant focused on reasoning, analysis, and high-quality written output.', 'https://claude.ai', 'https://www.anthropic.com/images/icons/apple-touch-icon.png', 'text', TRUE, 'Freemium', 'analysis,writing,long-context,assistant', 'active'),
  ((SELECT category_id FROM Categories WHERE name = 'Image & Art'), (SELECT user_id FROM Users WHERE username = 'safehouse_admin'), 'Midjourney', 'Image generation platform for concept art, branding visuals, and stylized creative outputs.', 'https://www.midjourney.com', 'https://www.midjourney.com/favicon.ico', 'vision', FALSE, 'Paid', 'image,art,design,concept', 'active'),
  ((SELECT category_id FROM Categories WHERE name = 'Code & Dev'), (SELECT user_id FROM Users WHERE username = 'safehouse_admin'), 'GitHub Copilot', 'AI coding companion for code completion, refactoring, and developer productivity.', 'https://github.com/features/copilot', 'https://github.githubassets.com/favicons/favicon-dark.png', 'code', FALSE, 'Paid', 'code,developer,refactor,assistant', 'active'),
  ((SELECT category_id FROM Categories WHERE name = 'Video'), (SELECT user_id FROM Users WHERE username = 'safehouse_admin'), 'Sora', 'Video generation model for turning prompts into cinematic scenes and motion concepts.', 'https://openai.com/sora', 'https://openai.com/favicon.ico', 'vision', FALSE, 'Paid', 'video,generation,storyboard,motion', 'active'),
  ((SELECT category_id FROM Categories WHERE name = 'Audio & Music'), (SELECT user_id FROM Users WHERE username = 'safehouse_admin'), 'ElevenLabs', 'Speech and voice platform for narration, dubbing, and audio experiments.', 'https://elevenlabs.io', 'https://elevenlabs.io/favicon.ico', 'text', TRUE, 'Freemium', 'audio,voice,speech,narration', 'active'),
  ((SELECT category_id FROM Categories WHERE name = 'Productivity'), (SELECT user_id FROM Users WHERE username = 'safehouse_admin'), 'Notion AI', 'Workspace AI that summarizes notes, writes drafts, and improves team productivity.', 'https://www.notion.so/product/ai', 'https://www.notion.so/front-static/favicon.ico', 'text', TRUE, 'Freemium', 'productivity,notes,summary,workspace', 'active'),
  ((SELECT category_id FROM Categories WHERE name = 'Text & Writing'), (SELECT user_id FROM Users WHERE username = 'safehouse_admin'), 'Perplexity', 'Answer engine for research-heavy tasks with concise synthesis and web-assisted exploration.', 'https://www.perplexity.ai', 'https://www.perplexity.ai/favicon.ico', 'text', TRUE, 'Freemium', 'research,answers,search,writing', 'active')
ON DUPLICATE KEY UPDATE
  category_id = VALUES(category_id),
  created_by = VALUES(created_by),
  description = VALUES(description),
  website_url = VALUES(website_url),
  logo_url = VALUES(logo_url),
  model_type = VALUES(model_type),
  is_free = VALUES(is_free),
  pricing_label = VALUES(pricing_label),
  tags = VALUES(tags),
  status = VALUES(status);

INSERT INTO Text_Models (model_id, max_words, supports_multilingual)
VALUES
  ((SELECT model_id FROM AI_Models WHERE name = 'ChatGPT'), 4000, TRUE),
  ((SELECT model_id FROM AI_Models WHERE name = 'Claude'), 6000, TRUE),
  ((SELECT model_id FROM AI_Models WHERE name = 'ElevenLabs'), 2500, TRUE),
  ((SELECT model_id FROM AI_Models WHERE name = 'Notion AI'), 3000, TRUE),
  ((SELECT model_id FROM AI_Models WHERE name = 'Perplexity'), 3000, TRUE)
ON DUPLICATE KEY UPDATE
  max_words = VALUES(max_words),
  supports_multilingual = VALUES(supports_multilingual);

INSERT INTO Vision_Models (model_id, resolution, supports_editing)
VALUES
  ((SELECT model_id FROM AI_Models WHERE name = 'Midjourney'), '1792x1024', FALSE),
  ((SELECT model_id FROM AI_Models WHERE name = 'Sora'), '1920x1080', TRUE)
ON DUPLICATE KEY UPDATE
  resolution = VALUES(resolution),
  supports_editing = VALUES(supports_editing);

INSERT INTO Code_Models (model_id, supported_languages, supports_debugging)
VALUES
  ((SELECT model_id FROM AI_Models WHERE name = 'GitHub Copilot'), 'JavaScript,TypeScript,Python,Java,C++,C#,Go,PHP', TRUE)
ON DUPLICATE KEY UPDATE
  supported_languages = VALUES(supported_languages),
  supports_debugging = VALUES(supports_debugging);

INSERT INTO Reviews (user_id, model_id, rating, comment)
VALUES
  ((SELECT user_id FROM Users WHERE username = 'ali_sultan'), (SELECT model_id FROM AI_Models WHERE name = 'ChatGPT'), 5, 'Excellent for quick ideation and answering course-related questions.'),
  ((SELECT user_id FROM Users WHERE username = 'ayham_sharif'), (SELECT model_id FROM AI_Models WHERE name = 'ChatGPT'), 4, 'Very useful, especially when combined with clear prompts.'),
  ((SELECT user_id FROM Users WHERE username = 'noor_demo'), (SELECT model_id FROM AI_Models WHERE name = 'Claude'), 5, 'Strong reasoning and clean writing style for reports.'),
  ((SELECT user_id FROM Users WHERE username = 'ali_sultan'), (SELECT model_id FROM AI_Models WHERE name = 'Claude'), 4, 'Great for structured analysis and study summaries.'),
  ((SELECT user_id FROM Users WHERE username = 'ayham_sharif'), (SELECT model_id FROM AI_Models WHERE name = 'Midjourney'), 5, 'Perfect for moodboards and visual concept exploration.'),
  ((SELECT user_id FROM Users WHERE username = 'noor_demo'), (SELECT model_id FROM AI_Models WHERE name = 'GitHub Copilot'), 4, 'Speeds up coding, especially boilerplate and refactors.'),
  ((SELECT user_id FROM Users WHERE username = 'ali_sultan'), (SELECT model_id FROM AI_Models WHERE name = 'Sora'), 5, 'Amazing for turning concepts into cinematic video ideas.'),
  ((SELECT user_id FROM Users WHERE username = 'ayham_sharif'), (SELECT model_id FROM AI_Models WHERE name = 'ElevenLabs'), 4, 'Very good for voiceover experiments and clean speech output.'),
  ((SELECT user_id FROM Users WHERE username = 'noor_demo'), (SELECT model_id FROM AI_Models WHERE name = 'Notion AI'), 4, 'Useful for organizing notes and summarizing meeting content.'),
  ((SELECT user_id FROM Users WHERE username = 'ali_sultan'), (SELECT model_id FROM AI_Models WHERE name = 'Perplexity'), 4, 'Helpful for fact-finding and quick research support.')
ON DUPLICATE KEY UPDATE
  rating = VALUES(rating),
  comment = VALUES(comment);

INSERT INTO Contact_Messages (user_id, name, email, subject, message, status)
SELECT (SELECT user_id FROM Users WHERE username = 'ali_sultan'), 'Ali Sultan', 'ali@student.local', 'Admin Access', 'I want a clear admin dashboard for managing tools and reviews.', 'new'
WHERE NOT EXISTS (
  SELECT 1 FROM Contact_Messages WHERE email = 'ali@student.local' AND subject = 'Admin Access'
);

INSERT INTO Contact_Messages (user_id, name, email, subject, message, status)
SELECT (SELECT user_id FROM Users WHERE username = 'ayham_sharif'), 'Ayham Sharif', 'ayham@student.local', 'UI Feedback', 'Please keep the video background but improve readability on mobile screens.', 'read'
WHERE NOT EXISTS (
  SELECT 1 FROM Contact_Messages WHERE email = 'ayham@student.local' AND subject = 'UI Feedback'
);

INSERT INTO Spark_Ideas (user_id, title, idea_text, status)
SELECT (SELECT user_id FROM Users WHERE username = 'ali_sultan'), 'Tool comparison mode', 'Allow users to compare two AI tools side by side based on rating, category, and pricing.', 'reviewing'
WHERE NOT EXISTS (
  SELECT 1 FROM Spark_Ideas WHERE title = 'Tool comparison mode'
);

INSERT INTO Spark_Ideas (user_id, title, idea_text, status)
SELECT (SELECT user_id FROM Users WHERE username = 'noor_demo'), 'Saved recommendation lists', 'Let users save a shortlist of AI tools after chatting with AiMaster Bot.', 'planned'
WHERE NOT EXISTS (
  SELECT 1 FROM Spark_Ideas WHERE title = 'Saved recommendation lists'
);

INSERT INTO Tool_Usage (user_id, model_id, used_for)
SELECT (SELECT user_id FROM Users WHERE username = 'ali_sultan'), (SELECT model_id FROM AI_Models WHERE name = 'ChatGPT'), 'Requirement writing and feature brainstorming'
WHERE NOT EXISTS (
  SELECT 1
  FROM Tool_Usage
  WHERE user_id = (SELECT user_id FROM Users WHERE username = 'ali_sultan')
    AND model_id = (SELECT model_id FROM AI_Models WHERE name = 'ChatGPT')
    AND used_for = 'Requirement writing and feature brainstorming'
);

INSERT INTO Tool_Usage (user_id, model_id, used_for)
SELECT (SELECT user_id FROM Users WHERE username = 'ali_sultan'), (SELECT model_id FROM AI_Models WHERE name = 'Midjourney'), 'Landing page visual exploration'
WHERE NOT EXISTS (
  SELECT 1
  FROM Tool_Usage
  WHERE user_id = (SELECT user_id FROM Users WHERE username = 'ali_sultan')
    AND model_id = (SELECT model_id FROM AI_Models WHERE name = 'Midjourney')
    AND used_for = 'Landing page visual exploration'
);

INSERT INTO Tool_Usage (user_id, model_id, used_for)
SELECT (SELECT user_id FROM Users WHERE username = 'ayham_sharif'), (SELECT model_id FROM AI_Models WHERE name = 'GitHub Copilot'), 'Backend refactoring assistance'
WHERE NOT EXISTS (
  SELECT 1
  FROM Tool_Usage
  WHERE user_id = (SELECT user_id FROM Users WHERE username = 'ayham_sharif')
    AND model_id = (SELECT model_id FROM AI_Models WHERE name = 'GitHub Copilot')
    AND used_for = 'Backend refactoring assistance'
);

INSERT INTO Tool_Usage (user_id, model_id, used_for)
SELECT (SELECT user_id FROM Users WHERE username = 'noor_demo'), (SELECT model_id FROM AI_Models WHERE name = 'Sora'), 'Promo video storyboard ideas'
WHERE NOT EXISTS (
  SELECT 1
  FROM Tool_Usage
  WHERE user_id = (SELECT user_id FROM Users WHERE username = 'noor_demo')
    AND model_id = (SELECT model_id FROM AI_Models WHERE name = 'Sora')
    AND used_for = 'Promo video storyboard ideas'
);

INSERT INTO Chat_Sessions (user_id, title, started_from)
SELECT (SELECT user_id FROM Users WHERE username = 'ali_sultan'), 'Best tools for a startup logo', 'aimaster'
WHERE NOT EXISTS (
  SELECT 1
  FROM Chat_Sessions
  WHERE user_id = (SELECT user_id FROM Users WHERE username = 'ali_sultan')
    AND title = 'Best tools for a startup logo'
);

INSERT INTO Chat_Sessions (user_id, title, started_from)
SELECT (SELECT user_id FROM Users WHERE username = 'ayham_sharif'), 'Need help choosing a coding assistant', 'aimaster'
WHERE NOT EXISTS (
  SELECT 1
  FROM Chat_Sessions
  WHERE user_id = (SELECT user_id FROM Users WHERE username = 'ayham_sharif')
    AND title = 'Need help choosing a coding assistant'
);

INSERT INTO Chat_Messages (session_id, sender, message_text, related_model_id)
SELECT (SELECT session_id FROM Chat_Sessions WHERE title = 'Best tools for a startup logo' LIMIT 1), 'user', 'I need the best AI tools for making a strong startup logo concept.', NULL
WHERE NOT EXISTS (
  SELECT 1
  FROM Chat_Messages
  WHERE session_id = (SELECT session_id FROM Chat_Sessions WHERE title = 'Best tools for a startup logo' LIMIT 1)
    AND sender = 'user'
    AND message_text = 'I need the best AI tools for making a strong startup logo concept.'
);

INSERT INTO Chat_Messages (session_id, sender, message_text, related_model_id)
SELECT (SELECT session_id FROM Chat_Sessions WHERE title = 'Best tools for a startup logo' LIMIT 1), 'assistant', 'Try Midjourney for visual exploration and ChatGPT for refining the brand direction before generating concepts.', (SELECT model_id FROM AI_Models WHERE name = 'Midjourney')
WHERE NOT EXISTS (
  SELECT 1
  FROM Chat_Messages
  WHERE session_id = (SELECT session_id FROM Chat_Sessions WHERE title = 'Best tools for a startup logo' LIMIT 1)
    AND sender = 'assistant'
    AND message_text = 'Try Midjourney for visual exploration and ChatGPT for refining the brand direction before generating concepts.'
);

INSERT INTO Chat_Messages (session_id, sender, message_text, related_model_id)
SELECT (SELECT session_id FROM Chat_Sessions WHERE title = 'Need help choosing a coding assistant' LIMIT 1), 'user', 'Which tool is better for daily coding and refactoring?', NULL
WHERE NOT EXISTS (
  SELECT 1
  FROM Chat_Messages
  WHERE session_id = (SELECT session_id FROM Chat_Sessions WHERE title = 'Need help choosing a coding assistant' LIMIT 1)
    AND sender = 'user'
    AND message_text = 'Which tool is better for daily coding and refactoring?'
);

INSERT INTO Chat_Messages (session_id, sender, message_text, related_model_id)
SELECT (SELECT session_id FROM Chat_Sessions WHERE title = 'Need help choosing a coding assistant' LIMIT 1), 'assistant', 'GitHub Copilot is the strongest match in the current catalog for code completion and refactoring support.', (SELECT model_id FROM AI_Models WHERE name = 'GitHub Copilot')
WHERE NOT EXISTS (
  SELECT 1
  FROM Chat_Messages
  WHERE session_id = (SELECT session_id FROM Chat_Sessions WHERE title = 'Need help choosing a coding assistant' LIMIT 1)
    AND sender = 'assistant'
    AND message_text = 'GitHub Copilot is the strongest match in the current catalog for code completion and refactoring support.'
);
