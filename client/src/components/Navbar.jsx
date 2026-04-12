import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between border-b border-gray-700 bg-gray-900 px-6 py-4">
      <h1 className="text-xl font-bold text-purple-400">AI Safehouse</h1>
      <div className="flex gap-6">
        <Link to="/" className="text-gray-300 transition hover:text-purple-400">Home</Link>
        <Link to="/aimaster" className="text-gray-300 transition hover:text-purple-400">AiMaster</Link>
      </div>
    </nav>
  )
  
}
