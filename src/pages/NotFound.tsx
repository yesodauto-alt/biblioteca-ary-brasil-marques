import { useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookMarked } from 'lucide-react'

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl border border-[#D4D4D4] shadow-elevation p-8 text-center space-y-6 animate-fade-in">
        <div className="w-16 h-16 bg-[#1F5C8B] text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
          <BookMarked className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">Página não encontrada</h1>
          <p className="text-lg text-gray-600">
            A página que você procura não existe ou foi movida.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center justify-center h-12 px-6 text-base font-bold bg-[#1F5C8B] hover:bg-[#174A73] text-white rounded-lg shadow-sm"
        >
          Voltar para o início
        </Link>
      </div>
    </div>
  )
}

export default NotFound
