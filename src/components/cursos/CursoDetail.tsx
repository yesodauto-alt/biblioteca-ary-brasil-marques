import { useEffect, useState, useCallback } from 'react'
import { Search, Trash2, BookOpen, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  getCursoLivros,
  linkLivroToCurso,
  unlinkLivroFromCurso,
  getLinkedLivroIds,
  type Curso,
  type CursoLivro,
} from '@/services/cursos'
import { getLivros, type Livro } from '@/services/livros'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from 'sonner'

interface CursoDetailProps {
  curso: Curso | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CursoDetail({ curso, open, onOpenChange }: CursoDetailProps) {
  const [links, setLinks] = useState<CursoLivro[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [allLivros, setAllLivros] = useState<Livro[]>([])
  const [linking, setLinking] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    if (!curso) return
    setLoading(true)
    try {
      const [linkData, livrosData] = await Promise.all([getCursoLivros(curso.id), getLivros()])
      setLinks(linkData)
      setAllLivros(livrosData)
    } catch {
      toast.error('Erro ao carregar dados do curso.')
    } finally {
      setLoading(false)
    }
  }, [curso])

  useEffect(() => {
    if (open && curso) {
      loadData()
    }
  }, [open, curso, loadData])

  useRealtime('cursos_livros', () => {
    if (open && curso) loadData()
  })

  const linkedLivroIds = new Set(links.map((l) => l.livro))

  const filteredLivros = allLivros.filter((livro) => {
    const q = search.trim().toLowerCase()
    if (!q) return !linkedLivroIds.has(livro.id)
    return (
      !linkedLivroIds.has(livro.id) &&
      (livro.numero_cadastro.toLowerCase().includes(q) ||
        livro.titulo.toLowerCase().includes(q) ||
        livro.autor.toLowerCase().includes(q))
    )
  })

  const handleLink = async (livroId: string) => {
    if (!curso) return
    setLinking(livroId)
    try {
      await linkLivroToCurso(curso.id, livroId)
      toast.success('Livro vinculado ao curso!')
    } catch {
      toast.error('Erro ao vincular livro.')
    } finally {
      setLinking(null)
    }
  }

  const handleUnlink = async (linkId: string) => {
    try {
      await unlinkLivroFromCurso(linkId)
      toast.success('Livro removido do curso.')
    } catch {
      toast.error('Erro ao remover livro.')
    }
  }

  if (!curso) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg max-h-[100vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">{curso.nome}</SheetTitle>
          <SheetDescription className="text-base">
            {curso.ano_nivel_etapa
              ? `Ano/nível: ${curso.ano_nivel_etapa}`
              : 'Gerencie os livros vinculados a este curso.'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Linked books list */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-gray-900">
              Livros vinculados ({links.length})
            </h3>

            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : links.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-500">
                  Nenhum livro vinculado a este curso.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {links.map((link) => {
                  const livro = link.expand?.livro
                  return (
                    <div
                      key={link.id}
                      className="flex items-center justify-between gap-3 bg-white border border-gray-200 rounded-lg p-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-semibold text-gray-900 truncate">
                          {livro?.titulo || 'Livro não encontrado'}
                        </p>
                        <p className="text-sm text-gray-500 truncate">{livro?.autor || '—'}</p>
                        {livro && (
                          <Badge className="mt-1 bg-gray-100 text-gray-600 hover:bg-gray-100 text-xs">
                            Nº {livro.numero_cadastro}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnlink(link.id)}
                        className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 shrink-0"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remover
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Search and link new books */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-gray-900">Adicionar livro do acervo</h3>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar livro por título, autor ou número..."
                className="h-12 pl-10 text-base"
              />
            </div>

            {search.trim() && filteredLivros.length === 0 && (
              <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-500">
                  {linkedLivroIds.size === allLivros.length
                    ? 'Todos os livros do acervo já estão vinculados.'
                    : 'Nenhum livro encontrado.'}
                </p>
              </div>
            )}

            {!search.trim() && allLivros.length > 0 && linkedLivroIds.size === allLivros.length && (
              <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-500">
                  Todos os livros do acervo já estão vinculados a este curso.
                </p>
              </div>
            )}

            {filteredLivros.length > 0 && (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {filteredLivros.map((livro) => (
                  <div
                    key={livro.id}
                    className="flex items-center justify-between gap-3 bg-white border border-gray-200 rounded-lg p-3 hover:border-[#1F5C8B] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-gray-900 truncate">
                        {livro.titulo}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{livro.autor}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 text-xs">
                          Nº {livro.numero_cadastro}
                        </Badge>
                        <span className="text-xs text-gray-400">{livro.editora}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleLink(livro.id)}
                      disabled={linking === livro.id}
                      className="bg-[#1F5C8B] hover:bg-[#174A73] shrink-0"
                    >
                      {linking === livro.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4 mr-1" />
                      )}
                      Vincular
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
