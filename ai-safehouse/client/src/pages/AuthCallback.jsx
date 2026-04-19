import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { refreshUser } = useAuth()
  const [message, setMessage] = useState('Finalizing your secure sign-in...')

  useEffect(() => {
    let active = true

    refreshUser()
      .then(user => {
        if (!active) return
        if (user) {
          navigate('/account', { replace: true })
          return
        }
        navigate(`/login?error=${encodeURIComponent('The social login finished, but no session was created. Please try again.')}`, { replace: true })
      })
      .catch(() => {
        if (!active) return
        setMessage('The social provider returned, but the session check failed. Redirecting you back to login...')
        window.setTimeout(() => {
          navigate(`/login?error=${encodeURIComponent('The social login could not be completed. Please try again.')}`, { replace: true })
        }, 1200)
      })

    return () => {
      active = false
    }
  }, [navigate, refreshUser])

  return (
    <section className="page-arrival flex min-h-screen items-center justify-center px-4 py-14 text-white sm:px-6">
      <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-slate-950/54 p-8 text-center shadow-[0_25px_70px_rgba(2,6,23,0.6)] backdrop-blur-2xl">
        <p className="text-[11px] uppercase tracking-[0.35em] text-cyan-300">{(searchParams.get('provider') || 'social').toUpperCase()} Callback</p>
        <h1 className="mt-4 text-3xl font-black text-white">Syncing your account</h1>
        <p className="mt-4 text-sm leading-7 text-slate-300">{message}</p>
      </div>
    </section>
  )
}
