import { useEffect, useState, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BookPlus, Search, BookOpen, Library } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { LivroForm } from '@/components/acervo/LivroForm'
import { LivroFicha } from '@/components/acervo/LivroFicha'
import { getLivros, STATUS_LABELS, STATUS_BADGE_CLASSES, type Livro } from '@/services/livros'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from 'sonner'

export default function Acervo() {
  const [livros, setLivros] = useState<Livro[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [fichaId, setFichaId] = useState<string | null>(null)
  const [fichaOpen, setFichaOpen] = useState(false)
  const [searchParams] = useSearchParams()
  const statusFilter = searchParams.get('filter') || ''

  const loadData = useCallback(async () => {
    try {
      const data = await getLivros()
      setLivros(data)
    } catch {
      toast.error('Erro ao carregar o acervo.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('livros', () => {
    loadData()
  })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return livros.filter((l) => {
      if (statusFilter && l.status !== statusFilter) return false
      if (!q) return true
      return (
        l.numero_cadastro.toLowerCase().includes(q) ||
        l.titulo.toLowerCase().includes(q) ||
        l.autor.toLowerCase().includes(q) ||
        l.editora.toLowerCase().includes(q) ||
        (l.cod || '').toLowerCase().includes(q) ||
        (l.descricao || '').toLowerCase().includes(q) ||
        (l.cutter || '').toLowerCase().includes(q)
      )
    })
  }, [livros, search, statusFilter])

  const handleRowClick = (id: string) => {
    setFichaId(id)
    setFichaOpen(true)
  }

  const handleCreated = () => {
    toast.success('Livro cadastrado com sucesso!')
  }

  return (
    <div className="space-y-6">
      {/* Header with New Book button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#1F5C8B] flex items-center justify-center text-white shrink-0">
            <Library className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Acervo</h2>
            <p className="text-sm text-gray-500">Cadastro e organização dos livros da biblioteca</p>
          </div>
        </div>
        <Button
          onClick={() => setFormOpen(true)}
          className="h-11 px-4 text-sm font-semibold bg-[#1F5C8B] hover:bg-[#174A73] shadow-sm"
        >
          <BookPlus className="w-5 h-5 mr-2" />
          Novo livro
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por número, título, autor, editora, COD, descrição ou CUTTER..."
          className="h-12 pl-12 text-base border-gray-200"
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
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-600">
            {search ? 'Nenhum livro encontrado.' : 'Nenhum livro cadastrado.'}
          </p>
          {!search && (
            <p className="text-base text-gray-400 mt-1">
              Clique em "Novo livro" para cadastrar o primeiro livro.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {/* Column headers (desktop) */}
          <div className="hidden md:grid grid-cols-[100px_1.5fr_1.5fr_80px_1fr_90px_120px] gap-3 px-4 py-2 text-sm font-bold text-gray-500 uppercase tracking-wide">
            <span>Cadastro</span>
            <span>Título</span>
            <span>Autor</span>
            <span>COD</span>
            <span>Descrição</span>
            <span>Cutter</span>
            <span>Status</span>
          </div>
          {filtered.map((livro) => (
            <button
              key={livro.id}
              onClick={() => handleRowClick(livro.id)}
              className="w-full text-left bg-white border border-gray-200/80 rounded-lg p-4 hover:border-[#1F5C8B]/40 hover:bg-[#1F5C8B]/5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1F5C8B]/30 md:grid md:grid-cols-[100px_1.5fr_1.5fr_80px_1fr_90px_120px] md:items-center md:gap-3 flex flex-col gap-2"
            >
              <div className="flex items-center gap-2">
                <span className="md:hidden text-sm font-bold text-gray-500">Nº </span>
                <span className="text-base font-bold text-[#1F5C8B]">{livro.numero_cadastro}</span>
              </div>
              <span className="text-base font-semibold text-gray-900 break-words">
                {livro.titulo}
              </span>
              <span className="text-base text-gray-700 break-words">{livro.autor}</span>
              <span className="text-sm font-semibold text-gray-700 break-words">
                {livro.cod || '—'}
              </span>
              <span className="text-sm text-gray-600 break-words">{livro.descricao || '—'}</span>
              <span className="text-sm font-semibold text-gray-700 break-words">
                {livro.cutter || '—'}
              </span>
              <div>
                <Badge className={STATUS_BADGE_CLASSES[livro.status]}>
                  {STATUS_LABELS[livro.status]}
                </Badge>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* New Book Form Dialog */}
      <LivroForm open={formOpen} onOpenChange={setFormOpen} onSaved={handleCreated} />

      {/* Book Ficha Sheet */}
      <LivroFicha livroId={fichaId} open={fichaOpen} onOpenChange={setFichaOpen} />
    </div>
  )
}
