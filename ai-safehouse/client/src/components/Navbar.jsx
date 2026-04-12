import { Link } from 'react-router-dom'
import logo from '../assets/logo.png/4f6a4f88-17ad-4345-812b-5e9b450e7a94-removebg-preview.png'

function NavIcon({ label, tooltip, children }) {
  return (
    <button type="button" className="nav-icon group relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/35 text-slate-100 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-cyan-300/35 hover:text-cyan-200">
      <span className="relative z-10">{children}</span>
      <span className="pointer-events-none absolute right-0 top-[calc(100%+0.75rem)] z-30 w-56 translate-y-2 rounded-2xl border border-cyan-400/15 bg-slate-950/92 px-3 py-2 text-left text-xs leading-5 text-slate-200 opacity-0 shadow-[0_18px_50px_rgba(2,6,23,0.6)] transition duration-200 group-hover:translate-y-0 group-hover:opacity-100">
        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.25em] text-cyan-300">{label}</span>
        {tooltip}
      </span>
    </button>
  )
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  )
}

function ToolsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
      <path d="M4 7h16" />
      <path d="M4 12h10" />
      <path d="M4 17h16" />
      <circle cx="17" cy="12" r="2" />
    </svg>
  )
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
      <path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3Z" />
      <path d="M19 15l.8 1.7L21.5 18l-1.7.8L19 20.5l-.8-1.7-1.7-.8 1.7-.8.8-1.7Z" />
    </svg>
  )
}

function ContactIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
      <path d="M4 6h16v12H4z" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
      <path d="M12 3v3" />
      <path d="M12 18v3" />
      <path d="M3 12h3" />
      <path d="M18 12h3" />
      <path d="m5.6 5.6 2.1 2.1" />
      <path d="m16.3 16.3 2.1 2.1" />
      <path d="m18.4 5.6-2.1 2.1" />
      <path d="m7.7 16.3-2.1 2.1" />
      <circle cx="12" cy="12" r="3.5" />
    </svg>
  )
}

export default function Navbar() {
  return (
    <nav className="relative z-30 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-[2rem] border border-white/10 bg-slate-950/22 px-4 py-3 shadow-[0_18px_60px_rgba(2,6,23,0.45)] backdrop-blur-2xl sm:px-5 lg:px-6">
        <Link to="/home" className="group flex min-w-0 items-center gap-3 rounded-2xl pr-2 transition">
          <div className="logo-signal relative flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-300/12 bg-cyan-300/8 p-2 shadow-[0_0_35px_rgba(34,211,238,0.12)] sm:h-20 sm:w-20">
            <img
              src={logo}
              alt="AI Safehouse Logo"
              className="relative z-10 h-full w-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.45em] text-cyan-300/75 sm:text-[11px]">AI Safehouse</p>
            <h1 className="bg-gradient-to-r from-cyan-200 via-sky-300 to-violet-300 bg-clip-text text-lg font-black text-transparent sm:text-2xl">
              Neural Vault
            </h1>
            <p className="hidden text-xs text-slate-300/70 sm:block">Discover tools, ask AiMaster, and shape the next upgrade.</p>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-slate-950/28 p-1.5 backdrop-blur-xl md:flex">
            <Link to="/home" className="rounded-full px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/8 hover:text-cyan-200">
              Home
            </Link>
            <Link to="/aimaster" className="rounded-full px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/8 hover:text-cyan-200">
              AiMaster
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <NavIcon label="Account" tooltip="Open your account space, profile details, and saved preferences.">
              <UserIcon />
            </NavIcon>
            <NavIcon label="AI Tools" tooltip="Shows the AI tools you used recently so the user understands what powered the experience.">
              <ToolsIcon />
            </NavIcon>
            <NavIcon label="Spark Idea" tooltip="Tell us how we can improve the website, add smarter flows, or design better features for you.">
              <SparkIcon />
            </NavIcon>
            <NavIcon label="Contact" tooltip="Reach the Safehouse team for support, questions, or project collaboration.">
              <ContactIcon />
            </NavIcon>
            <NavIcon label="Settings" tooltip="Adjust interface preferences, assistant behavior, and display options.">
              <SettingsIcon />
            </NavIcon>
          </div>
        </div>
      </div>
    </nav>
  )
}
