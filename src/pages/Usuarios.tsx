import { useEffect, useState, useMemo, useCallback } from 'react'
import { UserPlus, Search, Users, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { LeitorForm } from '@/components/usuarios/LeitorForm'
import { LeitorFicha } from '@/components/usuarios/LeitorFicha'
import { getLeitores, type Leitor } from '@/services/leitores'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from 'sonner'

export default function Usuarios() {
  const [leitores, setLeitores] = useState<Leitor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [fichaId, setFichaId] = useState<string | null>(null)
  const [fichaOpen, setFichaOpen] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const data = await getLeitores()
      setLeitores(data)
    } catch {
      toast.error('Erro ao carregar usuários.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('leitores', () => {
    loadData()
  })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return leitores
    return leitores.filter((l) => {
      return (
        l.numero_cadastro.toLowerCase().includes(q) ||
        l.nome_completo.toLowerCase().includes(q) ||
        l.telefone.toLowerCase().includes(q)
      )
    })
  }, [leitores, search])

  const handleRowClick = (id: string) => {
    setFichaId(id)
    setFichaOpen(true)
  }

  const handleCreated = () => {
    toast.success('Usuário cadastrado com sucesso!')
  }

  return (
    <div className="space-y-6">
      {/* Header with New User button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#1F5C8B] flex items-center justify-center text-white shrink-0">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Usuários</h2>
            <p className="text-base text-gray-500">Cadastro e acompanhamento dos leitores</p>
          </div>
        </div>
        <Button
          onClick={() => setFormOpen(true)}
          className="h-14 px-6 text-lg font-bold bg-[#1F5C8B] hover:bg-[#174A73] shadow-sm"
        >
          <UserPlus className="w-6 h-6 mr-2" />
          Novo usuário
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por número, nome ou telefone..."
          className="h-14 pl-14 text-base font-medium border-gray-300"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-600">
            {search ? 'Nenhum usuário encontrado.' : 'Nenhum usuário cadastrado.'}
          </p>
          {!search && (
            <p className="text-base text-gray-400 mt-1">
              Clique em "Novo usuário" para cadastrar o primeiro leitor.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {/* Column headers (desktop) */}
          <div className="hidden md:grid grid-cols-[120px_1fr_180px_120px] gap-4 px-4 py-2 text-sm font-bold text-gray-500 uppercase tracking-wide">
            <span>Cadastro</span>
            <span>Nome</span>
            <span>Telefone</span>
            <span>Status</span>
          </div>
          {filtered.map((leitor) => (
            <button
              key={leitor.id}
              onClick={() => handleRowClick(leitor.id)}
              className="w-full text-left bg-white border border-gray-200 rounded-lg p-4 hover:border-[#1F5C8B] hover:bg-[#1F5C8B]/5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1F5C8B] md:grid md:grid-cols-[120px_1fr_180px_120px] md:items-center md:gap-4 flex flex-col gap-2"
            >
              <div className="flex items-center gap-2">
                <span className="md:hidden text-sm font-bold text-gray-500">Nº </span>
                <span className="text-base font-bold text-[#1F5C8B]">{leitor.numero_cadastro}</span>
              </div>
              <span className="text-base font-semibold text-gray-900 break-words">
                {leitor.nome_completo}
              </span>
              <div className="flex items-center gap-2">
                <span className="md:hidden text-sm font-bold text-gray-500">Tel: </span>
                <span className="text-base text-gray-700">{leitor.telefone}</span>
              </div>
              <div>
                <Badge
                  className={
                    leitor.status === 'ativo'
                      ? 'bg-green-100 text-green-800 hover:bg-green-100'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-200'
                  }
                >
                  {leitor.status === 'ativo' ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* New User Form Dialog */}
      <LeitorForm open={formOpen} onOpenChange={setFormOpen} onCreated={handleCreated} />

      {/* User Ficha Sheet */}
      <LeitorFicha leitorId={fichaId} open={fichaOpen} onOpenChange={setFichaOpen} />
    </div>
  )
}
