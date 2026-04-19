import { useState } from 'react'
import AuthCard from '../components/AuthCard'
import { usePageTransition } from '../context/PageTransitionContext'

export default function Landing() {
  const startTransition = usePageTransition()
  const [departingTo, setDepartingTo] = useState('')
  const [portalExpanded, setPortalExpanded] = useState(false)

  const launchRoute = (target, tone) => {
    if (departingTo) return
    setDepartingTo(target)
    startTransition(target, tone)
  }

  return (
    <section className={`landing-scene relative min-h-screen overflow-hidden text-white ${departingTo ? 'is-departing' : ''} ${portalExpanded ? 'is-portal-expanded' : ''}`}>
      <div className="landing-focus absolute left-1/2 top-[18%] h-56 w-56 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="landing-focus absolute left-[22%] top-[28%] h-32 w-32 rounded-full bg-sky-400/6 blur-3xl" />
      <div className="landing-focus absolute right-[19%] top-[26%] h-40 w-40 rounded-full bg-violet-400/8 blur-3xl" />

      <div className={`landing-content relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 pb-44 text-center xl:pb-24 ${portalExpanded ? 'landing-content-compressed' : ''}`}>
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

        <div className="landing-pulse-panel mt-10 grid max-w-4xl gap-3 rounded-[2rem] border border-white/10 bg-slate-950/18 p-4 backdrop-blur-xl sm:grid-cols-3 sm:p-5">
          <div className="rounded-[1.5rem] border border-cyan-400/12 bg-slate-950/24 px-4 py-3 text-left">
            <p className="text-[11px] uppercase tracking-[0.35em] text-cyan-300/80">Orbital Safehouse</p>
            <p className="mt-2 text-sm leading-6 text-slate-200/80">Transitions now pulse like a holographic vault scan instead of a plain fade.</p>
          </div>
          <div className="rounded-[1.5rem] border border-sky-400/12 bg-slate-950/24 px-4 py-3 text-left">
            <p className="text-[11px] uppercase tracking-[0.35em] text-sky-300/80">Neural Grid</p>
            <p className="mt-2 text-sm leading-6 text-slate-200/80">A soft digital mesh lives over the video so the scene feels more like an AI network.</p>
          </div>
          <div className="rounded-[1.5rem] border border-violet-400/12 bg-slate-950/24 px-4 py-3 text-left">
            <p className="text-[11px] uppercase tracking-[0.35em] text-violet-300/80">Hologram Jump</p>
            <p className="mt-2 text-sm leading-6 text-slate-200/80">Each route jump now uses a branded scan line and luminous ring before the next page lands.</p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 sm:flex-row">
          <button type="button" onClick={() => launchRoute('/home', 'cyan')} className="rounded-full border border-cyan-300/30 bg-cyan-400/15 px-8 py-4 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-100 shadow-[0_0_40px_rgba(34,211,238,0.18)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-200/50 hover:bg-cyan-300/20">Home Page</button>
          <button type="button" onClick={() => launchRoute('/aimaster', 'violet')} className="rounded-full border border-violet-300/25 bg-violet-400/10 px-8 py-4 text-sm font-semibold uppercase tracking-[0.25em] text-violet-100 shadow-[0_0_40px_rgba(168,85,247,0.16)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-violet-200/45 hover:bg-violet-300/18">AiMaster Bot</button>
        </div>
      </div>

      <div className="absolute bottom-6 left-4 right-auto z-20 xl:bottom-8 xl:left-8">
        <div className={`account-dock relative overflow-hidden border border-white/10 bg-slate-950/52 shadow-[0_20px_70px_rgba(2,6,23,0.65)] backdrop-blur-2xl ${portalExpanded ? 'is-expanded' : ''}`} onMouseEnter={() => setPortalExpanded(true)} onMouseLeave={() => setPortalExpanded(false)} onFocus={() => setPortalExpanded(true)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setPortalExpanded(false) }}>
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/65 to-transparent" />
          <button type="button" onClick={() => setPortalExpanded(prev => !prev)} className="account-dock-trigger relative flex h-18 w-18 items-center justify-center rounded-[1.65rem] border border-cyan-300/16 bg-cyan-400/8 text-cyan-100 transition hover:border-cyan-200/35 hover:bg-cyan-300/12" aria-expanded={portalExpanded} aria-label="Open account portal">
            <span className="account-dock-ping" />
            <span className="relative z-10 flex flex-col items-center gap-1.5">
              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.8]"><path d="M20 21a8 8 0 0 0-16 0" /><circle cx="12" cy="8" r="4" /></svg>
              <span className="text-[10px] uppercase tracking-[0.34em]">Account</span>
            </span>
          </button>
          <div className="account-dock-panel">
            <AuthCard onSuccess={() => launchRoute('/account', 'sky')} />
          </div>
        </div>
      </div>
    </section>
  )
}
