import { useState } from 'react'
import axios from 'axios'

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
    <div className="min-h-screen bg-gray-950 px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <h2 className="mb-6 text-center text-3xl font-bold text-purple-400">AiMaster Bot</h2>

        <div className="mb-4 flex h-[500px] flex-col gap-3 overflow-y-auto rounded-2xl border border-gray-700 bg-gray-900 p-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === 'user'
                    ? 'rounded-br-none bg-purple-700 text-white'
                    : 'rounded-bl-none bg-gray-800 text-gray-200'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-none bg-gray-800 px-4 py-3 text-sm text-gray-400 animate-pulse">
                {thinkingMessage}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder={placeholderText}
            className="flex-1 rounded-xl border border-gray-600 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
          />
          <button
            onClick={send}
            className="rounded-xl bg-purple-600 px-6 py-3 font-bold text-white transition hover:bg-purple-500"
          >
            {sendLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
