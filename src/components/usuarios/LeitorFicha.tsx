import { useEffect, useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { BookOpen, Calendar, Mail, MapPin, Phone, StickyNote, User } from 'lucide-react'
import { getLeitor, type Leitor } from '@/services/leitores'
import { getEmprestimosByLeitor, type Emprestimo } from '@/services/emprestimos'

interface LeitorFichaProps {
  leitorId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('pt-BR')
}

export function LeitorFicha({ leitorId, open, onOpenChange }: LeitorFichaProps) {
  const [leitor, setLeitor] = useState<Leitor | null>(null)
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!leitorId) {
      setLeitor(null)
      setEmprestimos([])
      return
    }
    setLoading(true)
    Promise.all([getLeitor(leitorId), getEmprestimosByLeitor(leitorId)])
      .then(([l, emps]) => {
        setLeitor(l)
        setEmprestimos(emps)
      })
      .finally(() => setLoading(false))
  }, [leitorId])

  const activeLoans = emprestimos.filter((e) => e.status === 'ativo')

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg max-h-[100vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">Ficha do Usuário</SheetTitle>
        </SheetHeader>

        {loading ? (
          <div className="space-y-4 mt-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        ) : leitor ? (
          <div className="mt-6 space-y-6">
            {/* Header info */}
            <div className="bg-[#1F5C8B]/5 rounded-xl p-4 border border-[#1F5C8B]/20">
              <h2 className="text-2xl font-bold text-gray-900 break-words">
                {leitor.nome_completo}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-base font-medium text-gray-600">
                  Nº {leitor.numero_cadastro}
                </span>
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
            </div>

            {/* Contact info */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#1F5C8B] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 font-medium">Telefone</p>
                  <p className="text-base font-semibold text-gray-900">{leitor.telefone}</p>
                </div>
              </div>

              {leitor.email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#1F5C8B] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 font-medium">E-mail</p>
                    <p className="text-base font-semibold text-gray-900 break-all">
                      {leitor.email}
                    </p>
                  </div>
                </div>
              )}

              {leitor.data_nascimento && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-[#1F5C8B] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Data de Nascimento</p>
                    <p className="text-base font-semibold text-gray-900">
                      {formatDate(leitor.data_nascimento)}
                    </p>
                  </div>
                </div>
              )}

              {leitor.endereco && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#1F5C8B] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Endereço</p>
                    <p className="text-base font-semibold text-gray-900">{leitor.endereco}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-[#1F5C8B] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 font-medium">Cadastrado em</p>
                  <p className="text-base font-semibold text-gray-900">
                    {formatDate(leitor.data_cadastro)}
                  </p>
                </div>
              </div>

              {leitor.observacoes && (
                <div className="flex items-start gap-3">
                  <StickyNote className="w-5 h-5 text-[#1F5C8B] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Observações</p>
                    <p className="text-base text-gray-900 whitespace-pre-wrap">
                      {leitor.observacoes}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Active loans */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#1F5C8B]" />
                Livros Atualmente Emprestados
              </h3>
              {activeLoans.length === 0 ? (
                <p className="text-base text-gray-500 italic">
                  Nenhum livro emprestado no momento.
                </p>
              ) : (
                <div className="space-y-2">
                  {activeLoans.map((emp) => (
                    <div key={emp.id} className="bg-white border border-gray-200 rounded-lg p-3">
                      <p className="text-base font-semibold text-gray-900">
                        {emp.expand?.livro?.titulo || 'Livro não encontrado'}
                      </p>
                      <p className="text-sm text-gray-500">{emp.expand?.livro?.autor || ''}</p>
                      <div className="flex gap-4 mt-1 text-sm text-gray-600">
                        <span>Empréstimo: {formatDate(emp.data_emprestimo)}</span>
                        <span>Devolução prevista: {formatDate(emp.data_prevista_devolucao)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Loan history */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Histórico de Empréstimos</h3>
              {emprestimos.length === 0 ? (
                <p className="text-base text-gray-500 italic">Nenhum empréstimo registrado.</p>
              ) : (
                <div className="space-y-2">
                  {emprestimos.map((emp) => (
                    <div key={emp.id} className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-base font-semibold text-gray-900">
                          {emp.expand?.livro?.titulo || 'Livro não encontrado'}
                        </p>
                        <Badge
                          className={
                            emp.status === 'ativo'
                              ? 'bg-blue-100 text-blue-800 hover:bg-blue-100 shrink-0'
                              : emp.status === 'atrasado'
                                ? 'bg-red-100 text-red-800 hover:bg-red-100 shrink-0'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-100 shrink-0'
                          }
                        >
                          {emp.status === 'ativo'
                            ? 'Ativo'
                            : emp.status === 'atrasado'
                              ? 'Atrasado'
                              : 'Devolvido'}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-600">
                        <span>Empréstimo: {formatDate(emp.data_emprestimo)}</span>
                        <span>Previsto: {formatDate(emp.data_prevista_devolucao)}</span>
                        {emp.data_devolucao_real && (
                          <span>Devolvido: {formatDate(emp.data_devolucao_real)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
