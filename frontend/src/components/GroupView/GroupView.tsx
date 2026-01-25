// GroupView Component
interface Filter {
  id: string
  field: string
  operator: string
  value: string
}

interface GroupViewProps {
  modelName?: string
  groupByField?: string
  filters?: Filter[]
}

const mockData: Record<string, any[]> = {
  users: [
    { id: 1, name: 'John Doe', email: 'john@example.com', created_at: '2024-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', created_at: '2024-01-16' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', created_at: '2024-01-17' },
    { id: 4, name: 'Alice Williams', email: 'alice@example.com', created_at: '2024-01-18' },
    { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', created_at: '2024-01-19' },
  ],
  orders: [
    { id: 101, user_id: 1, total: '$250.00', created_at: '2024-01-20' },
    { id: 102, user_id: 2, total: '$150.00', created_at: '2024-01-20' },
    { id: 103, user_id: 1, total: '$500.00', created_at: '2024-01-21' },
    { id: 104, user_id: 3, total: '$300.00', created_at: '2024-01-21' },
    { id: 105, user_id: 4, total: '$450.00', created_at: '2024-01-22' },
  ],
  products: [
    { id: 1, name: 'Laptop', price: '$999.99', stock: 15, created_at: '2023-06-01' },
    { id: 2, name: 'Mouse', price: '$29.99', stock: 100, created_at: '2023-06-02' },
    { id: 3, name: 'Keyboard', price: '$79.99', stock: 50, created_at: '2023-06-03' },
    { id: 4, name: 'Monitor', price: '$299.99', stock: 25, created_at: '2023-06-04' },
    { id: 5, name: 'USB Cable', price: '$9.99', stock: 200, created_at: '2023-06-05' },
  ],
}

function applyFilter(row: any, filter: Filter): boolean {
  const fieldValue = String(row[filter.field]).toLowerCase()
  const filterValue = filter.value.toLowerCase()

  switch (filter.operator) {
    case 'equals':
      return fieldValue === filterValue
    case 'contains':
      return fieldValue.includes(filterValue)
    case 'startswith':
      return fieldValue.startsWith(filterValue)
    case 'endswith':
      return fieldValue.endsWith(filterValue)
    case 'gt':
      return parseFloat(fieldValue) > parseFloat(filterValue)
    case 'lt':
      return parseFloat(fieldValue) < parseFloat(filterValue)
    case 'gte':
      return parseFloat(fieldValue) >= parseFloat(filterValue)
    case 'lte':
      return parseFloat(fieldValue) <= parseFloat(filterValue)
    default:
      return true
  }
}

export function GroupView({ modelName = 'users', groupByField = '', filters = [] }: GroupViewProps) {
  let data = mockData[modelName] || []

  // Apply filters
  if (filters.length > 0) {
    data = data.filter((row) => filters.every((filter) => applyFilter(row, filter)))
  }

  // Group data
  const grouped: Record<string, any[]> = {}
  data.forEach((row) => {
    const key = String(row[groupByField] || 'Other')
    if (!grouped[key]) {
      grouped[key] = []
    }
    grouped[key].push(row)
  })

  const groups = Object.entries(grouped).sort(([keyA], [keyB]) => keyA.localeCompare(keyB))

  return (
    <div className="space-y-6 p-6">
      {groups.map(([groupKey, groupData]) => (
        <div key={groupKey} className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-cyan-400 capitalize">
              {groupByField}: <span className="text-purple-400">{groupKey}</span>
            </h3>
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-purple-900 text-purple-200 border border-purple-700">
              {groupData.length} item{groupData.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="bg-gray-700 p-4 rounded-lg border border-cyan-600">
              <p className="text-sm text-gray-300 font-semibold">Total Records</p>
              <p className="text-3xl font-bold text-cyan-400 mt-1">{groupData.length}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg border border-purple-600">
              <p className="text-sm text-gray-300 font-semibold">Fields</p>
              <p className="text-3xl font-bold text-purple-400 mt-1">{Object.keys(groupData[0] || {}).length}</p>
            </div>
          </div>

          {/* Group Data Table */}
          <div className="bg-gray-750 rounded-lg overflow-hidden border border-gray-700">
            <table className="w-full divide-y divide-gray-700 text-sm">
              <thead className="bg-gray-800 border-b-2 border-cyan-600">
                <tr>
                  {Object.keys(groupData[0] || {}).map((field) => (
                    <th
                      key={field}
                      className="px-4 py-3 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider capitalize"
                    >
                      {field.replace('_', ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {groupData.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      idx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'
                    } hover:bg-gray-700`}
                  >
                    {Object.keys(row).map((field) => (
                      <td key={`${idx}-${field}`} className="px-4 py-3 text-gray-200 font-medium">
                        {String(row[field])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {groups.length === 0 && (
        <div className="text-center py-16 bg-gray-800 rounded-lg border border-gray-700">
          <p className="text-xl text-gray-400 font-semibold">
            {filters.length > 0 ? '🔍 No data matches the applied filters' : '📭 No data available'}
          </p>
        </div>
      )}
    </div>
  )
}
