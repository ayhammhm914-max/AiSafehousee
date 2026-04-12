import { useEffect, useState } from 'react'
import axios from 'axios'
import ToolCard from '../components/ToolCard'
import SearchBar from '../components/SearchBar'
import FilterBar from '../components/FilterBar'
import { mockCategories, mockTools } from '../mockTools'

function matchesFilters(tool, search, category) {
  const normalizedSearch = search.trim().toLowerCase()
  const matchesSearch =
    !normalizedSearch ||
    tool.name.toLowerCase().includes(normalizedSearch) ||
    tool.description.toLowerCase().includes(normalizedSearch) ||
    String(tool.tags || '').toLowerCase().includes(normalizedSearch)

  const matchesCategory = !category || tool.category_name === category

  return matchesSearch && matchesCategory
}

export default function Home() {
  const [apiTools, setApiTools] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [hoveredToolId, setHoveredToolId] = useState(null)

  useEffect(() => {
    axios.get('http://localhost:5000/api/categories')
      .then(response => setCategories(response.data))
      .catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    const params = {}
    if (search) params.search = search
    if (category) params.category = category

    axios.get('http://localhost:5000/api/models', { params })
      .then(response => setApiTools(response.data))
      .catch(() => setApiTools([]))
  }, [search, category])

  const visibleTools = (apiTools.length > 0 ? apiTools : mockTools).filter(tool => matchesFilters(tool, search, category))
  const visibleCategories = categories.length > 0 ? categories : mockCategories
  const showingMockTools = apiTools.length === 0

  return (
    <div className="page-arrival min-h-screen bg-slate-950/45 px-6 py-10 backdrop-blur-[2px]">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <h2 className="mb-2 text-4xl font-bold text-white">
            Find the Right <span className="text-purple-400">AI Tool</span>
          </h2>
          <p className="text-gray-300">Browse and discover the best AI tools in one place</p>
          {showingMockTools && (
            <p className="mt-4 inline-flex rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">
              Demo mode: 64 experimental mock cards are active until your database tools load.
            </p>
          )}
        </div>

        <div className="mb-8 flex flex-col gap-4">
          <SearchBar value={search} onChange={setSearch} />
          <FilterBar categories={visibleCategories} selected={category} onSelect={setCategory} />
        </div>

        {visibleTools.length === 0 ? (
          <p className="mt-20 text-center text-gray-400">No tools found.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {visibleTools.map(tool => (
              <ToolCard
                key={tool.model_id}
                tool={tool}
                isActive={hoveredToolId === tool.model_id}
                isMuted={hoveredToolId !== null && hoveredToolId !== tool.model_id}
                onHoverStart={() => setHoveredToolId(tool.model_id)}
                onHoverEnd={() => setHoveredToolId(null)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
