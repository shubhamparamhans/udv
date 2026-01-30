// SearchBar Component
interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  placeholder?: string
  disabled?: boolean
  loading?: boolean
}

export function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = 'Search across all fields...',
  disabled = false,
  loading = false,
}: SearchBarProps) {
  return (
    <div className="relative flex items-center">
      <div className="absolute left-3 text-gray-400">
        {loading ? (
          <span className="inline-block animate-spin">⚙️</span>
        ) : (
          <span>🔍</span>
        )}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full pl-10 pr-10 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg 
          focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-20 
          placeholder-gray-500 transition-all
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-500'}
        `}
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute right-3 text-gray-400 hover:text-white transition-colors"
          title="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  )
}

