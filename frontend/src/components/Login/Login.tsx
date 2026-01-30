// Login Component
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<boolean>
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const success = await onLogin(username, password)
      if (success) {
        navigate('/')
      } else {
        setError('Invalid username or password')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Agent P</h1>
            <p className="text-gray-400">Universal Data Viewer</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-900 bg-opacity-20 border border-red-700 text-red-300 rounded-lg text-sm">
                ⚠️ {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg 
                  focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-20 
                  placeholder-gray-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter your username"
                autoComplete="username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg 
                  focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-20 
                  placeholder-gray-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg 
                transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-cyan-600
                shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block animate-spin">⚙️</span>
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Demo Note */}
          <div className="mt-6 p-4 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg">
            <p className="text-xs text-gray-400 text-center">
              💡 <strong>Demo Mode:</strong> Any username/password will work for now
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

