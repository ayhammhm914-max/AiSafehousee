import { useEffect, useMemo, useState } from 'react'
import api, { getApiErrorMessage } from '../lib/api'
import { demoStarterPrompts } from '../lib/demoApi'
import { useAuth } from '../context/AuthContext'
import { usePageTransition } from '../context/PageTransitionContext'

const PAGE_COPY = {
  eyebrow: 'AI command deck',
  title: 'AiMaster',
  subtitle: 'A cleaner mission-control chat for discovering the right AI tools, keeping your session history, and preparing the bot for a real LLM brain.',
  thinkingMessage: 'AiMaster is ranking tools and preparing the strongest matches for your request.',
  emptyTitle: 'Start a clean session',
  emptyBody: 'Describe the result you want, such as building a landing page, creating a logo, generating a voice-over, or choosing the best coding assistant.',
  composerPlaceholder: 'Tell AiMaster what you want to build, automate, design, or generate...',
}

function formatRelativeDate(value) {
  if (!value) return 'just now'

  const time = new Date(value).getTime()
  const diffMinutes = Math.max(0, Math.floor((Date.now() - time) / 60000))

  if (diffMinutes < 1) return 'just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

function formatClock(value) {
  if (!value) return ''

  try {
    return new Intl.DateTimeFormat('en', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(value))
  } catch {
    return ''
  }
}

function deriveLogo(tool) {
  if (tool.logo_url) return tool.logo_url
  if (tool.website_url) {
    return `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(tool.website_url)}`
  }

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(tool.name)}&background=0f172a&color=67e8f9`
}

function SessionItem({ session, active, onOpen, onDelete }) {
  return (
    <div className={`rounded-[1.5rem] border p-4 transition ${active ? 'border-cyan-300/35 bg-cyan-400/12 shadow-[0_0_36px_rgba(34,211,238,0.14)]' : 'border-white/10 bg-slate-950/40 hover:border-white/20 hover:bg-white/[0.05]'}`}>
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={() => onOpen(session.session_id)} className="min-w-0 flex-1 text-left">
          <p className="truncate text-sm font-semibold text-white">{session.title}</p>
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-300">{session.summary || session.last_message_preview || 'Ready for your next prompt.'}</p>
        </button>
        <button
          type="button"
          onClick={() => onDelete(session.session_id)}
          className="rounded-full border border-white/12 px-2.5 py-1 text-[10px] uppercase tracking-[0.24em] text-slate-400 transition hover:border-rose-300/30 hover:bg-rose-400/12 hover:text-rose-100"
        >
          Del
        </button>
      </div>
      <div className="mt-4 flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-slate-500">
        <span>{session.message_count} msgs</span>
        <span>{formatRelativeDate(session.updated_at)}</span>
      </div>
    </div>
  )
}

function SuggestedToolCard({ tool, compact = false }) {
  return (
    <a
      href={tool.website_url || '#'}
      target="_blank"
      rel="noreferrer"
      className={`rounded-[1.35rem] border border-white/10 bg-slate-950/55 transition hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-white/[0.06] ${compact ? 'flex items-center gap-3 p-3' : 'block p-4'}`}
    >
      <div className={compact ? 'flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/8' : 'mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/8'}>
        <img
          src={deriveLogo(tool)}
          alt={tool.name}
          className="h-9 w-9 rounded-xl object-cover"
          onError={event => {
            event.currentTarget.onerror = null
            event.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(tool.name)}&background=0f172a&color=67e8f9`
          }}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{tool.name}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.24em] text-cyan-300">{tool.category_name}</p>
          </div>
          <span className="rounded-full border border-cyan-400/15 bg-cyan-400/8 px-2.5 py-1 text-[11px] font-semibold text-cyan-100">
            {Number(tool.avg_rating || 0).toFixed(1)}
          </span>
        </div>
        {!compact ? <p className="mt-3 text-xs leading-6 text-slate-300">{tool.reason || tool.description}</p> : null}
      </div>
    </a>
  )
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  const timeLabel = formatClock(message.created_at)

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[88%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
        <div className={`flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] ${isUser ? 'text-violet-200' : 'text-cyan-200'}`}>
          <span>{isUser ? 'You' : 'AiMaster'}</span>
          {timeLabel ? <span className="text-slate-500">{timeLabel}</span> : null}
        </div>
        <div className={`rounded-[1.8rem] px-5 py-4 text-sm leading-7 shadow-lg sm:text-[15px] ${isUser ? 'rounded-br-md bg-gradient-to-r from-violet-600 via-fuchsia-600 to-sky-500 text-white shadow-fuchsia-950/40' : 'rounded-bl-md border border-cyan-400/12 bg-slate-950/80 text-slate-100 shadow-cyan-950/20'}`}>
          <p className="whitespace-pre-line">{message.text}</p>
          {message.suggested_tools?.length ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {message.suggested_tools.map(tool => (
                <SuggestedToolCard key={`${message.message_id}-${tool.model_id}`} tool={tool} compact />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function StatusCard({ title, body, tone = 'cyan' }) {
  const tones = {
    cyan: 'border-cyan-400/12 bg-cyan-400/8 text-cyan-100',
    violet: 'border-violet-400/12 bg-violet-400/8 text-violet-100',
    slate: 'border-white/10 bg-white/[0.04] text-slate-100',
  }

  return (
    <div className="rounded-[1.45rem] border border-white/10 bg-slate-950/52 p-4">
      <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.26em] ${tones[tone]}`}>
        {title}
      </span>
      <p className="mt-3 text-sm leading-6 text-slate-300">{body}</p>
    </div>
  )
}

export default function AiMaster() {
  const { isAuthenticated, isLoading, isDemoMode } = useAuth()
  const startTransition = usePageTransition()
  const [sessions, setSessions] = useState([])
  const [activeSession, setActiveSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [pendingUserText, setPendingUserText] = useState('')

  const syncSessionInList = session => {
    setSessions(prev => {
      const next = prev.filter(item => item.session_id !== session.session_id)
      return [
        {
          session_id: session.session_id,
          title: session.title,
          summary: session.summary,
          created_at: session.created_at,
          updated_at: session.updated_at,
          message_count: session.message_count || Math.max(messages.length, 1),
          last_message_preview: session.last_user_prompt || session.summary,
        },
        ...next,
      ]
    })
  }

  const openSession = async sessionId => {
    try {
      const { data } = await api.get(`/aimaster/sessions/${sessionId}`)
      setActiveSession(data.session)
      setMessages(data.messages)
      setError('')
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Could not open this chat session right now.'))
    }
  }

  const createNewSession = async () => {
    try {
      const { data } = await api.post('/aimaster/sessions')
      setActiveSession(data.session)
      setMessages(data.messages)
      syncSessionInList(data.session)
      setError('')
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Could not create a new AiMaster session.'))
    }
  }

  const loadSessions = async () => {
    setLoadingSessions(true)
    try {
      const { data } = await api.get('/aimaster/sessions')
      setSessions(data.sessions)
      if (data.sessions.length) {
        await openSession(data.sessions[0].session_id)
      } else {
        await createNewSession()
      }
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Could not load your AiMaster history.'))
    } finally {
      setLoadingSessions(false)
    }
  }

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) {
      setLoadingSessions(false)
      return
    }
    loadSessions()
  }, [isAuthenticated, isLoading])

  const send = async () => {
    const message = input.trim()
    if (!message || sending || !isAuthenticated) return

    setPendingUserText(message)
    setInput('')
    setSending(true)
    setError('')

    try {
      const { data } = await api.post('/aimaster', {
        session_id: activeSession?.session_id,
        message,
      })

      setActiveSession(data.session)
      setMessages(data.messages)
      syncSessionInList({
        ...data.session,
        message_count: data.messages.length,
      })
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Could not send your message to AiMaster right now.'))
    } finally {
      setPendingUserText('')
      setSending(false)
    }
  }

  const deleteSession = async sessionId => {
    try {
      await api.delete(`/aimaster/sessions/${sessionId}`)
      const remaining = sessions.filter(session => session.session_id !== sessionId)
      setSessions(remaining)

      if (activeSession?.session_id === sessionId) {
        if (remaining.length) {
          await openSession(remaining[0].session_id)
        } else {
          await createNewSession()
        }
      }
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Could not delete this chat session.'))
    }
  }

  const displayMessages = pendingUserText
    ? [
        ...messages,
        { message_id: 'pending-user', role: 'user', text: pendingUserText, suggested_tools: [] },
        { message_id: 'pending-ai', role: 'assistant', text: PAGE_COPY.thinkingMessage, suggested_tools: [] },
      ]
    : messages

  const latestSuggestedTools = useMemo(() => {
    const assistantWithTools = [...messages].reverse().find(message => message.role === 'assistant' && message.suggested_tools?.length)
    return assistantWithTools?.suggested_tools || []
  }, [messages])

  const readinessItems = [
    {
      title: 'Mode',
      body: isDemoMode ? 'AiMaster is running in public demo mode. It searches the built-in tool catalog, ranks strong matches, and stores the session in this browser.' : 'AiMaster is currently working in retrieval mode. It searches your tool catalog, ranks the best matches, and saves the full conversation to MySQL.',
      tone: 'cyan',
    },
    {
      title: 'Memory',
      body: isDemoMode ? 'Sessions, titles, summaries, and assistant suggestions stay attached to this browser so the shared demo still feels real.' : 'Sessions, titles, summaries, and assistant suggestions are already persistent per user account.',
      tone: 'violet',
    },
    {
      title: 'Next upgrade',
      body: isDemoMode ? 'The shared link uses a safe offline demo brain. Later we can swap it to Claude or GPT without redesigning the interface.' : 'The missing layer is a real LLM call. Once we wire Claude or another model, the same UI and history flow will start producing richer answers.',
      tone: 'slate',
    },
  ]

  if (isLoading) {
    return (
      <section className="page-arrival flex min-h-[calc(100vh-113px)] items-center justify-center px-4 py-10 text-white">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/48 px-8 py-6 text-center backdrop-blur-2xl">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">AiMaster</p>
          <p className="mt-4 text-lg text-slate-200">Preparing your command deck...</p>
        </div>
      </section>
    )
  }

  if (!isAuthenticated) {
    return (
      <section className="page-arrival min-h-[calc(100vh-113px)] px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-slate-950/52 p-8 shadow-[0_25px_80px_rgba(2,6,23,0.65)] backdrop-blur-2xl sm:p-10">
          <p className="text-[11px] uppercase tracking-[0.35em] text-cyan-300">AiMaster Access</p>
          <h2 className="mt-4 text-3xl font-black text-white sm:text-5xl">Sign in to unlock the real chat history</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
            {isDemoMode ? 'This public version uses a browser-based demo account so the professor can open the link, try the chat, and keep session history without your local backend.' : 'The bot already stores sessions, messages, and tool suggestions in MySQL. Log in first so every conversation is attached to your account and stays ready for the future LLM layer.'}
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <StatusCard title="Saved sessions" body="Every account gets persistent chat history instead of a temporary demo state." tone="cyan" />
            <StatusCard title="Live catalog" body="AiMaster can already rank tools from your database and surface the strongest matches." tone="violet" />
            <StatusCard title="LLM ready" body="The UI and storage are ready for Claude or any other model you want to connect next." tone="slate" />
          </div>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <button type="button" onClick={() => startTransition('/login', 'cyan')} className="rounded-full border border-cyan-300/30 bg-cyan-400/15 px-7 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-100 transition hover:-translate-y-0.5 hover:border-cyan-200/45 hover:bg-cyan-300/18">Log In</button>
            <button type="button" onClick={() => startTransition('/signup', 'violet')} className="rounded-full border border-violet-300/30 bg-violet-400/14 px-7 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-violet-100 transition hover:-translate-y-0.5 hover:border-violet-200/45 hover:bg-violet-300/18">Create Account</button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="page-arrival min-h-[calc(100vh-113px)] bg-slate-950/28 px-4 py-8 text-white backdrop-blur-[1px] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/48 p-6 shadow-[0_25px_80px_rgba(2,6,23,0.65)] backdrop-blur-2xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="inline-flex rounded-full border border-cyan-400/18 bg-cyan-400/10 px-4 py-2 text-[11px] uppercase tracking-[0.34em] text-cyan-300">
                {isDemoMode ? 'public demo mode' : PAGE_COPY.eyebrow}
              </p>
              <h2 className="mt-4 text-4xl font-black text-white sm:text-5xl">
                <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400 bg-clip-text text-transparent">{PAGE_COPY.title}</span>
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">{isDemoMode ? 'This public version keeps the same look and flow, but it runs with a built-in catalog and browser-based session memory so anyone can open the link and try it immediately.' : PAGE_COPY.subtitle}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[26rem]">
              <StatusCard title="Online" body={isDemoMode ? 'No localhost needed. This link works on its own.' : 'API, sessions, and chat persistence are live.'} tone="cyan" />
              <StatusCard title="Retrieval" body="The bot already ranks tools from the Safehouse catalog." tone="violet" />
              <StatusCard title="LLM" body={isDemoMode ? 'Using a safe built-in demo brain for now.' : 'Not wired yet. The interface is ready for it.'} tone="slate" />
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)_320px]">
          <aside className="rounded-[2rem] border border-white/10 bg-slate-950/48 p-5 shadow-[0_25px_80px_rgba(2,6,23,0.65)] backdrop-blur-2xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.34em] text-cyan-300/80">Sessions</p>
                <h3 className="mt-2 text-2xl font-black text-white">Mission history</h3>
              </div>
              <button type="button" onClick={createNewSession} className="rounded-full border border-cyan-300/18 bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.25em] text-cyan-100 transition hover:border-cyan-200/35 hover:bg-cyan-300/16">New</button>
            </div>
            <div className="mt-5 space-y-3">
              {loadingSessions ? (
                <div className="rounded-[1.45rem] border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300">Loading your saved sessions...</div>
              ) : sessions.length ? (
                sessions.map(session => (
                  <SessionItem key={session.session_id} session={session} active={activeSession?.session_id === session.session_id} onOpen={openSession} onDelete={deleteSession} />
                ))
              ) : (
                <div className="rounded-[1.45rem] border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-slate-300">
                  No saved sessions yet. Create one and start prompting AiMaster.
                </div>
              )}
            </div>
          </aside>

          <div className="rounded-[2rem] border border-white/10 bg-slate-950/48 p-4 shadow-[0_25px_80px_rgba(2,6,23,0.65)] backdrop-blur-2xl sm:p-6">
            <div className="flex h-full flex-col rounded-[1.75rem] border border-white/10 bg-slate-950/55">
              <div className="flex flex-col gap-4 border-b border-white/8 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.32em] text-slate-400">Active session</p>
                  <h3 className="mt-2 text-2xl font-black text-white">{activeSession?.title || 'Preparing session...'}</h3>
                  <p className="mt-2 text-sm text-slate-300">{activeSession?.summary || PAGE_COPY.emptyBody}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.24em]">
                  <span className="rounded-full border border-cyan-400/18 bg-cyan-400/10 px-3 py-1.5 text-cyan-100">{messages.length} messages</span>
                  <span className="rounded-full border border-violet-400/18 bg-violet-400/10 px-3 py-1.5 text-violet-100">{isDemoMode ? 'Stored in browser' : 'Stored in MySQL'}</span>
                </div>
              </div>

              <div className="min-h-[30rem] flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6 xl:min-h-[42rem]">
                {displayMessages.length ? (
                  displayMessages.map(message => <MessageBubble key={message.message_id} message={message} />)
                ) : (
                  <div className="flex h-full min-h-[24rem] items-center justify-center rounded-[1.6rem] border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
                    <div className="max-w-xl">
                      <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-300">{PAGE_COPY.emptyTitle}</p>
                      <p className="mt-4 text-base leading-8 text-slate-300">{PAGE_COPY.emptyBody}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-white/8 px-5 py-5 sm:px-6">
                {error ? (
                  <p className="mb-4 rounded-2xl border border-rose-400/20 bg-rose-400/8 px-4 py-3 text-sm text-rose-100">{error}</p>
                ) : null}

                <div className="mb-3 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.22em] text-slate-500">
                  {demoStarterPrompts.slice(0, 3).map(prompt => (
                    <span key={prompt} className="rounded-full border border-white/10 px-3 py-1">{prompt}</span>
                  ))}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <textarea
                    value={input}
                    onChange={event => setInput(event.target.value)}
                    onKeyDown={event => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault()
                        send()
                      }
                    }}
                    placeholder={PAGE_COPY.composerPlaceholder}
                    rows={3}
                    className="min-h-[5.5rem] flex-1 resize-none rounded-[1.5rem] border border-white/10 bg-slate-900/85 px-5 py-4 text-white placeholder-slate-400 outline-none transition focus:border-cyan-400/40 focus:bg-slate-900"
                  />
                  <button
                    onClick={send}
                    disabled={sending}
                    className="rounded-[1.5rem] bg-gradient-to-r from-cyan-500 via-sky-500 to-violet-500 px-7 py-4 text-sm font-bold uppercase tracking-[0.24em] text-white shadow-[0_0_32px_rgba(34,211,238,0.24)] transition hover:scale-[1.01] hover:from-cyan-400 hover:to-violet-400 disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[11rem]"
                  >
                    {sending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-4 rounded-[2rem] border border-white/10 bg-slate-950/48 p-5 shadow-[0_25px_80px_rgba(2,6,23,0.65)] backdrop-blur-2xl">
            <div>
              <p className="text-[11px] uppercase tracking-[0.34em] text-violet-300/80">Bot status</p>
              <h3 className="mt-2 text-2xl font-black text-white">How this bot works right now</h3>
            </div>

            {readinessItems.map(item => (
              <StatusCard key={item.title} title={item.title} body={item.body} tone={item.tone} />
            ))}

            <div className="rounded-[1.45rem] border border-white/10 bg-slate-950/52 p-4">
              <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-300">Latest tool matches</p>
              <div className="mt-4 space-y-3">
                {latestSuggestedTools.length ? (
                  latestSuggestedTools.map(tool => <SuggestedToolCard key={`side-${tool.model_id}`} tool={tool} compact />)
                ) : (
                  <p className="text-sm leading-6 text-slate-300">Send a prompt and the strongest matches from your catalog will appear here.</p>
                )}
              </div>
            </div>

            <div className="rounded-[1.45rem] border border-white/10 bg-slate-950/52 p-4">
              <p className="text-[11px] uppercase tracking-[0.3em] text-violet-300">How to make it work</p>
              <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                {isDemoMode ? (
                  <>
                    <li>1. Share this public link directly. The catalog and chat already work without your localhost server.</li>
                    <li>2. Use the built-in demo account flow so the professor can open chat sessions and the account page.</li>
                    <li>3. When you want the real backend later, set `VITE_API_BASE_URL` to your hosted API and the same UI will switch back.</li>
                    <li>4. Then wire `ANTHROPIC_API_KEY` or another model key on the server to replace the demo ranking brain.</li>
                  </>
                ) : (
                  <>
                    <li>1. Keep `npm run dev` running so both frontend and backend stay online.</li>
                    <li>2. Log in before opening AiMaster so sessions can be stored under your account.</li>
                    <li>3. Add a real API key in `server/.env` such as `ANTHROPIC_API_KEY`.</li>
                    <li>4. Replace the heuristic reply builder in `server/services/aimasterService.js` with a Claude or GPT request that uses the saved history and ranked tools.</li>
                  </>
                )}
              </ol>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
