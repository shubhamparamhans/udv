// Main App Component with Routing
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute'
import { Login } from './components/Login/Login'
import { DataViewer } from './pages/DataViewer'
import { AppProvider } from './state/AppContext'

function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  
  // Redirect to home if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }
  
  return <Login onLogin={login} />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DataViewer />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </AuthProvider>
  )
}

export default App
