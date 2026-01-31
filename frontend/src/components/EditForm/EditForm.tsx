import { useState, useEffect } from 'react'
import { updateRecord, fetchModels, type Model } from '../../api/client'

interface EditFormProps {
  modelName: string
  recordId: string | number
  initialData: Record<string, any>
  onSuccess?: () => void
  onCancel: () => void
}

export function EditForm({ modelName, recordId, initialData, onSuccess, onCancel }: EditFormProps) {
  const [model, setModel] = useState<Model | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const loadModel = async () => {
      try {
        setLoading(true)
        const models = await fetchModels()
        const foundModel = models.find((m) => m.name === modelName)
        setModel(foundModel || null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load model')
      } finally {
        setLoading(false)
      }
    }

    if (modelName) {
      loadModel()
    }
  }, [modelName])

  useEffect(() => {
    // Update form data when initialData changes
    setFormData(initialData)
  }, [initialData])

  const handleChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      // Only include fields that have changed or are not auto-generated
      const dataToSubmit: Record<string, any> = {}
      Object.keys(formData).forEach((key) => {
        // Skip id and auto-generated timestamp fields
        if (key === 'id' || key.includes('_at') || key === model?.primary_key) {
          return
        }

        const originalValue = initialData[key]
        const newValue = formData[key]

        // Only include if value changed
        if (originalValue !== newValue) {
          // Convert string numbers to actual numbers if field type is numeric
          const field = model?.fields.find((f) => f.name === key)
          if (field) {
            const type = field.type.toLowerCase()
            if (type.includes('int') || type.includes('integer')) {
              const num = Number(newValue)
              if (!isNaN(num)) {
                dataToSubmit[key] = num
              } else {
                dataToSubmit[key] = newValue
              }
            } else if (type.includes('float') || type.includes('decimal') || type.includes('numeric')) {
              const num = parseFloat(newValue)
              if (!isNaN(num)) {
                dataToSubmit[key] = num
              } else {
                dataToSubmit[key] = newValue
              }
            } else if (type === 'boolean') {
              dataToSubmit[key] = newValue === true || newValue === 'true' || newValue === '1'
            } else {
              dataToSubmit[key] = newValue
            }
          } else {
            dataToSubmit[key] = newValue
          }
        }
      })

      if (Object.keys(dataToSubmit).length === 0) {
        setError('No changes to save')
        setSubmitting(false)
        return
      }

      const response = await updateRecord(modelName, recordId, dataToSubmit)
      
      if (response.error) {
        setError(response.error)
      } else {
        onSuccess?.()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update record')
    } finally {
      setSubmitting(false)
    }
  }

  const renderField = (field: { name: string; type: string }) => {
    // Skip id and primary key
    if (field.name === 'id' || field.name === model?.primary_key) {
      return null
    }

    const fieldType = field.type.toLowerCase()
    const value = formData[field.name] ?? ''

    if (fieldType === 'boolean') {
      return (
        <div key={field.name} className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">
            {field.name.replace('_', ' ')}
          </label>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={value === true || value === 'true' || value === '1' || value === 1}
              onChange={(e) => handleChange(field.name, e.target.checked)}
              className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
            />
            <span className="ml-2 text-gray-400 text-sm">Yes</span>
          </div>
        </div>
      )
    }

    if (fieldType.includes('text') || fieldType === 'text') {
      return (
        <div key={field.name} className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">
            {field.name.replace('_', ' ')}
          </label>
          <textarea
            value={String(value)}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            rows={4}
            placeholder={`Enter ${field.name.replace('_', ' ')}`}
          />
        </div>
      )
    }

    if (fieldType.includes('date') || fieldType === 'date') {
      // Format date for input (YYYY-MM-DD)
      const dateValue = value ? (typeof value === 'string' ? value.split('T')[0] : value) : ''
      return (
        <div key={field.name} className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">
            {field.name.replace('_', ' ')}
          </label>
          <input
            type="date"
            value={dateValue}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>
      )
    }

    if (fieldType.includes('timestamp') || fieldType.includes('datetime')) {
      // Format datetime for input (YYYY-MM-DDTHH:mm)
      let datetimeValue = ''
      if (value) {
        const date = new Date(value)
        if (!isNaN(date.getTime())) {
          datetimeValue = date.toISOString().slice(0, 16)
        }
      }
      return (
        <div key={field.name} className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">
            {field.name.replace('_', ' ')}
          </label>
          <input
            type="datetime-local"
            value={datetimeValue}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>
      )
    }

    // Default to text/number input
    return (
      <div key={field.name} className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">
          {field.name.replace('_', ' ')}
        </label>
        <input
          type={fieldType.includes('int') || fieldType.includes('float') || fieldType.includes('decimal') ? 'number' : 'text'}
          value={String(value)}
          onChange={(e) => handleChange(field.name, e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          placeholder={`Enter ${field.name.replace('_', ' ')}`}
        />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6">
          <p className="text-gray-300">Loading form...</p>
        </div>
      </div>
    )
  }

  if (!model) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6">
          <p className="text-red-400">Model not found: {modelName}</p>
          <button
            onClick={onCancel}
            className="mt-4 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Edit {modelName}</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-white text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-900 bg-opacity-50 border border-red-700 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {model.fields.map((field) => renderField(field))}
          </div>

          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-gray-700 text-gray-300 rounded-lg font-semibold hover:bg-gray-600 disabled:opacity-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

