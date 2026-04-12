export default function ToolCard({ tool }) {
  const rating = Number(tool.avg_rating || 0).toFixed(1)

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5 transition-all hover:border-purple-500 hover:shadow-lg hover:shadow-purple-900">
      <div className="mb-3 flex items-center gap-3">
        <img
          src={tool.logo_url || `https://ui-avatars.com/api/?name=${tool.name}&background=6d28d9&color=fff`}
          alt={tool.name}
          className="h-10 w-10 rounded-lg"
        />
        <div>
          <h3 className="font-bold text-white">{tool.name}</h3>
          <span className="text-xs text-purple-400">{tool.category_name}</span>
        </div>
      </div>

      <p className="mb-4 line-clamp-2 text-sm text-gray-400">{tool.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-yellow-400">&#9733;</span>
          <span className="text-sm text-gray-300">{rating}</span>
        </div>

        <div className="flex gap-2">
          <span className={`rounded-full px-2 py-1 text-xs ${tool.is_free ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
            {tool.is_free ? 'Free' : 'Paid'}
          </span>
          <a
            href={tool.website_url}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-purple-700 px-3 py-1 text-xs text-white transition hover:bg-purple-600"
          >
            Visit &rarr;
          </a>
        </div>
      </div>
    </div>
  )
}
