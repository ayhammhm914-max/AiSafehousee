import { useState } from 'react'
import axios from 'axios'

const demoHistory = [
  'Suggested Midjourney for a surreal poster concept',
  'Matched ElevenLabs with a cinematic voiceover request',
  'Ranked Claude and ChatGPT for long-form research support',
  'Recommended Sora for short promo storyboard ideas',
  'Guided a user toward GitHub Copilot for refactoring help',
  'Compared image tools for logo exploration and brand moodboards',
  'Summarized tool strengths for a startup landing page workflow',
  'Surfaced productivity tools for note capture and sprint planning',
]

const welcomeMessage = '\u0623\u0647\u0644\u0627\u064b! \u0623\u0646\u0627 AiMaster. \u0627\u062d\u0643\u064a\u0644\u064a \u0634\u0648 \u0628\u062f\u0643 \u062a\u0639\u0645\u0644 \u0648\u0628\u0642\u062a\u0631\u062d\u0644\u0643 \u0623\u0641\u0636\u0644 \u0623\u062f\u0648\u0627\u062a AI.'
const serverErrorMessage = '\u0641\u064a \u0645\u0634\u0643\u0644\u0629 \u0628\u0627\u0644\u0633\u064a\u0631\u0641\u0631\u060c \u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u062b\u0627\u0646\u064a\u0629.'
const thinkingMessage = '\u0627\u0644\u0628\u0648\u062a \u064a\u0641\u0643\u0631...'
const placeholderText = '\u0645\u062b\u0644\u0627\u064b: \u0628\u062f\u064a \u0623\u0639\u0645\u0644 \u0641\u064a\u062f\u064a\u0648 \u062a\u0633\u0648\u064a\u0642\u064a...'
const sendLabel = '\u0625\u0631\u0633\u0627\u0644'

export default function AiMaster() {
  const [messages, setMessages] = useState([{ role: 'ai', text: welcomeMessage }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const send = async () => {
    if (!input.trim()) return

    const message = input
    setMessages(prev => [...prev, { role: 'user', text: message }])
    setInput('')
    setLoading(true)

    try {
      const { data } = await axios.post('http://localhost:5000/api/aimaster', { message })
      setMessages(prev => [...prev, { role: 'ai', text: data.reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: serverErrorMessage }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="page-arrival min-h-[calc(100vh-113px)] bg-slate-950/30 px-4 py-8 text-white backdrop-blur-[1px] sm:px-6 lg:px-8">
      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="mb-6 text-center">
          <p className="mb-3 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-cyan-300 backdrop-blur-md">
            Orbital AI Assistant
          </p>
          <h2 className="text-4xl font-black text-white sm:text-5xl">
            <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400 bg-clip-text text-transparent">
              AiMaster Bot
            </span>
          </h2>
        </div>

        <div className="chat-history-shell relative rounded-[2rem] border border-white/10 bg-slate-950/46 p-4 shadow-[0_25px_80px_rgba(2,6,23,0.65)] backdrop-blur-2xl sm:p-6">
          <div className="pointer-events-none absolute inset-y-6 left-4 hidden w-52 flex-col justify-between xl:flex">
            {demoHistory.slice(0, 4).map((item, index) => (
              <div key={item} className="history-chip border-l-2 border-cyan-400/25 pl-4 text-xs leading-5 text-slate-300/72" style={{ animationDelay: `${index * 120}ms` }}>
                {item}
              </div>
            ))}
          </div>

          <div className="pointer-events-none absolute inset-y-6 right-4 hidden w-52 flex-col justify-between xl:flex">
            {demoHistory.slice(4).map((item, index) => (
              <div key={item} className="history-chip border-r-2 border-violet-400/25 pr-4 text-right text-xs leading-5 text-slate-300/72" style={{ animationDelay: `${index * 120}ms` }}>
                {item}
              </div>
            ))}
          </div>

          <div className="mx-auto max-w-4xl rounded-[1.75rem] border border-white/8 bg-slate-950/40 p-4 sm:p-5">
            <div className="mb-4 flex h-[600px] flex-col gap-4 overflow-y-auto rounded-[1.5rem] border border-white/8 bg-slate-950/52 p-5 sm:h-[660px] sm:p-6">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[82%] rounded-3xl px-5 py-4 text-sm leading-7 shadow-lg sm:text-base ${
                      msg.role === 'user'
                        ? 'rounded-br-none bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-fuchsia-950/40'
                        : 'rounded-bl-none border border-cyan-400/10 bg-slate-900/85 text-slate-100 shadow-cyan-950/20'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-3xl rounded-bl-none border border-cyan-400/10 bg-slate-900/85 px-5 py-4 text-sm text-cyan-200 animate-pulse sm:text-base">
                    {thinkingMessage}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder={placeholderText}
                className="flex-1 rounded-2xl border border-white/10 bg-slate-900/80 px-5 py-4 text-white placeholder-slate-400 outline-none transition focus:border-cyan-400/40 focus:bg-slate-900"
              />
              <button
                onClick={send}
                className="rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 px-7 py-4 font-bold text-white shadow-[0_0_30px_rgba(34,211,238,0.22)] transition hover:scale-[1.02] hover:from-cyan-400 hover:to-violet-400"
              >
                {sendLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
