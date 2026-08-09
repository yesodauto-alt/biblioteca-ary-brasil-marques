import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, BookOpen, Calendar, CheckCircle2, X, ArrowLeft, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { type Leitor } from '@/services/leitores'
import { getEmprestimosByLeitor, renovarEmprestimo, type Emprestimo } from '@/services/emprestimos'
import { getConfiguracoes, type Configuracoes as ConfigType } from '@/services/configuracoes'
import { LeitorSearch } from '@/components/usuarios/LeitorSearch'
import { toast } from 'sonner'

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR')
}

function calcNewReturnDate(tipo: string, prazo: number): string {
  const days = tipo === 'estudo' ? 90 : prazo
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export default function Renovacao() {
  const [selectedLeitor, setSelectedLeitor] = useState<Leitor | null>(null)
  const [activeLoans, setActiveLoans] = useState<Emprestimo[]>([])
  const [loading, setLoading] = useState(false)
  const [renewing, setRenewing] = useState(false)
  const [config, setConfig] = useState<ConfigType | null>(null)
  const [selectedLoan, setSelectedLoan] = useState<Emprestimo | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    getConfiguracoes()
      .then(setConfig)
      .catch(() => {})
  }, [])

  const loadLoans = useCallback(async (leitorId: string) => {
    setLoading(true)
    try {
      const loans = await getEmprestimosByLeitor(leitorId)
      setActiveLoans(loans.filter((l) => l.status === 'ativo'))
    } catch {
      setActiveLoans([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleLeitorSelected = (leitor: Leitor) => {
    setSelectedLeitor(leitor)
    setSelectedLoan(null)
    setSuccess(null)
    loadLoans(leitor.id)
  }

  const handleRenew = async () => {
    if (!selectedLoan || !config) return
    setRenewing(true)
    try {
      const novaData = calcNewReturnDate(selectedLoan.tipo_emprestimo, config.prazo_devolucao_dias)
      await renovarEmprestimo(selectedLoan.id, novaData)
      setSuccess(`Empréstimo renovado com sucesso. Nova devolução: ${formatDate(novaData)}.`)
      setSelectedLoan(null)
      if (selectedLeitor) loadLoans(selectedLeitor.id)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setRenewing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#1F5C8B] flex items-center justify-center text-white shrink-0">
          <RefreshCw className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Renovações</h2>
          <p className="text-base text-gray-500">Renove empréstimos ativos</p>
        </div>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-300 rounded-xl p-4 flex items-start gap-3 animate-fade-in">
          <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
          <p className="text-lg font-semibold text-green-800">{success}</p>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
        {!selectedLeitor ? (
          <div className="space-y-2">
            <label className="text-lg font-bold text-gray-800">Usuário</label>
            <LeitorSearch onLeitorSelected={handleLeitorSelected} />
          </div>
        ) : (
          <>
            <div className="bg-[#1F5C8B]/5 border border-[#1F5C8B]/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg font-bold text-gray-900">
                    {selectedLeitor.nome_completo}
                  </span>
                  <span className="text-base text-gray-600 ml-2">
                    Nº {selectedLeitor.numero_cadastro}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedLeitor(null)
                    setActiveLoans([])
                    setSelectedLoan(null)
                    setSuccess(null)
                  }}
                  className="text-gray-500"
                >
                  <ArrowLeft className="w-5 h-5 mr-1" /> Trocar
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-bold text-gray-800">Empréstimos Ativos</h3>
              {loading ? (
                <div className="flex items-center gap-2 text-gray-500 py-4">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-base">Carregando empréstimos...</span>
                </div>
              ) : activeLoans.length === 0 ? (
                <p className="text-base text-gray-500 italic py-4">
                  Nenhum empréstimo ativo para este usuário.
                </p>
              ) : (
                <div className="space-y-2">
                  {activeLoans.map((emp) => {
                    const isOverLimit = config
                      ? emp.quantidade_renovacoes >= config.limite_renovacoes
                      : false
                    return (
                      <button
                        key={emp.id}
                        onClick={() => !isOverLimit && setSelectedLoan(emp)}
                        disabled={isOverLimit}
                        className={`w-full text-left bg-white border-2 rounded-xl p-4 transition-colors duration-200 ${
                          isOverLimit
                            ? 'border-gray-200 opacity-60 cursor-not-allowed'
                            : selectedLoan?.id === emp.id
                              ? 'border-[#1F5C8B] bg-[#1F5C8B]/5'
                              : 'border-gray-200 hover:border-[#1F5C8B] hover:bg-[#1F5C8B]/5'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-[#1F5C8B] shrink-0" />
                            <span className="text-lg font-bold text-gray-900">
                              {emp.expand?.livro?.titulo || 'Livro não encontrado'}
                            </span>
                          </div>
                          <Badge
                            className={
                              emp.tipo_emprestimo === 'estudo'
                                ? 'bg-purple-100 text-purple-800 hover:bg-purple-100 shrink-0'
                                : 'bg-blue-100 text-blue-800 hover:bg-blue-100 shrink-0'
                            }
                          >
                            {emp.tipo_emprestimo === 'estudo' ? 'Estudo' : 'Comum'}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 ml-7 text-base text-gray-600">
                          <span>Cadastro: {emp.expand?.livro?.numero_cadastro || '—'}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Devolução: {formatDate(emp.data_prevista_devolucao)}
                          </span>
                          <span>
                            Renovações: {emp.quantidade_renovacoes}/
                            {config?.limite_renovacoes ?? '—'}
                          </span>
                        </div>
                        {isOverLimit && (
                          <p className="text-sm font-semibold text-red-600 mt-2 ml-7">
                            Limite de renovações atingido.
                          </p>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {selectedLoan && config && (
              <div className="bg-[#1F5C8B]/5 border-2 border-[#1F5C8B]/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">Confirmar Renovação</h3>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedLoan(null)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-base text-gray-700">
                  Livro: <span className="font-semibold">{selectedLoan.expand?.livro?.titulo}</span>
                </p>
                <p className="text-base text-gray-700">
                  Nova devolução:{' '}
                  <span className="font-semibold">
                    {formatDate(
                      calcNewReturnDate(selectedLoan.tipo_emprestimo, config.prazo_devolucao_dias),
                    )}
                  </span>
                </p>
                <Button
                  onClick={handleRenew}
                  disabled={renewing}
                  className="w-full h-14 text-lg font-bold bg-[#1F5C8B] hover:bg-[#174A73]"
                >
                  {renewing ? (
                    <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-6 h-6 mr-2" />
                  )}
                  Confirmar renovação
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
