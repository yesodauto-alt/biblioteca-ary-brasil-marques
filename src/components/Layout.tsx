import { useState, useEffect } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  Home,
  Users,
  BookOpen,
  ArrowLeftRight,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  BookMarked,
  CornerUpLeft,
  Upload,
  GraduationCap,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { getConfiguracoes } from '@/services/configuracoes'

const NAV_ITEMS = [
  { path: '/', label: 'Início', icon: Home },
  { path: '/usuarios', label: 'Usuários', icon: Users },
  { path: '/acervo', label: 'Acervo', icon: BookOpen },
  { path: '/emprestimos', label: 'Empréstimos', icon: ArrowLeftRight },
  { path: '/devolucao', label: 'Devolução', icon: CornerUpLeft },
  { path: '/relatorios', label: 'Relatórios', icon: BarChart3 },
  { path: '/cursos', label: 'Cursos e Livros', icon: GraduationCap },
  { path: '/importacao', label: 'Importação', icon: Upload },
  { path: '/configuracoes', label: 'Configurações', icon: Settings },
]

export default function Layout() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isAdmin = user?.role === 'administrador'
  const [libraryName, setLibraryName] = useState('Centro Espírita')

  useEffect(() => {
    getConfiguracoes()
      .then((c) => {
        if (c?.nome_biblioteca) setLibraryName(c.nome_biblioteca)
      })
      .catch(() => {})
  }, [])

  const visibleNavItems = NAV_ITEMS.filter(
    (item) => (item.path !== '/configuracoes' && item.path !== '/importacao') || isAdmin,
  )
  const currentPage = visibleNavItems.find((item) => item.path === location.pathname)
  const currentTitle = currentPage ? currentPage.label : 'Início'
  const volunteerName = user?.name || user?.email || 'Voluntário'

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#1A1A1A] flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#D4D4D4] px-4 md:px-8 py-3 flex items-center justify-between shadow-subtle min-h-[72px]">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden h-13 px-4 flex items-center gap-2 border-[#1F5C8B] text-[#1F5C8B] hover:bg-[#1F5C8B]/10 text-base font-semibold min-h-[52px]"
            aria-label="Abrir menu de navegação"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            <span className="text-base font-bold">Menu</span>
          </Button>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 truncate">{currentTitle}</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm text-gray-500 font-medium">Voluntário(a)</span>
            <span className="text-base font-bold text-gray-800 truncate max-w-[180px]">
              {volunteerName}
            </span>
          </div>

          <Button
            onClick={signOut}
            className="min-h-[52px] h-[52px] px-5 bg-[#C62828] hover:bg-[#A31D1D] text-white font-bold text-base flex items-center gap-2 rounded-lg shadow-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 flex relative">
        {/* Mobile/Tablet Backdrop */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar Navigation */}
        <aside
          className={`
            fixed lg:static top-0 left-0 bottom-0 z-50
            w-[280px] bg-white border-r border-[#D4D4D4]
            flex flex-col justify-between p-4 shadow-elevation lg:shadow-none
            transition-transform duration-200 ease-out
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <div className="space-y-6">
            {/* System Title Banner */}
            <div className="pt-2 px-2 flex items-center gap-3 border-b border-[#D4D4D4] pb-4">
              <div className="w-12 h-12 rounded-xl bg-[#1F5C8B] flex items-center justify-center text-white shrink-0 shadow-sm">
                <BookMarked className="w-7 h-7" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-wider font-extrabold text-[#1F5C8B]">
                  ERP Biblioteca
                </span>
                <span className="text-lg font-bold text-gray-900 leading-tight">{libraryName}</span>
              </div>
            </div>

            {/* Menu Items List */}
            <nav className="space-y-2">
              {visibleNavItems.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) => `
                      min-h-[56px] px-4 py-3 rounded-lg flex items-center gap-4 text-lg font-medium transition-colors
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F5C8B]
                      ${
                        isActive
                          ? 'bg-[#1F5C8B] text-white font-bold shadow-sm'
                          : 'text-gray-700 hover:bg-[#1F5C8B]/10 hover:text-[#1F5C8B]'
                      }
                    `}
                  >
                    <Icon className="w-6 h-6 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                )
              })}
            </nav>
          </div>

          <div className="pt-4 border-t border-[#D4D4D4] px-2 text-xs text-gray-500">
            <p className="font-medium text-gray-600">Sistema de Gestão ERP</p>
            <p>Voluntários da Biblioteca</p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-5 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* Subtle Footer */}
      <footer className="bg-white border-t border-[#D4D4D4] py-4 px-6 text-center text-sm text-[#4A4A4A]">
        {libraryName} — {new Date().getFullYear()}
      </footer>
    </div>
  )
}
