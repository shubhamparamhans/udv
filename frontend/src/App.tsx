import { useContext, useState } from 'react'
import { ModelExplorer } from './components/ModelExplorer/ModelExplorer'
import { ListView } from './components/ListView/ListView'
import { AppContext, AppProvider } from './state/AppContext'

function AppContent() {
  const { state, setState } = useContext(AppContext)
  const [selectedModel, setSelectedModel] = useState<string | null>(null)

  const models = [
    {
      name: 'users',
      table: 'users',
      primaryKey: 'id',
    },
    {
      name: 'orders',
      table: 'orders',
      primaryKey: 'id',
    },
    {
      name: 'products',
      table: 'products',
      primaryKey: 'id',
    },
  ]

  const handleSelectModel = (modelName: string) => {
    setSelectedModel(modelName)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-full mx-auto px-6 py-4">
          <h1 className="text-4xl font-bold text-gray-900">Universal Data Viewer</h1>
        </div>
      </header>

      {/* Main Content - Two Column Layout */}
      <main className="max-w-full">
        <div className="grid grid-cols-4 h-screen">
          {/* Left Sidebar - Models */}
          <aside className="col-span-1 bg-white border-r border-gray-200 overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Models</h2>
              <div className="space-y-2">
                {models.map((model) => (
                  <button
                    key={model.name}
                    onClick={() => handleSelectModel(model.name)}
                    className={`w-full px-4 py-3 text-left rounded-lg transition-colors font-medium ${
                      selectedModel === model.name
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {model.name.charAt(0).toUpperCase() + model.name.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Right Content Area */}
          <div className="col-span-3 bg-gray-50 overflow-y-auto">
            {selectedModel ? (
              <div className="p-8">
                {/* Selected Model Heading */}
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 capitalize">{selectedModel}</h2>
                  <p className="text-gray-600 mt-1">
                    {models.find((m) => m.name === selectedModel)?.table}
                  </p>
                </div>

                {/* Data List */}
                <div className="bg-white rounded-lg shadow">
                  <ListView modelName={selectedModel} />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-xl text-gray-500">Select a model from the left to view data</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
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
