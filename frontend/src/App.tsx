import { useState } from 'react'
import { ListView } from './components/ListView/ListView'
import { FilterBuilder } from './components/FilterBuilder/FilterBuilder'
import { GroupView } from './components/GroupView/GroupView'
import { AppProvider } from './state/AppContext'

interface Filter {
  id: string
  field: string
  operator: string
  value: string
}

function AppContent() {
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filter[]>([])
  const [groupByField, setGroupByField] = useState<string | null>(null)
  const [showGroupView, setShowGroupView] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [showGroupModal, setShowGroupModal] = useState(false)

  const models = [
    {
      name: 'users',
      table: 'users',
      primaryKey: 'id',
      fields: ['id', 'name', 'email', 'created_at'],
    },
    {
      name: 'orders',
      table: 'orders',
      primaryKey: 'id',
      fields: ['id', 'user_id', 'total', 'created_at'],
    },
    {
      name: 'products',
      table: 'products',
      primaryKey: 'id',
      fields: ['id', 'name', 'price', 'stock', 'created_at'],
    },
  ]

  const handleSelectModel = (modelName: string) => {
    setSelectedModel(modelName)
    setFilters([])
    setGroupByField(null)
    setShowGroupView(false)
    setShowFilterModal(false)
    setShowGroupModal(false)
  }

  const handleAddFilter = (filter: Omit<Filter, 'id'>) => {
    setFilters([...filters, { ...filter, id: Date.now().toString() }])
  }

  const handleRemoveFilter = (filterId: string) => {
    setFilters(filters.filter((f) => f.id !== filterId))
  }

  const currentModel = models.find((m) => m.name === selectedModel)

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 shadow-lg">
        <div className="max-w-full mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Universal Data Viewer</h1>
            <p className="text-gray-400 mt-1">Explore and analyze your data with ease</p>
          </div>
          {selectedModel && (
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilterModal(!showFilterModal)}
                className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                  showFilterModal || filters.length > 0
                    ? 'bg-cyan-600 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                🔍 Filters {filters.length > 0 && `(${filters.length})`}
              </button>
              <button
                onClick={() => setShowGroupModal(!showGroupModal)}
                className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                  showGroupModal || groupByField
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                ⊕ Group By {groupByField && `(${groupByField})`}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex">
        <div className="w-full h-full grid grid-cols-5 gap-0">
          {/* Left Sidebar - Models */}
          <aside className="col-span-1 bg-gray-800 border-r border-gray-700 overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-cyan-400">📊</span>
                Models
              </h2>
              <div className="space-y-2">
                {models.map((model) => (
                  <button
                    key={model.name}
                    onClick={() => handleSelectModel(model.name)}
                    className={`w-full px-4 py-3 text-left rounded-lg transition-all font-medium ${
                      selectedModel === model.name
                        ? 'bg-cyan-600 text-white shadow-lg'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {model.name.charAt(0).toUpperCase() + model.name.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Right Content Area */}
          <div className="col-span-4 bg-gray-900 overflow-hidden flex flex-col">
            {selectedModel ? (
              <>
                {/* Top Section - Model Info */}
                <div className="border-b border-gray-700 bg-gray-800 p-6">
                  <h2 className="text-3xl font-bold text-white capitalize">{selectedModel}</h2>
                  <p className="text-gray-400 mt-2 flex gap-4">
                    <span>
                      <span className="font-semibold text-white">Table:</span> {currentModel?.table}
                    </span>
                    {filters.length > 0 && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-cyan-900 text-cyan-300">
                        {filters.length} filter(s)
                      </span>
                    )}
                    {groupByField && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-900 text-purple-300">
                        Grouped by {groupByField}
                      </span>
                    )}
                  </p>
                </div>

                {/* Data Display */}
                <div className="flex-1 overflow-y-auto p-6">
                  {showGroupView && groupByField ? (
                    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
                      <GroupView
                        modelName={selectedModel}
                        groupByField={groupByField}
                        filters={filters}
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
                      <ListView
                        modelName={selectedModel}
                        filters={filters}
                      />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-2xl text-gray-400 font-semibold">Select a model to get started</p>
                  <p className="text-gray-500 mt-2">Choose from Users, Orders, or Products</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Filter Modal Overlay */}
      {showFilterModal && selectedModel && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl shadow-2xl border border-cyan-600 max-w-md w-full">
            <div className="border-b border-gray-700 px-6 py-4 flex items-center justify-between bg-gray-800">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-cyan-400">🔍</span>
                Filters
              </h3>
              <button
                onClick={() => setShowFilterModal(false)}
                className="text-gray-400 hover:text-white font-bold text-xl transition"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              <FilterBuilder
                fields={currentModel?.fields || []}
                onAddFilter={handleAddFilter}
              />

              {filters.length > 0 && (
                <>
                  <div className="border-t border-gray-700 pt-4">
                    <h4 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">Applied Filters</h4>
                    <div className="space-y-2">
                      {filters.map((filter) => (
                        <div
                          key={filter.id}
                          className="p-3 bg-gray-700 border border-gray-600 rounded-lg flex justify-between items-start hover:border-cyan-500 transition"
                        >
                          <div className="text-sm flex-1">
                            <p className="font-medium text-white">
                              {filter.field} <span className="text-cyan-400">{filter.operator}</span>
                            </p>
                            <p className="text-gray-400 text-xs mt-1">{filter.value}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveFilter(filter.id)}
                            className="ml-2 text-red-400 hover:text-red-300 font-bold hover:bg-red-900 hover:bg-opacity-30 px-2 py-1 rounded transition"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Group By Modal Overlay */}
      {showGroupModal && selectedModel && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl shadow-2xl border border-purple-600 max-w-md w-full">
            <div className="border-b border-gray-700 px-6 py-4 flex items-center justify-between bg-gray-800">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-purple-400">⊕</span>
                Group By
              </h3>
              <button
                onClick={() => setShowGroupModal(false)}
                className="text-gray-400 hover:text-white font-bold text-xl transition"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">Select Field</label>
                <select
                  value={groupByField || ''}
                  onChange={(e) => {
                    setGroupByField(e.target.value || null)
                    if (e.target.value) {
                      setShowGroupView(true)
                    }
                  }}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-20 font-medium"
                >
                  <option value="">No grouping</option>
                  {currentModel?.fields.map((field) => (
                    <option key={field} value={field}>
                      {field.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {groupByField && (
                <button
                  onClick={() => setShowGroupView(!showGroupView)}
                  className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all font-bold shadow-lg"
                >
                  {showGroupView ? '📊 Show Table View' : '📈 Show Group View'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App
