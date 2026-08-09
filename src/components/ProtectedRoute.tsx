import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF7] text-gray-800">
        <div className="text-center p-8">
          <div className="w-12 h-12 border-4 border-[#1F5C8B] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xl font-medium">Carregando o sistema...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
