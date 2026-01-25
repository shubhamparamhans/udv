// GroupView Component
export function GroupView() {
  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Created 2024-01-15</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-sm">
            <p className="text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">12</p>
          </div>
          <div className="text-sm">
            <p className="text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">$1,234</p>
          </div>
        </div>
      </div>
    </div>
  )
}
