const db = require('../config/db');
const { createAuthError } = require('./authService');

const DEFAULT_WELCOME_MESSAGE = 'Welcome to AiMaster. Tell me what you want to build, generate, automate, or compare, and I will rank the best tools from your AI Safehouse catalog.';

const SMALL_TALK_RESPONSES = {
  greeting: 'Hey. I am ready. Tell me what you want to build or what kind of AI tool you are looking for, and I will recommend the strongest options from your catalog.',
  thanks: 'You are welcome. If you want, send me the exact task and I will narrow the best tools for it.',
  fallback: 'Tell me your goal in one sentence, like building a landing page, generating a logo, dubbing a video, or choosing a coding assistant.',
};

const CATEGORY_KEYWORDS = [
  { category: 'Video & Editing', keywords: ['video', 'editing', 'edit', 'reels', 'shorts', 'subtitle', 'subtitles', 'captions', 'dub', 'podcast', 'avatar'] },
  { category: 'Video Generation Models', keywords: ['text to video', 'prompt to video', 'generate video', 'video generation', 'video model', 'motion scene'] },
  { category: 'Apply Audio on Video', keywords: ['voiceover', 'audio on video', 'dub video', 'soundtrack', 'add audio', 'dub'] },
  { category: 'From Text to Audio', keywords: ['text to audio', 'text to speech', 'voice', 'audio', 'music', 'narration', 'speech'] },
  { category: 'Audio / Speech Models', keywords: ['speech to text', 'voice clone', 'tts', 'transcription', 'voice generation', 'audio model'] },
  { category: 'Image Generation', keywords: ['image', 'art', 'poster', 'logo', 'illustration', 'photo'] },
  { category: 'Image Generation Models', keywords: ['image model', 'text to image', 'art generator', 'photorealistic image'] },
  { category: 'Design & UI', keywords: ['ui', 'ux', 'interface', 'landing page', 'figma', 'design system', 'wireframe'] },
  { category: 'Automation', keywords: ['automation', 'workflow', 'zap', 'make.com', 'automate'] },
  { category: 'Code Assistant', keywords: ['code assistant', 'copilot', 'refactor helper'] },
  { category: 'Coding AI Models', keywords: ['code', 'coding', 'programming', 'developer', 'refactor', 'debug'] },
  { category: 'Marketing', keywords: ['marketing', 'campaign', 'ads', 'brand', 'social media'] },
  { category: 'LLMs', keywords: ['llm', 'language model', 'reasoning model', 'chat model'] },
  { category: 'Multimodal Models', keywords: ['multimodal', 'image and text', 'audio and text', 'vision language'] },
  { category: 'Robotics / Agents', keywords: ['agent', 'robot', 'robotics', 'autonomous', 'operator'] },
  { category: 'Data / Prediction Models', keywords: ['forecast', 'prediction', 'time series', 'structured data', 'classification'] },
  { category: 'Specialized AI Models', keywords: ['protein', 'weather', 'segmentation', '3d', 'reinforcement learning'] },
  { category: 'Text & Writing', keywords: ['write', 'writing', 'article', 'essay', 'blog', 'email'] },
  { category: 'Productivity', keywords: ['productivity', 'notes', 'organize', 'todo', 'task'] },
];

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeMessage(message) {
  return normalizeText(message).toLowerCase();
}

