import { useState } from 'react'
import { deleteRecord } from '../../api/client'

interface DeleteConfirmProps {
  modelName: string
  recordId: string | number
  recordData?: Record<string, any>
  onSuccess?: () => void
  onCancel: () => void
}

export function DeleteConfirm({ modelName, recordId, recordData, onSuccess, onCancel }: DeleteConfirmProps) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setDeleting(true)
    setError(null)

    try {
      const response = await deleteRecord(modelName, recordId)
      
      if (response.error) {
        setError(response.error)
      } else {
        onSuccess?.()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete record')
    } finally {
      setDeleting(false)
    }
  }

  // Get a preview of the record (show first few fields)
  const getRecordPreview = () => {
    if (!recordData) return null
    
    const entries = Object.entries(recordData).slice(0, 3)
    return entries.map(([key, value]) => (
      <div key={key} className="text-sm">
        <span className="text-gray-400 capitalize">{key.replace('_', ' ')}:</span>{' '}
        <span className="text-gray-200">{String(value)}</span>
      </div>
    ))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Confirm Delete</h2>
        </div>

        <div className="px-6 py-4">
          {error && (
            <div className="mb-4 p-4 bg-red-900 bg-opacity-50 border border-red-700 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <p className="text-gray-300 mb-4">
            Are you sure you want to delete this record from <span className="font-semibold text-white">{modelName}</span>?
          </p>

          {recordData && (
            <div className="mb-4 p-4 bg-gray-700 rounded-lg">
              <p className="text-gray-400 text-sm mb-2 font-semibold">Record Preview:</p>
              <div className="space-y-1">
                {getRecordPreview()}
              </div>
            </div>
          )}

          <p className="text-red-400 text-sm font-semibold">
            ⚠️ This action cannot be undone.
          </p>
        </div>

        <div className="px-6 py-4 border-t border-gray-700 flex gap-4">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg font-semibold hover:bg-gray-600 disabled:opacity-50 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

