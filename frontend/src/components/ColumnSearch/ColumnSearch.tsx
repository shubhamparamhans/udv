// Column Search Component
interface ColumnSearchProps {
  column: string
  value: string
  onChange: (value: string) => void
  onClear: () => void
  placeholder?: string
}

export function ColumnSearch({ column, value, onChange, onClear, placeholder }: ColumnSearchProps) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || `Search ${column}...`}
        className="w-full px-2 py-1 text-xs bg-gray-700 border border-gray-600 text-white rounded 
          focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:ring-opacity-20 
          placeholder-gray-500"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
          title="Clear"
        >
          ✕
        </button>
      )}
    </div>
  )
}

