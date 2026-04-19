import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../lib/api'
import { useAuth } from '../context/AuthContext'

function AccountPortalIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.8]">
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.2-.9 2.2-1.9 2.9l3.1 2.4c1.8-1.7 2.8-4.1 2.8-6.9 0-.7-.1-1.4-.2-2H12Z" />
      <path fill="#34A853" d="M12 21c2.7 0 4.9-.9 6.6-2.5l-3.1-2.4c-.9.6-2 1-3.5 1-2.7 0-5-1.8-5.8-4.3l-3.2 2.5C4.7 18.6 8.1 21 12 21Z" />
      <path fill="#4A90E2" d="M6.2 12.8c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8L3 6.7C2.3 8.1 2 9.5 2 11s.3 2.9 1 4.3l3.2-2.5Z" />
      <path fill="#FBBC05" d="M12 5c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 2.1 14.7 1 12 1 8.1 1 4.7 3.4 3 6.7l3.2 2.5C7 6.8 9.3 5 12 5Z" />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M16.7 12.8c0-2 1.7-3 1.8-3.1-1-1.5-2.6-1.7-3.1-1.7-1.3-.1-2.6.8-3.2.8-.6 0-1.5-.8-2.5-.8-1.3 0-2.5.7-3.1 1.8-1.3 2.2-.3 5.4.9 7.1.6.8 1.3 1.8 2.2 1.8.9 0 1.2-.6 2.3-.6 1 0 1.3.6 2.3.6 1 0 1.5-.9 2.1-1.7.7-.9 1-1.8 1-1.9-.1 0-1.7-.7-1.7-3.3Zm-2.2-6.2c.5-.6.9-1.5.8-2.3-.8 0-1.8.5-2.4 1.1-.5.6-.9 1.5-.8 2.3.9.1 1.8-.4 2.4-1.1Z" />
    </svg>
  )
}

const initialLoginState = {
  email: '',
  password: '',
}

const initialRegisterState = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
}

