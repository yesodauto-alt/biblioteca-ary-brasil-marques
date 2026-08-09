import { Users, BookOpen, ArrowLeftRight, Clock, LayoutDashboard } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

const STAT_PLACEHOLDERS = [
  { label: 'Total de usuários', icon: Users },
  { label: 'Total de livros', icon: BookOpen },
  { label: 'Empréstimos ativos', icon: ArrowLeftRight },
  { label: 'Empréstimos em atraso', icon: Clock },
]

export default function Index() {
  const { user } = useAuth()
  const volunteerName = user?.name || 'Voluntário(a)'

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-white p-6 md:p-8 rounded-xl border border-[#D4D4D4] shadow-subtle space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          Bem-vindo, {volunteerName}!
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          Sistema de gestão da biblioteca do Centro Espírita. Escolha uma das opções no menu lateral
          para acessar os módulos.
        </p>
      </div>

      {/* Dashboard Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <LayoutDashboard className="w-7 h-7 text-[#1F5C8B]" />
          <span>Visão geral</span>
        </h2>

        {/* 4 Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_PLACEHOLDERS.map((item, index) => {
            const Icon = item.icon
            return (
              <div
                key={index}
                className="border-2 border-dashed border-[#A9A9A9] rounded-xl bg-white p-6 flex flex-col items-center justify-center text-center space-y-3 min-h-[160px] shadow-sm"
              >
                <div className="w-12 h-12 rounded-full bg-[#1F5C8B]/10 text-[#1F5C8B] flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-800">{item.label}</p>
                  <span className="inline-block mt-1 text-sm font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    Em breve
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Large Summary Dashboard Panel Placeholder */}
        <div className="border-2 border-dashed border-[#A9A9A9] rounded-xl bg-white p-10 md:p-14 text-center min-h-[260px] flex flex-col items-center justify-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#1F5C8B]/10 text-[#1F5C8B] flex items-center justify-center">
            <LayoutDashboard className="w-8 h-8" />
          </div>
          <p className="text-xl font-medium text-gray-700">Seu painel de resumo aparecerá aqui</p>
        </div>
      </div>
    </div>
  )
}
