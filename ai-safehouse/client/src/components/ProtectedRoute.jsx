import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const location = useLocation()
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <section className="page-arrival flex min-h-[calc(100vh-113px)] items-center justify-center px-4 py-12 text-white">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/48 px-8 py-6 text-center shadow-[0_25px_70px_rgba(2,6,23,0.58)] backdrop-blur-2xl">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Authorizing</p>
          <p className="mt-4 text-lg text-slate-200">Loading your Safehouse session...</p>
        </div>
      </section>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}
