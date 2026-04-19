import { Navigate } from 'react-router-dom'
import AuthCard from '../components/AuthCard'
import { useAuth } from '../context/AuthContext'
import { usePageTransition } from '../context/PageTransitionContext'

export default function SignUp() {
  const { isAuthenticated, isLoading } = useAuth()
  const startTransition = usePageTransition()

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/account" replace />
  }

  return (
    <section className="page-arrival flex min-h-screen items-center justify-center px-4 py-14 text-white sm:px-6">
      <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-slate-950/52 p-6 shadow-[0_25px_70px_rgba(2,6,23,0.6)] backdrop-blur-2xl sm:p-8">
        <AuthCard defaultMode="register" onSuccess={() => startTransition('/account', 'sky')} showReturnHome />

        <div className="mt-6 flex items-center justify-between gap-4 text-sm text-slate-300">
          <span>Already have an account?</span>
          <button
            type="button"
            onClick={() => startTransition('/login', 'cyan')}
            className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-cyan-100 transition hover:border-cyan-200/40 hover:bg-cyan-300/16"
          >
            Log in
          </button>
        </div>
      </div>
    </section>
  )
}
