// ListView Component
export function ListView() {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 text-sm text-gray-700">John Doe</td>
            <td className="px-6 py-4 text-sm text-gray-700">john@example.com</td>
            <td className="px-6 py-4 text-sm text-gray-700">2024-01-15</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
