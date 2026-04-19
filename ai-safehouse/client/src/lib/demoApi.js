import { demoCategories, demoStarterPrompts, demoTools } from './demoData'

const DEMO_LATENCY = 140
const STORAGE_KEYS = {
  users: 'ai_safehouse_demo_users',
  currentUser: 'ai_safehouse_demo_current_user',
  sessions: 'ai_safehouse_demo_sessions',
}

const DEFAULT_USER = {
  id: 'demo-user-1',
  name: 'Demo Explorer',
  email: 'demo@aisafehouse.app',
  password: 'Demo12345!',
  avatar_url: '',
  providers: ['local'],
  created_at: '2026-04-19T09:00:00.000Z',
  updated_at: '2026-04-19T09:00:00.000Z',
}

const CATEGORY_HINTS = {
  'Video Generation Models': ['video', 'film', 'animation', 'clip', 'cinematic', 'motion'],
  'Image Generation Models': ['image', 'logo', 'poster', 'art', 'design', 'brand'],
  'Coding AI Models': ['code', 'coding', 'programming', 'debug', 'developer', 'app', 'website'],
  LLMs: ['chat', 'reasoning', 'research', 'assistant', 'writing', 'prompt', 'model'],
  'Audio / Speech Models': ['audio', 'voice', 'speech', 'music', 'dub', 'dubbing', 'podcast'],
  'Multimodal Models': ['multimodal', 'vision', 'image', 'audio', 'screenshots'],
  'Robotics / Agents': ['agent', 'automation', 'robot', 'operator', 'workflow'],
  'Data / Prediction Models': ['forecast', 'prediction', 'dataset', 'analytics', 'classification'],
  'Specialized AI Models': ['3d', 'protein', 'weather', 'segmentation', 'science'],
}

function wait(data) {
  return new Promise(resolve => {
    window.setTimeout(() => resolve({ data }), DEMO_LATENCY)
  })
}

function fail(status, message) {
  const error = new Error(message)
  error.response = {
    status,
    data: {
      error: message,
      message,
    },
  }
  return Promise.reject(error)
}

function readJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

function createId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase()
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase()
}

function sanitizeUser(user) {
  return {
    id: user.id,
    user_id: user.id,
    name: user.name,
    username: user.name,
    email: user.email,
    avatar_url: user.avatar_url,
    providers: user.providers || ['local'],
    created_at: user.created_at,
    updated_at: user.updated_at,
  }
}

function ensureUsers() {
  const users = readJson(STORAGE_KEYS.users, null)
  if (users?.length) return users
  writeJson(STORAGE_KEYS.users, [DEFAULT_USER])
  return [DEFAULT_USER]
}

function getUsers() {
  return ensureUsers()
}

function saveUsers(users) {
  writeJson(STORAGE_KEYS.users, users)
}

function getCurrentUserRecord() {
  const currentUserId = window.localStorage.getItem(STORAGE_KEYS.currentUser)
  if (!currentUserId) return null
  return getUsers().find(user => user.id === currentUserId) || null
}

function setCurrentUserRecord(user) {
  if (!user) {
    window.localStorage.removeItem(STORAGE_KEYS.currentUser)
    return
  }
  window.localStorage.setItem(STORAGE_KEYS.currentUser, user.id)
}

function getSessionStore() {
  return readJson(STORAGE_KEYS.sessions, {})
}

function saveSessionStore(store) {
  writeJson(STORAGE_KEYS.sessions, store)
}

function getUserSessions(userId) {
  const store = getSessionStore()
  return Array.isArray(store[userId]) ? store[userId] : []
}

function saveUserSessions(userId, sessions) {
  const store = getSessionStore()
  store[userId] = sessions
  saveSessionStore(store)
}

function summarizeSession(session) {
  const messages = session.messages || []
  const lastUserMessage = [...messages].reverse().find(message => message.role === 'user')
  const firstUserMessage = messages.find(message => message.role === 'user')
  const titleBase = firstUserMessage?.text || 'New AiMaster Session'
  const title = titleBase.split(/\s+/).slice(0, 5).join(' ') || 'New AiMaster Session'
  const summary = lastUserMessage?.text || 'Ready for the first prompt.'

  return {
    session_id: session.session_id,
    title,
    summary,
    created_at: session.created_at,
    updated_at: session.updated_at,
    message_count: messages.length,
    last_message_preview: summary,
  }
}

