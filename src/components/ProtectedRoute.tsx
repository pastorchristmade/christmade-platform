import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  // Show a loading screen while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-brand-blue flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-heading font-bold text-gold-500 mb-2">
            Christmade
          </h1>
          <p className="text-primary-100 font-body">Loading...</p>
        </div>
      </div>
    )
  }

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // If user is logged in, show the page
  return <>{children}</>
}

export default ProtectedRoute