function tokenize(text) {
  return normalizeMessage(text)
    .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function truncate(text, length = 140) {
  const value = normalizeText(text);
  if (value.length <= length) {
    return value;
  }

  return `${value.slice(0, length - 3)}...`;
}

function buildSessionTitle(message) {
  const cleaned = normalizeText(message).replace(/\s+/g, ' ');
  if (!cleaned) {
    return 'New AiMaster Session';
  }

  const words = cleaned.split(' ').slice(0, 6).join(' ');
  return truncate(words, 60);
}

function buildSummary(reply) {
  return truncate(reply, 240);
}

function detectIntent(message) {
  const normalized = normalizeMessage(message);
  const hits = CATEGORY_KEYWORDS
    .map(item => ({
      category: item.category,
      score: item.keywords.reduce((count, keyword) => count + (normalized.includes(keyword.toLowerCase()) ? 1 : 0), 0),
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return hits.map(item => item.category);
}

function detectSmallTalk(message) {
  const normalized = normalizeMessage(message);
  const compact = normalized.replace(/[^a-z0-9]+/g, ' ').trim();

  if (!compact) return null;

  const greetingSet = new Set(['hi', 'hey', 'hello', 'yo', 'sup', 'good morning', 'good afternoon', 'good evening']);
  const thanksSet = new Set(['thanks', 'thank you', 'thx', 'ty']);

  if (greetingSet.has(compact)) {
    return 'greeting';
  }

  if (thanksSet.has(compact)) {
    return 'thanks';
  }

  return null;
}

function looksLikeLegacyGarbledMessage(text) {
  const value = String(text || '');
  if (!value) return false;
  return value.includes('AiMaster') && value.includes('AI Safehouse') && value.includes('????');
}

function scoreTool(tool, tokens, matchedCategories, normalizedMessage) {
  let score = Number(tool.avg_rating || 0) * 4;
  const haystack = `${tool.name} ${tool.description} ${tool.tags} ${tool.category_name}`.toLowerCase();

  tokens.forEach(token => {
    if (haystack.includes(token)) {
      score += tool.name.toLowerCase().includes(token) ? 16 : 6;
    }
  });

  if (matchedCategories.includes(tool.category_name)) {
    score += 28;
  }

  if (normalizedMessage.includes('free')) {
    score += tool.is_free ? 10 : -4;
  }

  if (normalizedMessage.includes('paid')) {
    score += tool.is_free ? -4 : 6;
  }

  return score;
}

function reasonForTool(tool, matchedCategories, normalizedMessage) {
  const reasons = [];

  if (matchedCategories.includes(tool.category_name)) {
    reasons.push(`Strong match for ${tool.category_name}`);
  }

  if (tool.tags) {
    reasons.push(`Helpful tags: ${String(tool.tags).split(',').slice(0, 3).join(', ')}`);
  }

  if (Number(tool.avg_rating || 0) >= 4.7) {
    reasons.push(`Highly rated (${Number(tool.avg_rating).toFixed(1)}/5)`);
  }

  if (normalizedMessage.includes('free') && tool.is_free) {
    reasons.push('Matches your request for a free or flexible option');
  }

  return reasons[0] || 'Relevant match based on your request';
}

function buildAssistantReply(suggestions, matchedCategories) {
  if (!suggestions.length) {
    return 'I could not find a strong match yet. Try adding more detail about what you want to create, what format you need, or whether you prefer free tools.';
  }

  const intro = matchedCategories.length
    ? `I matched your request to these areas: ${matchedCategories.join(', ')}.`
    : 'I searched the AI Safehouse catalog for the strongest matches to your request.';

  const lines = suggestions.map((tool, index) => {
    return `${index + 1}. ${tool.name} - ${tool.reason}. ${tool.is_free ? 'Free or freemium.' : 'Paid option.'}`;
  });

  return `${intro}\n\n${lines.join('\n')}\n\nIf you want, tell me your budget, preferred output, or whether you want the easiest tool or the strongest quality.`;
}

async function createSession(userId, connection = db) {
  const [result] = await connection.query(
    'INSERT INTO chat_sessions (user_id, title, summary) VALUES (?, ?, ?)',
    [userId, 'New AiMaster Session', 'Waiting for the first prompt.']
  );

  await connection.query(
    'INSERT INTO chat_messages (session_id, role, content) VALUES (?, ?, ?)',
    [result.insertId, 'assistant', DEFAULT_WELCOME_MESSAGE]
  );

  return getSessionById(userId, result.insertId, connection);
}

async function listSessions(userId, connection = db) {
  const [rows] = await connection.query(
    `SELECT
       s.session_id,
       s.title,
       s.summary,
       s.created_at,
       s.updated_at,
       (SELECT COUNT(*) FROM chat_messages m WHERE m.session_id = s.session_id) AS message_count,
       (SELECT content FROM chat_messages m WHERE m.session_id = s.session_id ORDER BY m.message_id DESC LIMIT 1) AS last_message_preview
     FROM chat_sessions s
     WHERE s.user_id = ?
     ORDER BY s.updated_at DESC, s.session_id DESC`,
    [userId]
  );

  return rows.map(row => ({
    session_id: row.session_id,
    title: row.title,
    summary: row.summary,
    created_at: row.created_at,
    updated_at: row.updated_at,
    message_count: Number(row.message_count || 0),
    last_message_preview: truncate(row.last_message_preview || '', 120),
  }));
}

async function getSessionCore(userId, sessionId, connection = db) {
  const [rows] = await connection.query(
    `SELECT session_id, user_id, title, summary, last_user_prompt, created_at, updated_at
     FROM chat_sessions
     WHERE session_id = ? AND user_id = ?
     LIMIT 1`,
    [sessionId, userId]
  );

  return rows[0] || null;
}

async function getMessages(sessionId, connection = db) {
  const [messages] = await connection.query(
    `SELECT message_id, role, content, metadata_json, created_at
     FROM chat_messages
     WHERE session_id = ?
     ORDER BY message_id ASC`,
    [sessionId]
  );

  if (!messages.length) {
    return [];
  }

  const messageIds = messages.map(message => message.message_id);
  const [toolRows] = await connection.query(
    `SELECT
       cmt.message_id,
       cmt.rank_order,
       cmt.reason,
       cmt.relevance_score,
       m.model_id,
       m.name,
       m.description,
       m.avg_rating,
       m.website_url,
       m.logo_url,
       m.is_free,
       c.name AS category_name
     FROM chat_message_tools cmt
     JOIN ai_models m ON m.model_id = cmt.model_id
     JOIN categories c ON c.category_id = m.category_id
     WHERE cmt.message_id IN (${messageIds.map(() => '?').join(',')})
     ORDER BY cmt.message_id ASC, cmt.rank_order ASC`,
    messageIds
  );

  const toolsByMessageId = toolRows.reduce((acc, row) => {
    if (!acc[row.message_id]) {
      acc[row.message_id] = [];
    }

    acc[row.message_id].push({
      model_id: row.model_id,
      name: row.name,
      description: row.description,
      avg_rating: Number(row.avg_rating || 0),
      website_url: row.website_url,
      logo_url: row.logo_url,
      is_free: Boolean(row.is_free),
      category_name: row.category_name,
      reason: row.reason,
      relevance_score: Number(row.relevance_score || 0),
      rank_order: row.rank_order,
    });

    return acc;
  }, {});

  return messages.map(message => ({
    message_id: message.message_id,
    role: message.role,
    text: looksLikeLegacyGarbledMessage(message.content) ? DEFAULT_WELCOME_MESSAGE : message.content,
    created_at: message.created_at,
    metadata: message.metadata_json ? JSON.parse(message.metadata_json) : null,
    suggested_tools: toolsByMessageId[message.message_id] || [],
  }));
}

async function getSessionById(userId, sessionId, connection = db) {
  const session = await getSessionCore(userId, sessionId, connection);
  if (!session) {
    throw createAuthError('Chat session not found.', 404, 'SESSION_NOT_FOUND');
  }

  const messages = await getMessages(sessionId, connection);
  return {
    session: {
      session_id: session.session_id,
      title: session.title,
      summary: session.summary,
      last_user_prompt: session.last_user_prompt,
      created_at: session.created_at,
      updated_at: session.updated_at,
    },
    messages,
  };
}

async function deleteSession(userId, sessionId, connection = db) {
  const [result] = await connection.query(
    'DELETE FROM chat_sessions WHERE session_id = ? AND user_id = ?',
    [sessionId, userId]
  );

  if (!result.affectedRows) {
    throw createAuthError('Chat session not found.', 404, 'SESSION_NOT_FOUND');
  }
}

async function fetchCandidateTools(connection = db) {
  const [rows] = await connection.query(
    `SELECT
       m.model_id,
       m.name,
       m.description,
       m.tags,
       m.avg_rating,
       m.website_url,
       m.logo_url,
       m.is_free,
       c.name AS category_name
     FROM ai_models m
     JOIN categories c ON c.category_id = m.category_id
     ORDER BY m.avg_rating DESC, m.name ASC`
  );

  return rows;
}

async function sendMessage(userId, sessionId, rawMessage, connection = db) {
  const message = normalizeText(rawMessage);
  if (!message) {
    throw createAuthError('Message content is required.', 400, 'MESSAGE_REQUIRED');
  }

  const session = sessionId
    ? await getSessionCore(userId, sessionId, connection)
    : null;

  if (sessionId && !session) {
    throw createAuthError('Chat session not found.', 404, 'SESSION_NOT_FOUND');
  }

  const targetSession = session || (await createSession(userId, connection)).session;
  const normalizedMessage = normalizeMessage(message);
  const tokens = tokenize(message);
  const matchedCategories = detectIntent(message);
  const smallTalkIntent = detectSmallTalk(message);
  const title = targetSession.title === 'New AiMaster Session' ? buildSessionTitle(message) : targetSession.title;

  const [userMessageResult] = await connection.query(
    'INSERT INTO chat_messages (session_id, role, content) VALUES (?, ?, ?)',
    [targetSession.session_id, 'user', message]
  );

  let reply = '';
  let rankedTools = [];
  let metadata = {
    engine: 'heuristic-retrieval',
    matched_categories: matchedCategories,
    generated_at: new Date().toISOString(),
  };

  if (smallTalkIntent) {
    reply = SMALL_TALK_RESPONSES[smallTalkIntent] || SMALL_TALK_RESPONSES.fallback;
    metadata = {
      engine: 'small-talk-router',
      intent: smallTalkIntent,
      generated_at: new Date().toISOString(),
    };
  } else {
    const tools = await fetchCandidateTools(connection);
    rankedTools = tools
      .map(tool => ({
        ...tool,
        relevance_score: scoreTool(tool, tokens, matchedCategories, normalizedMessage),
      }))
      .sort((a, b) => b.relevance_score - a.relevance_score || Number(b.avg_rating || 0) - Number(a.avg_rating || 0))
      .slice(0, 3)
      .map((tool, index) => ({
        ...tool,
        rank_order: index + 1,
        reason: reasonForTool(tool, matchedCategories, normalizedMessage),
      }));

    reply = buildAssistantReply(rankedTools, matchedCategories);
  }

  const [assistantMessageResult] = await connection.query(
    'INSERT INTO chat_messages (session_id, role, content, metadata_json) VALUES (?, ?, ?, ?)',
    [
      targetSession.session_id,
      'assistant',
      reply,
      JSON.stringify(metadata),
    ]
  );

  for (const tool of rankedTools) {
    await connection.query(
      `INSERT INTO chat_message_tools (message_id, model_id, rank_order, reason, relevance_score)
       VALUES (?, ?, ?, ?, ?)`,
      [assistantMessageResult.insertId, tool.model_id, tool.rank_order, tool.reason, tool.relevance_score]
    );
  }

  await connection.query(
    `UPDATE chat_sessions
     SET title = ?, summary = ?, last_user_prompt = ?, updated_at = CURRENT_TIMESTAMP
     WHERE session_id = ?`,
    [title, buildSummary(reply), message, targetSession.session_id]
  );

  const fullSession = await getSessionById(userId, targetSession.session_id, connection);

  return {
    session: fullSession.session,
    user_message_id: userMessageResult.insertId,
    assistant_message: fullSession.messages[fullSession.messages.length - 1],
    suggested_tools: rankedTools,
    messages: fullSession.messages,
  };
}

module.exports = {
  DEFAULT_WELCOME_MESSAGE,
  createSession,
  listSessions,
  getSessionById,
  deleteSession,
  sendMessage,
};
