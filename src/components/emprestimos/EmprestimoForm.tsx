import { useState, useEffect } from 'react'
import { Loader2, AlertCircle, Plus, ArrowLeft } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { LeitorSearch } from '@/components/usuarios/LeitorSearch'
import { getLivroByCadastro, updateLivroStatus, type Livro } from '@/services/livros'
import { createEmprestimo, getEmprestimosByLeitor, type Emprestimo } from '@/services/emprestimos'
import { getConfiguracoes, type Configuracoes } from '@/services/configuracoes'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import type { Leitor } from '@/services/leitores'

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR')
}

interface EmprestimoFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}

export function EmprestimoForm({ open, onOpenChange, onCreated }: EmprestimoFormProps) {
  const { user } = useAuth()
  const [leitor, setLeitor] = useState<Leitor | null>(null)
  const [bookSearch, setBookSearch] = useState('')
  const [foundLivro, setFoundLivro] = useState<Livro | null>(null)
  const [bookError, setBookError] = useState<string | null>(null)
  const [tipo, setTipo] = useState<'comum' | 'estudo'>('comum')
  const [config, setConfig] = useState<Configuracoes | null>(null)
  const [activeLoans, setActiveLoans] = useState<Emprestimo[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [bookLooking, setBookLooking] = useState(false)

  useEffect(() => {
    getConfiguracoes()
      .then(setConfig)
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (open) {
      setLeitor(null)
      setBookSearch('')
      setFoundLivro(null)
      setBookError(null)
      setTipo('comum')
    }
  }, [open])

  const handleLeitorSelected = async (l: Leitor) => {
    setLeitor(l)
    try {
      setActiveLoans(await getEmprestimosByLeitor(l.id))
    } catch {
      setActiveLoans([])
    }
  }

  const handleBookLookup = async () => {
    const num = bookSearch.trim()
    if (!num) return
    setBookLooking(true)
    setBookError(null)
    try {
      const livro = await getLivroByCadastro(num)
      if (livro.status !== 'disponível') {
        setBookError('Este livro não está disponível para empréstimo.')
        setFoundLivro(null)
      } else {
        setFoundLivro(livro)
      }
    } catch {
      setBookError('Livro não encontrado.')
      setFoundLivro(null)
    } finally {
      setBookLooking(false)
    }
  }

  const comumCount = activeLoans.filter(
    (e) => e.status === 'ativo' && (e.tipo_emprestimo || 'comum') === 'comum',
  ).length
  const estudoCount = activeLoans.filter(
    (e) => e.status === 'ativo' && e.tipo_emprestimo === 'estudo',
  ).length
  const limiteComum = config?.limite_livros_por_usuario || 1
  const wouldExceed = tipo === 'comum' ? comumCount >= limiteComum : estudoCount >= 1

  const handleSubmit = async () => {
    if (!leitor || !foundLivro || !user || wouldExceed) return
    setSubmitting(true)
    try {
      await createEmprestimo({
        leitor: leitor.id,
        livro: foundLivro.id,
        responsavel: user.id,
        tipo_emprestimo: tipo,
      })
      await updateLivroStatus(foundLivro.id, 'emprestado')
      toast.success('Empréstimo registrado com sucesso!')
      onCreated()
      onOpenChange(false)
    } catch {
      toast.error('Erro ao registrar empréstimo. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  const returnDate = (() => {
    const days = tipo === 'estudo' ? 90 : config?.prazo_devolucao_dias || 15
    const d = new Date()
    d.setDate(d.getDate() + days)
    return d.toISOString().split('T')[0]
  })()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Plus className="w-5 h-5" /> Novo Empréstimo
          </DialogTitle>
        </DialogHeader>

        {!leitor ? (
          <div className="space-y-4">
            <Label className="text-base font-semibold">1. Selecione o usuário</Label>
            <LeitorSearch onLeitorSelected={handleLeitorSelected} />
          </div>
        ) : !foundLivro ? (
          <div className="space-y-4">
            <div className="bg-[#1F5C8B]/5 rounded-lg p-3 border border-[#1F5C8B]/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">{leitor.nome_completo}</p>
                  <p className="text-sm text-gray-600">Nº {leitor.numero_cadastro}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setLeitor(null)
                    setActiveLoans([])
                  }}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> Trocar
                </Button>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Empréstimos ativos — Comum: {comumCount}/{limiteComum} · Estudo: {estudoCount}/1
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">2. Digite o número do livro</Label>
              <Input
                value={bookSearch}
                onChange={(e) => {
                  setBookSearch(e.target.value)
                  setFoundLivro(null)
                  setBookError(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleBookLookup()
                  }
                }}
                placeholder="Digite o número e pressione ENTER..."
                className="h-12 text-base"
                autoFocus
              />
              {bookLooking && <p className="text-sm text-gray-500">Buscando livro...</p>}
              {bookError && (
                <p className="text-sm text-red-500 font-medium flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {bookError}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">3. Tipo de empréstimo</Label>
              <div className="flex gap-2">
                <Button
                  variant={tipo === 'comum' ? 'default' : 'outline'}
                  onClick={() => setTipo('comum')}
                  className={
                    tipo === 'comum' ? 'flex-1 h-12 bg-[#1F5C8B] hover:bg-[#174A73]' : 'flex-1 h-12'
                  }
                >
                  Comum
                </Button>
                <Button
                  variant={tipo === 'estudo' ? 'default' : 'outline'}
                  onClick={() => setTipo('estudo')}
                  className={
                    tipo === 'estudo'
                      ? 'flex-1 h-12 bg-[#1F5C8B] hover:bg-[#174A73]'
                      : 'flex-1 h-12'
                  }
                >
                  Estudo
                </Button>
              </div>
              {wouldExceed && (
                <p className="text-sm text-red-500 font-medium flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {tipo === 'comum'
                    ? 'Limite de empréstimos comuns atingido.'
                    : 'Já existe empréstimo de estudo ativo.'}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-[#1F5C8B]/5 rounded-lg p-4 border border-[#1F5C8B]/20 space-y-3">
              <div>
                <p className="text-sm text-gray-500 font-medium">Usuário</p>
                <p className="text-base font-bold text-gray-900">{leitor.nome_completo}</p>
                <p className="text-sm text-gray-600">Nº {leitor.numero_cadastro}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Livro</p>
                <p className="text-base font-bold text-gray-900">{foundLivro.titulo}</p>
                <p className="text-sm text-gray-600">
                  Nº {foundLivro.numero_cadastro} · {foundLivro.autor}
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                <Badge
                  className={
                    tipo === 'estudo'
                      ? 'bg-purple-100 text-purple-800 hover:bg-purple-100'
                      : 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                  }
                >
                  {tipo === 'estudo' ? 'Estudo' : 'Comum'}
                </Badge>
                <span className="text-sm text-gray-600">
                  Devolução prevista: {formatDate(returnDate)}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setFoundLivro(null)
                  setBookSearch('')
                }}
                className="flex-1 h-12 text-base font-semibold"
              >
                Voltar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 h-12 text-base font-bold bg-[#1F5C8B] hover:bg-[#174A73]"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-5 h-5 mr-2" />
                )}
                Confirmar empréstimo
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
