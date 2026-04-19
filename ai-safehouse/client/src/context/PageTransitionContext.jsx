import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const TRANSITION_OUT_MS = 240
const TRANSITION_TOTAL_MS = 820

const PageTransitionContext = createContext(() => {})

function TransitionOverlay({ phase, tone }) {
  return (
    <div
      className={`route-transition-overlay ${phase !== 'idle' ? 'is-active' : ''} ${phase === 'departing' ? 'is-departing' : ''} ${phase === 'arriving' ? 'is-arriving' : ''} tone-${tone}`}
      aria-hidden="true"
    >
      <div className="route-transition-grid" />
      <div className="route-transition-flare" />
      <div className="route-transition-ring" />
      <div className="route-transition-scan" />
    </div>
  )
}

export function PageTransitionProvider({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const currentPathRef = useRef(location.pathname)
  const timersRef = useRef([])
  const [transition, setTransition] = useState({ phase: 'idle', tone: 'cyan' })

  useEffect(() => {
    currentPathRef.current = location.pathname
  }, [location.pathname])

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout)
    }
  }, [])

  const startTransition = useCallback((target, tone = 'cyan') => {
    if (!target || target === currentPathRef.current || transition.phase !== 'idle') {
      return
    }

    timersRef.current.forEach(clearTimeout)
    timersRef.current = []

    setTransition({ phase: 'departing', tone })

    timersRef.current.push(window.setTimeout(() => {
      navigate(target)
    }, TRANSITION_OUT_MS))

    timersRef.current.push(window.setTimeout(() => {
      setTransition({ phase: 'arriving', tone })
    }, TRANSITION_OUT_MS + 70))

    timersRef.current.push(window.setTimeout(() => {
      setTransition({ phase: 'idle', tone: 'cyan' })
      timersRef.current = []
    }, TRANSITION_TOTAL_MS))
  }, [navigate, transition.phase])

  const value = useMemo(() => startTransition, [startTransition])

  return (
    <PageTransitionContext.Provider value={value}>
      <TransitionOverlay phase={transition.phase} tone={transition.tone} />
      <div className={`route-content-shell ${transition.phase !== 'idle' ? `is-${transition.phase}` : ''}`}>
        {children}
      </div>
    </PageTransitionContext.Provider>
  )
}

export function usePageTransition() {
  return useContext(PageTransitionContext)
}
