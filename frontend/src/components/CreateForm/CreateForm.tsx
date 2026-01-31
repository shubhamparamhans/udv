import { useState, useEffect } from 'react'
import { createRecord, fetchModels, type Model } from '../../api/client'

interface CreateFormProps {
  modelName: string
  onSuccess?: () => void
  onCancel: () => void
}

export function CreateForm({ modelName, onSuccess, onCancel }: CreateFormProps) {
  const [model, setModel] = useState<Model | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
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
        
        // Initialize form data with empty values
        if (foundModel) {
          const initialData: Record<string, any> = {}
          foundModel.fields.forEach((field) => {
            // Skip auto-generated fields like id, created_at, updated_at
            if (field.name === 'id' || field.name.includes('_at') || field.name.includes('_id')) {
              return
            }
            initialData[field.name] = ''
          })
          setFormData(initialData)
        }
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
      // Filter out empty values (optional fields)
      const dataToSubmit: Record<string, any> = {}
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== '' && formData[key] !== null && formData[key] !== undefined) {
          // Convert string numbers to actual numbers if field type is numeric
          const field = model?.fields.find((f) => f.name === key)
          if (field) {
            const type = field.type.toLowerCase()
            if (type.includes('int') || type.includes('integer')) {
              const num = Number(formData[key])
              if (!isNaN(num)) {
                dataToSubmit[key] = num
              } else {
                dataToSubmit[key] = formData[key]
              }
            } else if (type.includes('float') || type.includes('decimal') || type.includes('numeric')) {
              const num = parseFloat(formData[key])
              if (!isNaN(num)) {
                dataToSubmit[key] = num
              } else {
                dataToSubmit[key] = formData[key]
              }
            } else if (type === 'boolean') {
              dataToSubmit[key] = formData[key] === true || formData[key] === 'true' || formData[key] === '1'
            } else {
              dataToSubmit[key] = formData[key]
            }
          } else {
            dataToSubmit[key] = formData[key]
          }
        }
      })

      const response = await createRecord(modelName, dataToSubmit)
      
      if (response.error) {
        setError(response.error)
      } else {
        onSuccess?.()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create record')
    } finally {
      setSubmitting(false)
    }
  }

  const renderField = (field: { name: string; type: string }) => {
    // Skip auto-generated fields
    if (field.name === 'id' || field.name.includes('_at') || field.name.includes('_id')) {
      return null
    }

    const fieldType = field.type.toLowerCase()
    const value = formData[field.name] || ''

    if (fieldType === 'boolean') {
      return (
        <div key={field.name} className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">
            {field.name.replace('_', ' ')}
          </label>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={value === true || value === 'true' || value === '1'}
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
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            rows={4}
            placeholder={`Enter ${field.name.replace('_', ' ')}`}
          />
        </div>
      )
    }

    if (fieldType.includes('date') || fieldType === 'date') {
      return (
        <div key={field.name} className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">
            {field.name.replace('_', ' ')}
          </label>
          <input
            type="date"
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>
      )
    }

    if (fieldType.includes('timestamp') || fieldType.includes('datetime')) {
      return (
        <div key={field.name} className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">
            {field.name.replace('_', ' ')}
          </label>
          <input
            type="datetime-local"
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>
      )
    }

    // Default to text input
    return (
      <div key={field.name} className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">
          {field.name.replace('_', ' ')}
        </label>
        <input
          type={fieldType.includes('int') || fieldType.includes('float') || fieldType.includes('decimal') ? 'number' : 'text'}
          value={value}
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
            <h2 className="text-2xl font-bold text-white">Create New {modelName}</h2>
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
              {submitting ? 'Creating...' : 'Create'}
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

