// API client
export async function fetchModels() {
  const response = await fetch('/api/models')
  return response.json()
}

export async function executeQuery(query: unknown) {
  const response = await fetch('/api/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query),
  })
  return response.json()
}
