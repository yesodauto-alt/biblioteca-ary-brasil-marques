import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ArrowLeftRight,
  CornerDownLeft,
  RefreshCw,
  BarChart3,
  GraduationCap,
  Settings,
  Upload,
  LogOut,
  Menu,
} from 'lucide-react'

interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/usuarios', label: 'Usuários', icon: Users },
  { to: '/acervo', label: 'Acervo', icon: BookOpen },
  { to: '/emprestimos', label: 'Empréstimos', icon: ArrowLeftRight },
  { to: '/devolucao', label: 'Devolução', icon: CornerDownLeft },
  { to: '/renovacao', label: 'Renovação', icon: RefreshCw },
  { to: '/relatorios', label: 'Relatórios', icon: BarChart3 },
  { to: '/cursos', label: 'Cursos', icon: GraduationCap },
]

const ADMIN_ITEMS: NavItem[] = [
  { to: '/configuracoes', label: 'Configurações', icon: Settings },
  { to: '/importacao', label: 'Importação', icon: Upload },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation()
  const { user, signOut } = useAuth()
  const items = user?.role === 'administrador' ? [...NAV_ITEMS, ...ADMIN_ITEMS] : NAV_ITEMS

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 shrink-0">
        <h1 className="text-xl font-bold text-[#1F5C8B]">Biblioteca</h1>
        <p className="text-sm text-gray-500">Centro Espírita</p>
      </div>
      <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.to
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium transition-colors',
                isActive ? 'bg-[#1F5C8B] text-white' : 'text-gray-700 hover:bg-gray-100',
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t shrink-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'Voluntário'}</p>
        <p className="text-xs text-gray-500 truncate mb-2">{user?.email}</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className="w-full justify-start text-gray-600"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  )
}

export default function Layout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex-col z-30">
        <SidebarContent />
      </aside>

      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b sticky top-0 z-30">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SidebarContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <h1 className="text-lg font-bold text-[#1F5C8B]">Biblioteca</h1>
        <div className="w-10" />
      </div>

      <main className="md:ml-64 p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  )
}