function defaultWelcomeMessage() {
  return {
    message_id: createId('msg'),
    role: 'assistant',
    text: 'Welcome to the public Ai Safehouse demo. Tell me what you want to build, and I will search the catalog, rank the strongest tools, and explain why they fit.',
    created_at: new Date().toISOString(),
    suggested_tools: [],
  }
}

function createDemoSession() {
  const now = new Date().toISOString()
  return {
    session_id: createId('session'),
    created_at: now,
    updated_at: now,
    messages: [defaultWelcomeMessage()],
  }
}

function ensureDemoSession(userId) {
  const sessions = getUserSessions(userId)
  if (sessions.length) return sessions
  const starter = createDemoSession()
  saveUserSessions(userId, [starter])
  return [starter]
}

function detectSmallTalk(message) {
  const text = normalizeText(message)
  if (!text) return null

  const greetings = ['hi', 'hey', 'hello', 'yo', 'hola', 'مرحبا', 'اهلا', 'سلام']
  if (greetings.includes(text)) {
    return 'Hey! I am running in public demo mode, so I can still search the Safehouse catalog and recommend tools. Tell me what you want to build, design, generate, or compare.'
  }

  if (['thanks', 'thank you', 'thx', 'شكرا', 'يسلمو'].includes(text)) {
    return 'You are welcome. Send your goal or workflow, and I will narrow the strongest tools for it.'
  }

  return null
}