export default function AuthCard({
  defaultMode = 'login',
  externalMessage = '',
  onSuccess,
  showReturnHome = false,
}) {
  const navigate = useNavigate()
  const { login, logout, providers, register, startSocialLogin, user, isDemoMode } = useAuth()
  const [mode, setMode] = useState(defaultMode)
  const [loginForm, setLoginForm] = useState(initialLoginState)
  const [registerForm, setRegisterForm] = useState(initialRegisterState)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState({ type: '', message: '' })

  useEffect(() => {
    setMode(defaultMode)
  }, [defaultMode])

  useEffect(() => {
    if (externalMessage) {
      setFeedback({ type: 'error', message: externalMessage })
    }
  }, [externalMessage])

  const heading = useMemo(() => (mode === 'login' ? 'Log In' : 'Create Account'), [mode])

  const finishAuth = async payload => {
    if (onSuccess) {
      await onSuccess(payload.user)
      return
    }

    navigate('/account', { replace: true })
  }

  const handleLoginChange = event => {
    const { name, value } = event.target
    setLoginForm(prev => ({ ...prev, [name]: value }))
  }

  const handleRegisterChange = event => {
    const { name, value } = event.target
    setRegisterForm(prev => ({ ...prev, [name]: value }))
  }

  const submitLogin = async event => {
    event.preventDefault()
    if (submitting) return

    setSubmitting(true)
    setFeedback({ type: '', message: '' })

    try {
      const payload = await login(loginForm)
      setFeedback({ type: 'success', message: payload.message })
      await finishAuth(payload)
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getApiErrorMessage(
          error,
          'Login failed. Please try again.',
          'Backend is offline. Start the server to log in.',
        ),
      })
    } finally {
      setSubmitting(false)
    }
  }

  const submitRegister = async event => {
    event.preventDefault()
    if (submitting) return

    if (registerForm.password !== registerForm.confirmPassword) {
      setFeedback({ type: 'error', message: 'Passwords do not match.' })
      return
    }

    setSubmitting(true)
    setFeedback({ type: '', message: '' })

    try {
      const payload = await register({
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
      })
      setFeedback({ type: 'success', message: payload.message })
      await finishAuth(payload)
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getApiErrorMessage(
          error,
          'Account creation failed. Please try again.',
          'Backend is offline. Start the server to create an account.',
        ),
      })
    } finally {
      setSubmitting(false)
    }
  }

  const socialButtons = [
    {
      provider: 'google',
      label: 'Continue with Google',
      icon: <GoogleIcon />,
      enabled: providers.google,
    },
    {
      provider: 'apple',
      label: 'Continue with Apple',
      icon: <AppleIcon />,
      enabled: providers.apple,
    },
  ]

  if (user) {
    return (
      <div>
        {showReturnHome ? (
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/18 bg-cyan-400/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100 transition hover:-translate-y-0.5 hover:border-cyan-200/35 hover:bg-cyan-300/14"
          >
            <span className="text-base leading-none">&#8592;</span>
            Return Home
          </button>
        ) : null}

        <div className="mb-5 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-[1.5rem] border border-cyan-300/18 bg-cyan-400/10 text-cyan-100 shadow-[0_0_32px_rgba(34,211,238,0.16)]">
            <AccountPortalIcon />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.34em] text-cyan-300/85">{isDemoMode ? 'Demo Access Ready' : 'Account Ready'}</p>
            <h2 className="mt-2 text-2xl font-black text-white">Welcome back</h2>
          </div>
        </div>

        <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-200">
          <p className="text-lg font-semibold text-white">{user.name || user.username}</p>
          <p className="mt-1 text-slate-300">{user.email}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {user.providers?.map(provider => (
              <span key={provider} className="rounded-full border border-cyan-400/15 bg-cyan-400/8 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-cyan-100">
                {provider}
              </span>
            ))}
            {isDemoMode ? (
              <span className="rounded-full border border-violet-400/15 bg-violet-400/8 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-violet-100">
                public demo
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => navigate('/account')}
            className="rounded-2xl border border-cyan-300/30 bg-cyan-400/14 px-4 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-100 transition hover:border-cyan-200/50 hover:bg-cyan-300/20"
          >
            Open Account
          </button>
          <button
            type="button"
            onClick={async () => {
              await logout()
              setFeedback({ type: 'success', message: 'You signed out successfully.' })
            }}
            className="rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-slate-200 transition hover:border-white/20 hover:bg-white/10"
          >
            Logout
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {showReturnHome ? (
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/18 bg-cyan-400/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100 transition hover:-translate-y-0.5 hover:border-cyan-200/35 hover:bg-cyan-300/14"
        >
          <span className="text-base leading-none">&#8592;</span>
          Return Home
        </button>
      ) : null}

      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.34em] text-cyan-300/85">{isDemoMode ? 'Demo Access Portal' : 'Access Portal'}</p>
          <h2 className="mt-2 text-2xl font-black text-white">{heading}</h2>
        </div>
        <div className="flex rounded-full border border-white/10 bg-white/5 p-1 text-xs uppercase tracking-[0.28em]">
          <button
            type="button"
            onClick={() => {
              setMode('login')
              setFeedback({ type: '', message: '' })
            }}
            className={`rounded-full px-4 py-2 transition ${mode === 'login' ? 'bg-cyan-400/18 text-cyan-100' : 'text-slate-300 hover:text-white'}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register')
              setFeedback({ type: '', message: '' })
            }}
            className={`rounded-full px-4 py-2 transition ${mode === 'register' ? 'bg-violet-400/18 text-violet-100' : 'text-slate-300 hover:text-white'}`}
          >
            Create
          </button>
        </div>
      </div>

      {mode === 'login' ? (
        <form className="space-y-3" onSubmit={submitLogin}>
          <input
            name="email"
            type="email"
            value={loginForm.email}
            onChange={handleLoginChange}
            placeholder="Email"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-300/35 focus:bg-white/[0.07]"
          />
          <input
            name="password"
            type="password"
            value={loginForm.password}
            onChange={handleLoginChange}
            placeholder="Password"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-300/35 focus:bg-white/[0.07]"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl border border-cyan-300/30 bg-cyan-400/15 px-4 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-100 transition hover:border-cyan-200/50 hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Entering...' : 'Log In'}
          </button>
        </form>
      ) : (
        <form className="space-y-3" onSubmit={submitRegister}>
          <input
            name="name"
            value={registerForm.name}
            onChange={handleRegisterChange}
            placeholder="Name (optional)"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-violet-300/35 focus:bg-white/[0.07]"
          />
          <input
            name="email"
            type="email"
            value={registerForm.email}
            onChange={handleRegisterChange}
            placeholder="Email"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-violet-300/35 focus:bg-white/[0.07]"
          />
          <input
            name="password"
            type="password"
            value={registerForm.password}
            onChange={handleRegisterChange}
            placeholder="Password"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-violet-300/35 focus:bg-white/[0.07]"
          />
          <input
            name="confirmPassword"
            type="password"
            value={registerForm.confirmPassword}
            onChange={handleRegisterChange}
            placeholder="Confirm password"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-violet-300/35 focus:bg-white/[0.07]"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl border border-violet-300/30 bg-violet-400/14 px-4 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-violet-100 transition hover:border-violet-200/45 hover:bg-violet-300/18 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Creating...' : 'Create Account'}
          </button>
        </form>
      )}

      <div className="my-4 flex items-center gap-3 text-xs uppercase tracking-[0.28em] text-slate-500">
        <span className="h-px flex-1 bg-white/10" />
        Continue With
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {socialButtons.map(item => (
          <button
            key={item.provider}
            type="button"
            disabled={submitting || !item.enabled}
            onClick={() => startSocialLogin(item.provider)}
            className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-cyan-300/20 hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-45"
            title={item.enabled ? item.label : isDemoMode ? `${item.label} is disabled in the public demo.` : `${item.label} is not configured yet.`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {feedback.message ? (
        <p className={`mt-4 rounded-2xl border px-4 py-3 text-sm leading-6 ${feedback.type === 'success' ? 'border-emerald-400/20 bg-emerald-400/8 text-emerald-100' : 'border-rose-400/20 bg-rose-400/8 text-rose-100'}`}>
          {feedback.message}
        </p>
      ) : null}

      <p className="mt-4 text-xs leading-6 text-slate-400">
        {isDemoMode
          ? 'Public demo mode stores your account, sessions, and chat history inside this browser so the site keeps working from a shared link without the local backend.'
          : 'Local accounts are saved in MySQL with hashed passwords. Google and Apple accounts create or link user records automatically when their verified email is safe to match.'}
      </p>
    </div>
  )
}
