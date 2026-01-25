import { useState } from 'react'

interface FilterBuilderProps {
  fields: string[]
  onAddFilter: (filter: { field: string; operator: string; value: string }) => void
}

export function FilterBuilder({ fields, onAddFilter }: FilterBuilderProps) {
  const [field, setField] = useState<string>(fields[0] || '')
  const [operator, setOperator] = useState<string>('equals')
  const [value, setValue] = useState<string>('')

  const operators = [
    { value: 'equals', label: 'Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'startswith', label: 'Starts With' },
    { value: 'endswith', label: 'Ends With' },
    { value: 'gt', label: 'Greater Than' },
    { value: 'lt', label: 'Less Than' },
    { value: 'gte', label: 'Greater or Equal' },
    { value: 'lte', label: 'Less or Equal' },
  ]

  const handleAddFilter = () => {
    if (field && operator && value) {
      onAddFilter({ field, operator, value })
      setValue('')
      setField(fields[0] || '')
      setOperator('equals')
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-bold text-cyan-400 mb-2">Field</label>
        <select
          value={field}
          onChange={(e) => setField(e.target.value)}
          className="w-full px-3 py-2 border border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm bg-gray-700 text-white font-medium"
        >
          {fields.map((f) => (
            <option key={f} value={f}>
              {f.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-purple-400 mb-2">Operator</label>
        <select
          value={operator}
          onChange={(e) => setOperator(e.target.value)}
          className="w-full px-3 py-2 border border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-gray-700 text-white font-medium"
        >
          {operators.map((op) => (
            <option key={op.value} value={op.value}>
              {op.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-cyan-400 mb-2">Value</label>
        <input
          type="text"
          placeholder="Enter filter value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleAddFilter()
            }
          }}
          className="w-full px-3 py-2 border border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm bg-gray-700 text-white font-medium placeholder:text-gray-500"
        />
      </div>

      <button
        onClick={handleAddFilter}
        disabled={!field || !operator || !value}
        className="w-full px-4 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-lg hover:from-cyan-500 hover:to-purple-500 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-md hover:shadow-lg"
      >
        + Add Filter
      </button>
    </div>
  )
}
