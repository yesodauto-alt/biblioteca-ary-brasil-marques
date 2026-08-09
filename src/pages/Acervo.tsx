import { useEffect, useState, useMemo, useCallback } from 'react'
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
    if (!q) return livros
    return livros.filter((l) => {
      return (
        l.numero_cadastro.toLowerCase().includes(q) ||
        l.titulo.toLowerCase().includes(q) ||
        l.autor.toLowerCase().includes(q) ||
        l.editora.toLowerCase().includes(q)
      )
    })
  }, [livros, search])

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
          <div className="w-12 h-12 rounded-xl bg-[#1F5C8B] flex items-center justify-center text-white shrink-0">
            <Library className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Acervo</h2>
            <p className="text-base text-gray-500">
              Cadastro e organização dos livros da biblioteca
            </p>
          </div>
        </div>
        <Button
          onClick={() => setFormOpen(true)}
          className="h-14 px-6 text-lg font-bold bg-[#1F5C8B] hover:bg-[#174A73] shadow-sm"
        >
          <BookPlus className="w-6 h-6 mr-2" />
          Novo livro
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por número, título, autor ou editora..."
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
          <div className="hidden md:grid grid-cols-[120px_1fr_1fr_180px_130px] gap-4 px-4 py-2 text-sm font-bold text-gray-500 uppercase tracking-wide">
            <span>Cadastro</span>
            <span>Título</span>
            <span>Autor</span>
            <span>Localização</span>
            <span>Status</span>
          </div>
          {filtered.map((livro) => (
            <button
              key={livro.id}
              onClick={() => handleRowClick(livro.id)}
              className="w-full text-left bg-white border border-gray-200 rounded-lg p-4 hover:border-[#1F5C8B] hover:bg-[#1F5C8B]/5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1F5C8B] md:grid md:grid-cols-[120px_1fr_1fr_180px_130px] md:items-center md:gap-4 flex flex-col gap-2"
            >
              <div className="flex items-center gap-2">
                <span className="md:hidden text-sm font-bold text-gray-500">Nº </span>
                <span className="text-base font-bold text-[#1F5C8B]">{livro.numero_cadastro}</span>
              </div>
              <span className="text-base font-semibold text-gray-900 break-words">
                {livro.titulo}
              </span>
              <span className="text-base text-gray-700 break-words">{livro.autor}</span>
              <span className="text-base text-gray-600 break-words">
                {livro.localizacao_fisica || '—'}
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
      <LivroForm open={formOpen} onOpenChange={setFormOpen} onCreated={handleCreated} />

      {/* Book Ficha Sheet */}
      <LivroFicha livroId={fichaId} open={fichaOpen} onOpenChange={setFichaOpen} />
    </div>
  )
}
