import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <main className="max-w-2xl mx-auto px-6 py-10"><p className="text-ink/60">loading...</p></main>
  }

  if (!user || !user.emailVerified) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}