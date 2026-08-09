import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  CornerUpLeft,
  RefreshCw,
  BookOpen,
  Calendar,
  AlertTriangle,
  Users,
  CheckCircle2,
  Search,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { LeitorFicha } from '@/components/usuarios/LeitorFicha'
import { LivroFicha } from '@/components/acervo/LivroFicha'
import {
  fetchDashboardData,
  searchDashboard,
  type DashboardStats,
  type AttentionItem,
  type SearchResult,
} from '@/services/dashboard'

const STAT_CARDS: Array<{
  key: keyof DashboardStats
  label: string
  icon: typeof BookOpen
  iconClass: string
}> = [
  {
    key: 'livrosEmprestados',
    label: 'Livros emprestados',
    icon: BookOpen,
    iconClass: 'bg-blue-50 text-blue-600',
  },
  {
    key: 'devolucoesPrevistasHoje',
    label: 'Devoluções previstas para hoje',
    icon: Calendar,
    iconClass: 'bg-amber-50 text-amber-600',
  },
  {
    key: 'emprestimosAtrasados',
    label: 'Empréstimos atrasados',
    icon: AlertTriangle,
    iconClass: 'bg-red-50 text-red-600',
  },
  {
    key: 'usuariosAtivos',
    label: 'Usuários ativos',
    icon: Users,
    iconClass: 'bg-green-50 text-green-600',
  },
  {
    key: 'livrosDisponiveis',
    label: 'Livros disponíveis',
    icon: CheckCircle2,
    iconClass: 'bg-teal-50 text-teal-600',
  },
  {
    key: 'devolucoesRealizadasHoje',
    label: 'Devoluções realizadas hoje',
    icon: CornerUpLeft,
    iconClass: 'bg-purple-50 text-purple-600',
  },
]

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR')
}

export default function Index() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [attentionItems, setAttentionItems] = useState<AttentionItem[]>([])
  const [loading, setLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])

  const [leitorFichaId, setLeitorFichaId] = useState<string | null>(null)
  const [leitorFichaOpen, setLeitorFichaOpen] = useState(false)
  const [livroFichaId, setLivroFichaId] = useState<string | null>(null)
  const [livroFichaOpen, setLivroFichaOpen] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const data = await fetchDashboardData()
      setStats(data.stats)
      setAttentionItems(data.attentionItems)
    } catch {
      /* ignored */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('emprestimos', () => loadData())
  useRealtime('leitores', () => loadData())
  useRealtime('livros', () => loadData())

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }
    const timer = setTimeout(async () => {
      try {
        setSearchResults(await searchDashboard(searchQuery))
      } catch {
        setSearchResults([])
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const openLeitor = (id: string) => {
    setLeitorFichaId(id)
    setLeitorFichaOpen(true)
    setSearchQuery('')
    setSearchResults([])
  }

  const openLivro = (id: string) => {
    setLivroFichaId(id)
    setLivroFichaOpen(true)
    setSearchQuery('')
    setSearchResults([])
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-[#D4D4D4] shadow-subtle">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Bem-vindo, {user?.name || 'Voluntário(a)'}!
        </h1>
        <p className="text-base text-gray-600 mt-1">
          Painel operacional da biblioteca — ações e informações do dia.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Button
          onClick={() => navigate('/emprestimos')}
          className="h-16 text-xl font-bold bg-[#1F5C8B] hover:bg-[#174A73]"
        >
          <Plus className="w-7 h-7 mr-2" />+ Novo empréstimo
        </Button>
        <Button
          onClick={() => navigate('/devolucao')}
          className="h-16 text-xl font-bold bg-[#C62828] hover:bg-[#A31D1D]"
        >
          <CornerUpLeft className="w-7 h-7 mr-2" />
          Devolução
        </Button>
        <Button
          onClick={() => navigate('/renovacao')}
          className="h-16 text-xl font-bold bg-[#2E7D32] hover:bg-[#1B5E20]"
        >
          <RefreshCw className="w-7 h-7 mr-2" />
          Renovar empréstimo
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 z-10" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar usuário ou livro..."
          className="h-14 text-lg pl-14 border-gray-300"
        />
        {searchResults.length > 0 && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setSearchResults([])} />
            <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-y-auto">
              {searchResults.map((r) => (
                <button
                  key={`${r.type}-${r.id}`}
                  onClick={() => (r.type === 'leitor' ? openLeitor(r.id) : openLivro(r.id))}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left border-b border-gray-100 last:border-0"
                >
                  {r.type === 'leitor' ? (
                    <Users className="w-5 h-5 text-[#1F5C8B]" />
                  ) : (
                    <BookOpen className="w-5 h-5 text-[#1F5C8B]" />
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{r.primary}</p>
                    <p className="text-sm text-gray-500">{r.secondary}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon
          const value = stats ? stats[card.key] : null
          return (
            <div
              key={card.key}
              className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 shadow-sm"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${card.iconClass}`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-3xl font-bold text-gray-900">{value}</p>
                )}
                <p className="text-sm font-medium text-gray-500 leading-tight">{card.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="space-y-3">
        <h2 className="text-2xl font-bold text-gray-900">ATENÇÃO HOJE</h2>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : attentionItems.length === 0 ? (
          <div className="bg-green-50 border border-green-300 rounded-xl p-6 flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
            <p className="text-lg font-semibold text-green-800">
              Nenhum item urgente. Tudo em dia!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {attentionItems.map((item) => (
              <div
                key={item.id}
                className={`rounded-xl p-4 border-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 ${
                  item.situacao === 'atrasado'
                    ? 'bg-red-50 border-red-300'
                    : 'bg-amber-50 border-amber-300'
                }`}
              >
                <button
                  onClick={() => openLeitor(item.leitorId)}
                  className="flex-1 text-left cursor-pointer"
                >
                  <p className="text-lg font-bold text-[#1F5C8B]">{item.leitorNome}</p>
                  <p className="text-sm text-gray-600">Nº {item.leitorNumero}</p>
                </button>
                <button
                  onClick={() => openLivro(item.livroId)}
                  className="flex-1 text-left cursor-pointer"
                >
                  <p className="text-base font-semibold text-[#1F5C8B]">{item.livroTitulo}</p>
                  <p className="text-sm text-gray-500">
                    Devolução: {formatDate(item.dataPrevistaDevolucao)}
                  </p>
                </button>
                <Badge
                  className={
                    item.situacao === 'atrasado'
                      ? 'bg-red-200 text-red-800 hover:bg-red-200'
                      : 'bg-amber-200 text-amber-800 hover:bg-amber-200'
                  }
                >
                  {item.situacao === 'atrasado' ? 'Atrasado' : 'Vence hoje'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      <LeitorFicha
        leitorId={leitorFichaId}
        open={leitorFichaOpen}
        onOpenChange={setLeitorFichaOpen}
      />
      <LivroFicha livroId={livroFichaId} open={livroFichaOpen} onOpenChange={setLivroFichaOpen} />
    </div>
  )
}
