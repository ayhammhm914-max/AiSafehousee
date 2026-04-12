export default function SearchBar({ value, onChange }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="Search AI tools..."
      className="w-full rounded-xl border border-gray-600 bg-gray-800 px-5 py-3 text-white transition placeholder-gray-500 focus:border-purple-500 focus:outline-none"
    />
  )
}
