import { useEffect, useState } from 'react'
import api, { getApiErrorMessage } from '../lib/api'
import ToolCard from '../components/ToolCard'
import SearchBar from '../components/SearchBar'
import FilterBar from '../components/FilterBar'

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
  const [toolsError, setToolsError] = useState('')

  useEffect(() => {
    let cancelled = false

    api
      .get('/categories')
      .then(response => {
        if (cancelled) return
        setCategories(response.data)
      })
      .catch(() => {
        if (cancelled) return
        setCategories([])
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const params = {}

    if (search) params.search = search
    if (category) params.category = category

    api
      .get('/models', { params })
      .then(response => {
        if (cancelled) return
        setApiTools(response.data)
        setToolsError('')
      })
      .catch(error => {
        if (cancelled) return
        setApiTools([])
        setToolsError(
          getApiErrorMessage(
            error,
            'Could not load the tool catalog right now.',
            'Backend is offline. Start the server to load the tools.',
          ),
        )
      })

    return () => {
      cancelled = true
    }
  }, [search, category])

  const visibleTools = apiTools.filter(tool => matchesFilters(tool, search, category))

  return (
    <div className="page-arrival min-h-screen bg-slate-950/45 px-6 py-10 backdrop-blur-[2px]">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <h2 className="mb-2 text-4xl font-bold text-white">
            Find the Right <span className="text-purple-400">AI Tool</span>
          </h2>
          <p className="text-gray-300">Browse and discover the best AI tools in one place</p>
        </div>

        <div className="mb-8 flex flex-col gap-4">
          <SearchBar value={search} onChange={setSearch} />
          <FilterBar categories={categories} selected={category} onSelect={setCategory} />
        </div>

        {toolsError ? (
          <p className="mt-20 text-center text-rose-200">{toolsError}</p>
        ) : visibleTools.length === 0 ? (
          <p className="mt-20 text-center text-gray-400">No tools found in the database.</p>
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