function scoreTool(tool, query) {
  const text = normalizeText(query)
  const tokens = text.split(/[^a-z0-9+#.-]+/i).filter(token => token.length > 1)
  let score = Number(tool.avg_rating || 0)

  tokens.forEach(token => {
    if (tool.name.toLowerCase().includes(token)) score += 4
    if (tool.category_name.toLowerCase().includes(token)) score += 2.5
    if (String(tool.tags || '').toLowerCase().includes(token)) score += 2
    if (tool.description.toLowerCase().includes(token)) score += 1.25
  })

  Object.entries(CATEGORY_HINTS).forEach(([categoryName, hints]) => {
    if (hints.some(hint => text.includes(hint)) && tool.category_name === categoryName) {
      score += 5
    }
  })

  if (text.includes('free') && Number(tool.is_free)) score += 1.5
  if (text.includes('best') || text.includes('strongest')) score += Number(tool.avg_rating || 0) * 0.3

  return score
}

function buildReason(tool, query) {
  const text = normalizeText(query)
  const matchedHints = CATEGORY_HINTS[tool.category_name]?.filter(hint => text.includes(hint)) || []
  if (matchedHints.length) {
    return `Matched your ${matchedHints.slice(0, 2).join(' / ')} intent and sits in ${tool.category_name}.`
  }

  return `Strong fit because of ${tool.category_name.toLowerCase()} plus tags like ${String(tool.tags || '').split(',').slice(0, 3).join(', ')}.`
}

function rankTools(query) {
  return demoTools
    .map(tool => ({
      ...tool,
      score: scoreTool(tool, query),
    }))
    .sort((left, right) => right.score - left.score)
}

function buildAssistantReply(query, tools) {
  if (!tools.length) {
    return {
      text: 'I could not find a strong match yet. Tell me more about your goal, like whether you want coding, image generation, video, audio, automation, or a general reasoning model.',
      suggested_tools: demoTools.slice(0, 3),
    }
  }

  const topTools = tools.slice(0, 3).map(tool => ({
    ...tool,
    reason: buildReason(tool, query),
  }))

  const lines = topTools.map((tool, index) => `${index + 1}. ${tool.name} — ${tool.reason}`)

  return {
    text: `I searched the public Ai Safehouse catalog for the strongest matches to "${query}".\n\n${lines.join('\n')}\n\nIf you want, send your budget, preferred output, or exact use case and I will narrow the list even more.`,
    suggested_tools: topTools,
  }
}

function buildAccountPayload(user) {
  const sessions = ensureDemoSession(user.id)
  const assistantSuggestions = sessions
    .flatMap(session => session.messages || [])
    .flatMap(message => message.suggested_tools || [])

  const uniqueById = new Map()
  assistantSuggestions.forEach(tool => {
    if (!uniqueById.has(tool.model_id)) {
      uniqueById.set(tool.model_id, tool)
    }
  })

  const exploredTools = [...uniqueById.values()]
  const recentActivity = exploredTools.slice(0, 4).map((tool, index) => ({
    review_id: index + 1,
    model_name: tool.name,
    rating: Math.max(4, Math.round(Number(tool.avg_rating || 4.5))),
    comment: `Demo note: ${tool.name} stood out because it matched a recent AiMaster query around ${tool.category_name.toLowerCase()}.`,
    created_at: new Date(Date.now() - index * 86400000).toISOString(),
    category_name: tool.category_name,
    website_url: tool.website_url,
  }))

  const exploredCategories = new Set(exploredTools.map(tool => tool.category_name))
  const recommendedTools = demoTools
    .filter(tool => !uniqueById.has(tool.model_id))
    .sort((left, right) => Number(right.avg_rating || 0) - Number(left.avg_rating || 0))
    .slice(0, 4)

  const favoriteTool = exploredTools[0]?.name || demoTools[0].name
  const favoriteCategory = exploredTools[0]?.category_name || demoTools[0].category_name
  const averageRating = recentActivity.length
    ? (recentActivity.reduce((total, item) => total + item.rating, 0) / recentActivity.length).toFixed(1)
    : '0.0'

  return {
    profile: {
      name: user.name,
      username: user.name,
      email: user.email,
      avatar_url: user.avatar_url,
      favorite_category: favoriteCategory,
      favorite_tool: favoriteTool,
      providers: user.providers,
      created_at: user.created_at,
      last_activity_at: sessions[0]?.updated_at || user.updated_at,
    },
    summary: {
      total_reviews: recentActivity.length,
      average_rating_given: averageRating,
      explored_categories: exploredCategories.size,
      total_tools_in_catalog: demoTools.length,
      total_categories_in_catalog: demoCategories.length,
    },
    recent_activity: recentActivity,
    recommended_tools: recommendedTools,
  }
}

function parsePath(path) {
  return String(path || '').split('?')[0]
}

const demoApi = {
  async get(path, config = {}) {
    const cleanPath = parsePath(path)
    const currentUser = getCurrentUserRecord()

    if (cleanPath === '/auth/providers') {
      return wait({ google: false, apple: false })
    }

    if (cleanPath === '/auth/me') {
      if (!currentUser) return fail(401, 'Not signed in.')
      return wait({ user: sanitizeUser(currentUser) })
    }

    if (cleanPath === '/categories') {
      return wait(demoCategories)
    }

    if (cleanPath === '/models') {
      const search = normalizeText(config.params?.search || '')
      const category = config.params?.category || ''
      const filtered = demoTools.filter(tool => {
        const matchesSearch = !search || [tool.name, tool.description, tool.tags, tool.category_name].join(' ').toLowerCase().includes(search)
        const matchesCategory = !category || tool.category_name === category
        return matchesSearch && matchesCategory
      })
      return wait(filtered)
    }

    if (cleanPath === '/account') {
      if (!currentUser) return fail(401, 'Sign in to open the account capsule.')
      return wait(buildAccountPayload(currentUser))
    }

    if (cleanPath === '/aimaster/sessions') {
      if (!currentUser) return fail(401, 'Sign in to load AiMaster sessions.')
      const sessions = ensureDemoSession(currentUser.id)
      return wait({ sessions: sessions.map(summarizeSession).sort((left, right) => new Date(right.updated_at) - new Date(left.updated_at)) })
    }

    const sessionMatch = cleanPath.match(/^\/aimaster\/sessions\/([^/]+)$/)
    if (sessionMatch) {
      if (!currentUser) return fail(401, 'Sign in to open AiMaster sessions.')
      const sessions = ensureDemoSession(currentUser.id)
      const session = sessions.find(item => item.session_id === sessionMatch[1])
      if (!session) return fail(404, 'Session not found.')
      return wait({ session: summarizeSession(session), messages: session.messages })
    }

    return fail(404, 'Demo route not found.')
  },

  async post(path, payload = {}) {
    const cleanPath = parsePath(path)
    const currentUser = getCurrentUserRecord()

    if (cleanPath === '/auth/register') {
      const name = String(payload.name || '').trim() || 'New Demo User'
      const email = normalizeEmail(payload.email)
      const password = String(payload.password || '')

      if (!email) return fail(400, 'Email is required.')
      if (!password || password.length < 6) return fail(400, 'Password must be at least 6 characters long.')

      const users = getUsers()
      if (users.some(user => normalizeEmail(user.email) === email)) {
        return fail(409, 'An account with this email already exists. Please log in instead.')
      }

      const now = new Date().toISOString()
      const user = {
        id: createId('user'),
        name,
        email,
        password,
        avatar_url: '',
        providers: ['local'],
        created_at: now,
        updated_at: now,
      }

      users.unshift(user)
      saveUsers(users)
      setCurrentUserRecord(user)
      ensureDemoSession(user.id)
      return wait({ message: 'Demo account created successfully.', user: sanitizeUser(user) })
    }

    if (cleanPath === '/auth/login') {
      const email = normalizeEmail(payload.email)
      const password = String(payload.password || '')
      const user = getUsers().find(item => normalizeEmail(item.email) === email && item.password === password)
      if (!user) return fail(401, 'Invalid email or password.')
      setCurrentUserRecord(user)
      ensureDemoSession(user.id)
      return wait({ message: 'Logged in successfully.', user: sanitizeUser(user) })
    }

    if (cleanPath === '/auth/logout') {
      setCurrentUserRecord(null)
      return wait({ message: 'Logged out successfully.' })
    }

    if (cleanPath === '/aimaster/sessions') {
      if (!currentUser) return fail(401, 'Sign in to create AiMaster sessions.')
      const sessions = getUserSessions(currentUser.id)
      const session = createDemoSession()
      const nextSessions = [session, ...sessions]
      saveUserSessions(currentUser.id, nextSessions)
      return wait({ session: summarizeSession(session), messages: session.messages })
    }

    if (cleanPath === '/aimaster') {
      if (!currentUser) return fail(401, 'Sign in to talk with AiMaster.')
      const message = String(payload.message || '').trim()
      if (!message) return fail(400, 'Message is required.')

      const sessions = ensureDemoSession(currentUser.id)
      let activeSession = sessions.find(session => session.session_id === payload.session_id) || sessions[0]
      if (!activeSession) {
        activeSession = createDemoSession()
        sessions.unshift(activeSession)
      }

      const userMessage = {
        message_id: createId('msg'),
        role: 'user',
        text: message,
        created_at: new Date().toISOString(),
        suggested_tools: [],
      }
      activeSession.messages.push(userMessage)

      const smallTalkReply = detectSmallTalk(message)
      const replyPayload = smallTalkReply
        ? { text: smallTalkReply, suggested_tools: [] }
        : buildAssistantReply(message, rankTools(message).slice(0, 6))

      const assistantMessage = {
        message_id: createId('msg'),
        role: 'assistant',
        text: replyPayload.text,
        created_at: new Date().toISOString(),
        suggested_tools: replyPayload.suggested_tools,
      }

      activeSession.messages.push(assistantMessage)
      activeSession.updated_at = assistantMessage.created_at

      const reordered = [activeSession, ...sessions.filter(session => session.session_id !== activeSession.session_id)]
      saveUserSessions(currentUser.id, reordered)

      return wait({
        session: summarizeSession(activeSession),
        messages: activeSession.messages,
      })
    }

    return fail(404, 'Demo route not found.')
  },

  async delete(path) {
    const cleanPath = parsePath(path)
    const currentUser = getCurrentUserRecord()
    const sessionMatch = cleanPath.match(/^\/aimaster\/sessions\/([^/]+)$/)

    if (sessionMatch) {
      if (!currentUser) return fail(401, 'Sign in to manage AiMaster sessions.')
      const sessions = getUserSessions(currentUser.id).filter(session => session.session_id !== sessionMatch[1])
      saveUserSessions(currentUser.id, sessions)
      return wait({ success: true })
    }

    return fail(404, 'Demo route not found.')
  },
}

export { demoStarterPrompts }
export default demoApi
