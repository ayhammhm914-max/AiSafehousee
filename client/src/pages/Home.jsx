import { useEffect, useState } from 'react'
import axios from 'axios'
import ToolCard from '../components/ToolCard'
import SearchBar from '../components/SearchBar'
import FilterBar from '../components/FilterBar'

export default function Home() {
  const [tools,      setTools]      = useState([])
  const [categories, setCategories] = useState([])
  const [search,     setSearch]     = useState('')
  const [category,   setCategory]   = useState('')

  useEffect(() => {
    axios.get('http://localhost:5000/api/categories')
      .then(r => setCategories(r.data))
  }, [])

  useEffect(() => {
    const params = {}
    if (search)   params.search   = search
    if (category) params.category = category

    axios.get('http://localhost:5000/api/models', { params })
      .then(r => setTools(r.data))
  }, [search, category])

  return (
    <div className="min-h-screen bg-gray-950 px-6 py-10">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-white mb-2">Find the Right <span className="text-purple-400">AI Tool</span></h2>
          <p className="text-gray-400">Browse and discover the best AI tools in one place</p>
        </div>

        <div className="flex flex-col gap-4 mb-8">
          <SearchBar value={search} onChange={setSearch} />
          <FilterBar categories={categories} selected={category} onSelect={setCategory} />
        </div>

        {tools.length === 0 ? (
          <p className="text-center text-gray-500 mt-20">No tools found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map(tool => <ToolCard key={tool.model_id} tool={tool} />)}
          </div>
        )}

      </div>
    </div>
  )
}