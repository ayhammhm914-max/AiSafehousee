import { useAuth } from '../context/AuthContext'
import { usePageTransition } from '../context/PageTransitionContext'

function NavIcon({ label, tooltip, children, onClick }) {
  return (
    <button type="button" onClick={onClick} className="nav-icon group relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/35 text-slate-100 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-cyan-300/35 hover:text-cyan-200">
      <span className="relative z-10">{children}</span>
      <span className="pointer-events-none absolute right-0 top-[calc(100%+0.75rem)] z-30 w-56 translate-y-2 rounded-2xl border border-cyan-400/15 bg-slate-950/92 px-3 py-2 text-left text-xs leading-5 text-slate-200 opacity-0 shadow-[0_18px_50px_rgba(2,6,23,0.6)] transition duration-200 group-hover:translate-y-0 group-hover:opacity-100"><span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.25em] text-cyan-300">{label}</span>{tooltip}</span>
    </button>
  )
}

function TransitionNavButton({ to, tone, className, children }) {
  const startTransition = usePageTransition()
  return <button type="button" onClick={() => startTransition(to, tone)} className={className}>{children}</button>
}

function UserIcon() { return <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]"><path d="M20 21a8 8 0 0 0-16 0" /><circle cx="12" cy="8" r="4" /></svg> }
function ToolsIcon() { return <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]"><path d="M4 7h16" /><path d="M4 12h10" /><path d="M4 17h16" /><circle cx="17" cy="12" r="2" /></svg> }
function SparkIcon() { return <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]"><path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3Z" /><path d="M19 15l.8 1.7L21.5 18l-1.7.8L19 20.5l-.8-1.7-1.7-.8 1.7-.8.8-1.7Z" /></svg> }
function ContactIcon() { return <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]"><path d="M4 6h16v12H4z" /><path d="m4 7 8 6 8-6" /></svg> }
function SettingsIcon() { return <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]"><path d="M12 3v3" /><path d="M12 18v3" /><path d="M3 12h3" /><path d="M18 12h3" /><path d="m5.6 5.6 2.1 2.1" /><path d="m16.3 16.3 2.1 2.1" /><path d="m18.4 5.6-2.1 2.1" /><path d="m7.7 16.3-2.1 2.1" /><circle cx="12" cy="12" r="3.5" /></svg> }

function ElectricBrainLogo() {
  const rays = Array.from({ length: 8 })
  return (
    <div className="brain-logo" aria-hidden="true"><div className="brain-orbit" />{rays.map((_, index) => <span key={index} className="brain-ray" style={{ '--angle': `${index * 45}deg`, '--delay': `${index * 0.2}s` }} />)}<svg viewBox="0 0 160 160" className="brain-svg" role="presentation"><defs><linearGradient id="brainStroke" x1="26" x2="134" y1="22" y2="136" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#67e8f9" /><stop offset="52%" stopColor="#38bdf8" /><stop offset="100%" stopColor="#a78bfa" /></linearGradient><radialGradient id="brainCoreGlow" cx="50%" cy="50%" r="60%"><stop offset="0%" stopColor="rgba(224,255,255,0.98)" /><stop offset="45%" stopColor="rgba(103,232,249,0.92)" /><stop offset="100%" stopColor="rgba(34,211,238,0)" /></radialGradient></defs><path className="brain-shell" d="M80 23C64 23 50 30 44 42C32 47 25 58 25 71C25 83 29 92 35 100C37 114 46 126 60 132C67 136 73 138 80 138V23Z" /><path className="brain-shell" d="M80 23C96 23 110 30 116 42C128 47 135 58 135 71C135 83 131 92 125 100C123 114 114 126 100 132C93 136 87 138 80 138V23Z" /><path className="brain-divider" d="M80 30L80 130" /><path className="brain-divider" d="M80 46C74 55 74 65 80 72C86 79 86 89 80 97C74 105 74 114 80 122" /><path className="circuit-trace" d="M62 48H50V62H42" /><path className="circuit-trace" d="M70 66H56V80H48V93" /><path className="circuit-trace" d="M64 96H52V111H61" /><path className="circuit-trace" d="M74 38V56H66" /><path className="circuit-trace" d="M72 112V126" /><circle className="brain-node" cx="50" cy="48" r="4.6" /><circle className="brain-node" cx="42" cy="62" r="3.8" /><circle className="brain-node" cx="48" cy="93" r="3.9" /><circle className="brain-node" cx="61" cy="111" r="4.2" /><path className="neural-trace" d="M90 44C102 40 114 47 114 58C114 64 111 68 105 72" /><path className="neural-trace" d="M92 64C104 60 118 68 118 81C118 88 114 92 108 95" /><path className="neural-trace" d="M90 88C100 84 111 91 111 101C111 109 105 113 98 116" /><path className="neural-trace" d="M88 112C97 108 106 113 106 121" /><circle className="brain-spark" cx="80" cy="81" r="19" fill="url(#brainCoreGlow)" /><circle className="brain-core" cx="80" cy="81" r="11.5" /></svg></div>
  )
}

export default function Navbar() {
  const startTransition = usePageTransition()
  const { isAuthenticated } = useAuth()

  return (
    <nav className="relative z-30 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-[2rem] border border-white/10 bg-slate-950/22 px-4 py-3 shadow-[0_18px_60px_rgba(2,6,23,0.45)] backdrop-blur-2xl sm:px-5 lg:px-6">
        <TransitionNavButton to="/" tone="cyan" className="group flex min-w-0 items-center gap-3 rounded-2xl pr-2 text-left transition">
          <div className="logo-signal relative flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-300/12 bg-cyan-300/8 p-2 shadow-[0_0_35px_rgba(34,211,238,0.12)] sm:h-20 sm:w-20"><ElectricBrainLogo /></div>
          <div className="min-w-0"><p className="text-[10px] uppercase tracking-[0.45em] text-cyan-300/75 sm:text-[11px]">AI Safehouse</p><h1 className="bg-gradient-to-r from-cyan-200 via-sky-300 to-violet-300 bg-clip-text text-lg font-black text-transparent sm:text-2xl">Ai SafeHouse</h1><p className="hidden text-xs text-slate-300/70 sm:block">Discover tools, ask AiMaster, and shape the next upgrade.</p></div>
        </TransitionNavButton>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-slate-950/28 p-1.5 backdrop-blur-xl md:flex">
            <TransitionNavButton to="/home" tone="cyan" className="rounded-full px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/8 hover:text-cyan-200">Home</TransitionNavButton>
            <TransitionNavButton to="/aimaster" tone="violet" className="rounded-full px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/8 hover:text-cyan-200">AiMaster</TransitionNavButton>
          </div>
          <div className="flex items-center gap-2">
            <NavIcon label="Account" tooltip={isAuthenticated ? 'Open your secured account, profile details, and active providers.' : 'Sign in or create a new account to unlock the protected account page.'} onClick={() => startTransition(isAuthenticated ? '/account' : '/login', 'sky')}><UserIcon /></NavIcon>
            <NavIcon label="AI Tools" tooltip="Shows the AI tools you used recently so the user understands what powered the experience."><ToolsIcon /></NavIcon>
            <NavIcon label="Spark Idea" tooltip="Tell us how we can improve the website, add smarter flows, or design better features for you."><SparkIcon /></NavIcon>
            <NavIcon label="Contact" tooltip="Reach the Safehouse team for support, questions, or project collaboration."><ContactIcon /></NavIcon>
            <NavIcon label="Settings" tooltip="Adjust interface preferences, assistant behavior, and display options."><SettingsIcon /></NavIcon>
          </div>
        </div>
      </div>
    </nav>
  )
}
