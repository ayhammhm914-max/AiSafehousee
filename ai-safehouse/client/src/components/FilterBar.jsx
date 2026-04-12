export default function FilterBar({ categories, selected, onSelect }) {
  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={() => onSelect('')}
        className={`px-4 py-2 rounded-full text-sm transition ${selected === '' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
      >
        All
      </button>
      {categories.map(cat => (
        <button
          key={cat.category_id}
          onClick={() => onSelect(cat.name)}
          className={`px-4 py-2 rounded-full text-sm transition ${selected === cat.name ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
        >
          {cat.icon} {cat.name}
        </button>
      ))}
    </div>
  )
}