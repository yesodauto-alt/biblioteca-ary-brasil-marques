import { useState, useRef, useEffect } from 'react'
import {
  ArrowLeftRight,
  BookOpen,
  User,
  CheckCircle2,
  AlertCircle,
  Calendar,
  X,
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { type Leitor } from '@/services/leitores'
import { getLivroByCadastro, updateLivroStatus, STATUS_LABELS, type Livro } from '@/services/livros'
import { createEmprestimo, LOAN_PERIOD_DAYS } from '@/services/emprestimos'
import { getConfiguracoes, type Configuracoes as ConfigType } from '@/services/configuracoes'
import { LeitorSearch } from '@/components/usuarios/LeitorSearch'
import { toast } from 'sonner'

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR')
}

export default function Emprestimos() {
  const { user } = useAuth()
  const [foundLeitor, setFoundLeitor] = useState<Leitor | null>(null)
  const [bookSearch, setBookSearch] = useState('')
  const [foundLivro, setFoundLivro] = useState<Livro | null>(null)
  const [bookError, setBookError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [isEstudo, setIsEstudo] = useState(false)
  const [blockMessage, setBlockMessage] = useState<string | null>(null)
  const [config, setConfig] = useState<ConfigType | null>(null)

  const bookInputRef = useRef<HTMLInputElement>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    getConfiguracoes()
      .then(setConfig)
      .catch(() => {})
  }, [])

  useRealtime('emprestimos', () => {})

  const handleLeitorSelected = (leitor: Leitor) => {
    setFoundLeitor(leitor)
    setSuccess(null)
    setBlockMessage(null)
    if (leitor.status === 'ativo') {
      setTimeout(() => bookInputRef.current?.focus(), 100)
    }
  }

  const handleBookLookup = async () => {
    const num = bookSearch.trim()
    if (!num) return
    setFoundLivro(null)
    setBookError(null)
    try {
      const livro = await getLivroByCadastro(num)
      setFoundLivro(livro)
      if (livro.status !== 'disponível') {
        setBookError(`Livro indisponível. Status atual: ${STATUS_LABELS[livro.status]}.`)
        return
      }
      confirmRef.current?.focus()
    } catch {
      setBookError('Livro não encontrado com o número informado.')
    }
  }

  const canConfirm =
    foundLeitor?.status === 'ativo' && foundLivro?.status === 'disponível' && !submitting && !!user

  const handleConfirm = async () => {
    if (!foundLeitor || !foundLivro || !user || !canConfirm) return
    setSubmitting(true)
    setBlockMessage(null)
    try {
      const emp = await createEmprestimo({
        leitor: foundLeitor.id,
        livro: foundLivro.id,
        responsavel: user.id,
        tipo_emprestimo: isEstudo ? 'estudo' : 'comum',
      })
      await updateLivroStatus(foundLivro.id, 'emprestado')
      setSuccess(
        `Empréstimo realizado com sucesso. Devolução prevista: ${formatDate(emp.data_prevista_devolucao)}.`,
      )
      setFoundLeitor(null)
      setBookSearch('')
      setFoundLivro(null)
      setBookError(null)
      setIsEstudo(false)
    } catch (err) {
      const msg = getErrorMessage(err)
      setBlockMessage(msg)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#1F5C8B] flex items-center justify-center text-white shrink-0">
          <ArrowLeftRight className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Empréstimos</h2>
          <p className="text-base text-gray-500">Registro rápido de empréstimos</p>
        </div>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-300 rounded-xl p-4 flex items-start gap-3 animate-fade-in">
          <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
          <p className="text-lg font-semibold text-green-800">{success}</p>
        </div>
      )}

      {blockMessage && (
        <div className="bg-red-50 border-2 border-red-400 rounded-xl p-4 flex items-start gap-3 animate-fade-in">
          <AlertCircle className="w-7 h-7 text-red-600 shrink-0 mt-0.5" />
          <p className="text-lg font-bold text-red-800">{blockMessage}</p>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-lg font-bold text-gray-800">Usuário</label>
          {!foundLeitor ? (
            <LeitorSearch onLeitorSelected={handleLeitorSelected} />
          ) : (
            <div className="bg-[#1F5C8B]/5 border border-[#1F5C8B]/20 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-[#1F5C8B]" />
                  <span className="text-lg font-bold text-gray-900">
                    {foundLeitor.nome_completo}
                  </span>
                  <Badge
                    className={
                      foundLeitor.status === 'ativo'
                        ? 'bg-green-100 text-green-800 hover:bg-green-100'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-200'
                    }
                  >
                    {foundLeitor.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFoundLeitor(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-base text-gray-600">Nº {foundLeitor.numero_cadastro}</p>
              {foundLeitor.telefone && (
                <p className="text-base text-gray-600">{foundLeitor.telefone}</p>
              )}
              {foundLeitor.status === 'inativo' && (
                <p className="text-base font-semibold text-red-600">
                  Este usuário está inativo. Empréstimo não permitido.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-lg font-bold text-gray-800">Número do livro</label>
          <Input
            ref={bookInputRef}
            value={bookSearch}
            onChange={(e) => {
              setBookSearch(e.target.value)
              setFoundLivro(null)
              setBookError(null)
              setBlockMessage(null)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleBookLookup()
              }
            }}
            placeholder="Digite o número e pressione ENTER..."
            className="h-14 text-lg font-medium border-gray-300"
          />
          {bookError && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span className="font-semibold">{bookError}</span>
            </div>
          )}
          {foundLivro && (
            <div className="bg-[#1F5C8B]/5 border border-[#1F5C8B]/20 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#1F5C8B]" />
                <span className="text-lg font-bold text-gray-900">{foundLivro.titulo}</span>
                <Badge
                  className={
                    foundLivro.status === 'disponível'
                      ? 'bg-green-100 text-green-800 hover:bg-green-100'
                      : 'bg-red-100 text-red-800 hover:bg-red-100'
                  }
                >
                  {STATUS_LABELS[foundLivro.status]}
                </Badge>
              </div>
              <p className="text-base text-gray-600">
                {foundLivro.autor} — Nº {foundLivro.numero_cadastro}
              </p>
            </div>
          )}
        </div>

        <div className="bg-[#1F5C8B]/5 border-2 border-[#1F5C8B]/30 rounded-xl p-4">
          <label className="flex items-center gap-4 cursor-pointer select-none">
            <Checkbox
              checked={isEstudo}
              onCheckedChange={(checked) => {
                setIsEstudo(checked === true)
                setBlockMessage(null)
              }}
              className="w-8 h-8 border-2 border-[#1F5C8B]"
            />
            <div>
              <span className="text-xl font-bold text-gray-900">Estudo</span>
              <p className="text-base text-gray-600">
                Marque para empréstimo de estudo (90 dias de prazo)
              </p>
            </div>
          </label>
        </div>

        <div className="flex items-center gap-2 text-base text-gray-500 flex-wrap">
          <Calendar className="w-5 h-5" />
          <span>
            Prazo de devolução: {isEstudo ? 90 : (config?.prazo_devolucao_dias ?? LOAN_PERIOD_DAYS)}{' '}
            dias
          </span>
          <span className="ml-4">Limite: 1 livro comum + 1 livro de estudo</span>
        </div>

        <Button
          ref={confirmRef}
          onClick={handleConfirm}
          disabled={!canConfirm}
          className="w-full h-16 text-xl font-bold bg-[#1F5C8B] hover:bg-[#174A73] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle2 className="w-7 h-7 mr-2" />
          Confirmar empréstimo
        </Button>
      </div>
    </div>
  )
}
