import { ModelExplorer } from './components/ModelExplorer/ModelExplorer'
import { ListView } from './components/ListView/ListView'
import { GroupView } from './components/GroupView/GroupView'
import { FilterBuilder } from './components/FilterBuilder/FilterBuilder'
import { AppProvider } from './state/AppContext'

function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900">Universal Data Viewer</h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-4 gap-6">
            {/* Sidebar */}
            <aside className="col-span-1">
              <div className="space-y-6">
                <section className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Models</h2>
                  <ModelExplorer />
                </section>

                <section className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
                  <FilterBuilder />
                </section>
              </div>
            </aside>

            {/* Content Area */}
            <div className="col-span-3 space-y-6">
              <section className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Results</h2>
                <ListView />
              </section>

              <section className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Grouped View</h2>
                <GroupView />
              </section>
            </div>
          </div>
        </main>
      </div>
    </AppProvider>
  )
}

export default App
