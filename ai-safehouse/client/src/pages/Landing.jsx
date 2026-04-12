import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const transitionDurationMs = 420

export default function Landing() {
  const navigate = useNavigate()
  const [departingTo, setDepartingTo] = useState('')

  const launchRoute = target => {
    if (departingTo) return
    setDepartingTo(target)
    window.setTimeout(() => navigate(target), transitionDurationMs)
  }

  return (
    <section className={`landing-scene relative min-h-screen overflow-hidden text-white ${departingTo ? 'is-departing' : ''}`}>
      <div className="landing-focus absolute left-1/2 top-[18%] h-56 w-56 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="landing-content relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 text-center">
        <p className="mb-5 inline-flex rounded-full border border-cyan-400/20 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.45em] text-cyan-300 backdrop-blur-md">
          AI Safehouse Command Hub
        </p>

        <h1 className="max-w-5xl text-5xl font-black leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
          Launch Into the
          <span className="block bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400 bg-clip-text text-transparent">
            AI Safehouse Universe
          </span>
        </h1>

        <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
          Open the Safehouse from orbit, then jump into the tool vault or speak directly with AiMaster Bot.
        </p>

        <div className="mt-12 flex flex-col gap-4 sm:flex-row">
          <button
            type="button"
            onClick={() => launchRoute('/home')}
            className="rounded-full border border-cyan-300/30 bg-cyan-400/15 px-8 py-4 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-100 shadow-[0_0_40px_rgba(34,211,238,0.18)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-200/50 hover:bg-cyan-300/20"
          >
            Home Page
          </button>
          <button
            type="button"
            onClick={() => launchRoute('/aimaster')}
            className="rounded-full border border-violet-300/25 bg-violet-400/10 px-8 py-4 text-sm font-semibold uppercase tracking-[0.25em] text-violet-100 shadow-[0_0_40px_rgba(168,85,247,0.16)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-violet-200/45 hover:bg-violet-300/18"
          >
            AiMaster Bot
          </button>
        </div>
      </div>
    </section>
  )
}
