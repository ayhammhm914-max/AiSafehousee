export default function ToolCard({ tool, isActive, isMuted, onHoverStart, onHoverEnd }) {
  const rating = Number(tool.avg_rating || 0).toFixed(1)

  return (
    <div
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      className={[
        'group relative overflow-hidden rounded-3xl border border-gray-800 bg-gray-900/90 p-5 transition-all duration-300',
        isActive ? 'z-10 scale-[1.04] border-cyan-400/60 shadow-2xl shadow-cyan-950/60' : 'scale-100',
        isMuted ? 'opacity-30 blur-[1px] saturate-50' : 'opacity-100',
      ].join(' ')}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.18),transparent_30%)] opacity-80" />

      <div className="relative z-10 flex items-start gap-4">
        <div className="rounded-2xl border border-cyan-400/15 bg-slate-950/70 p-3 shadow-lg shadow-cyan-950/30 transition duration-300 group-hover:scale-110 group-hover:border-cyan-400/40">
          <img
            src={tool.logo_url || `https://ui-avatars.com/api/?name=${tool.name}&background=0f172a&color=7dd3fc`}
            alt={tool.name}
            className="h-14 w-14 rounded-xl object-cover transition duration-300 group-hover:scale-110"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white">{tool.name}</h3>
              <span className="text-xs text-cyan-300">{tool.category_name}</span>
            </div>
            <div className="flex items-center gap-1 rounded-full border border-yellow-400/10 bg-yellow-400/10 px-2 py-1 text-xs text-yellow-300">
              <span>&#9733;</span>
              <span>{rating}</span>
            </div>
          </div>

          <p className={[
            'text-sm leading-6 text-gray-400 transition-all duration-300',
            isActive ? 'max-h-32 opacity-100' : 'max-h-10 overflow-hidden opacity-75',
          ].join(' ')}>
            {tool.description}
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-5 flex items-center justify-between gap-3">
        <span className={`rounded-full px-3 py-1 text-xs ${tool.is_free ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'}`}>
          {tool.is_free ? 'Free' : 'Paid'}
        </span>

        <a
          href={tool.website_url}
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-purple-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-purple-500"
        >
          Explore &rarr;
        </a>
      </div>
    </div>
  )
}
