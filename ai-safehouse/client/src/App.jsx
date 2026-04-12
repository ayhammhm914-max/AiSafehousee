import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Home from './pages/Home'
import AiMaster from './pages/AiMaster'

const youtubeEmbedUrl = 'https://www.youtube.com/embed/HIvqw74pCFc?autoplay=1&mute=1&controls=0&loop=1&playlist=HIvqw74pCFc&playsinline=1&rel=0&modestbranding=1&enablejsapi=1'

function BackgroundVideo() {
  return (
    <div className="fixed inset-0 overflow-hidden bg-[#020617]">
      <iframe
        className="landing-video-frame absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        src={youtubeEmbedUrl}
        title="AI Safehouse Background"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_28%),radial-gradient(circle_at_bottom,rgba(139,92,246,0.16),transparent_34%),linear-gradient(180deg,rgba(2,6,23,0.28),rgba(2,6,23,0.72)_45%,rgba(2,6,23,0.88))]" />
      <div className="absolute inset-0 starfield opacity-55" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.9)_0%,rgba(2,6,23,0.34)_26%,rgba(2,6,23,0.18)_50%,rgba(2,6,23,0.42)_74%,rgba(2,6,23,0.9)_100%)]" />
    </div>
  )
}

function AppShell() {
  const location = useLocation()
  const showNavbar = location.pathname !== '/'

  return (
    <div className="relative min-h-screen text-white">
      <BackgroundVideo />
      <div className="relative z-20">
        {showNavbar && <Navbar />}
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route path="/aimaster" element={<AiMaster />} />
        </Routes>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}
