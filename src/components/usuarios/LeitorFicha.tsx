import { useEffect, useState, useCallback } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { BookOpen, Calendar, Mail, MapPin, Phone, StickyNote, User } from 'lucide-react'
import { getLeitor, deleteLeitor, type Leitor } from '@/services/leitores'
import {
  getEmprestimosByLeitor,
  hasActiveLoansByLeitor,
  type Emprestimo,
} from '@/services/emprestimos'
import { LeitorForm } from '@/components/usuarios/LeitorForm'
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRealtime } from '@/hooks/use-realtime'
import { cn } from '@/lib/utils'

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

function getSituacao(dataPrevista: string): string {
  if (!dataPrevista) return 'Em dia'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const previsto = new Date(dataPrevista + 'T00:00:00')
  previsto.setHours(0, 0, 0, 0)
  if (today < previsto) return 'Em dia'
  if (today.getTime() === previsto.getTime()) return 'Vence hoje'
  return 'Atrasado'
}

const SITUACAO_BADGE: Record<string, string> = {
  'Em dia': 'bg-green-100 text-green-800 hover:bg-green-100',
  'Vence hoje': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  Atrasado: 'bg-red-100 text-red-800 hover:bg-red-100',
}

const TIPO_LABELS: Record<string, string> = { comum: 'Comum', estudo: 'Estudo' }

export function LeitorFicha({ leitorId, open, onOpenChange }: LeitorFichaProps) {
  const [leitor, setLeitor] = useState<Leitor | null>(null)
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([])
  const [loading, setLoading] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!leitorId) return
    setDeleting(true)
    try {
      const hasActive = await hasActiveLoansByLeitor(leitorId)
      if (hasActive) {
        toast.error('Este usuário possui empréstimos ativos e não pode ser excluído.')
        setDeleteOpen(false)
        return
      }
      await deleteLeitor(leitorId)
      toast.success('Usuário excluído com sucesso.')
      setDeleteOpen(false)
      onOpenChange(false)
    } catch {
      toast.error('Erro ao excluir usuário.')
    } finally {
      setDeleting(false)
    }
  }

  const loadData = useCallback(() => {
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

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime(
    'emprestimos',
    () => {
      loadData()
    },
    open,
  )

  const activeLoans = emprestimos.filter((e) => e.status === 'ativo' && !e.data_devolucao_real)
  const comumCount = activeLoans.filter((e) => (e.tipo_emprestimo || 'comum') === 'comum').length
  const estudoCount = activeLoans.filter((e) => e.tipo_emprestimo === 'estudo').length

  return (
    <>
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
              <div className="bg-[#1F5C8B]/5 rounded-lg p-4 border border-[#1F5C8B]/15">
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

              <div className="flex gap-3">
                <Button
                  onClick={() => setEditOpen(true)}
                  className="flex-1 h-11 text-sm font-semibold bg-[#1F5C8B] hover:bg-[#174A73]"
                >
                  <Pencil className="w-4 h-4 mr-2" /> Editar usuário
                </Button>
                <Button
                  onClick={() => setDeleteOpen(true)}
                  variant="outline"
                  className="flex-1 h-11 text-sm font-semibold border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Excluir usuário
                </Button>
              </div>

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

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#1F5C8B]" />
                  Empréstimos ativos
                </h3>
                {activeLoans.length === 0 ? (
                  <p className="text-base text-gray-500 italic">
                    Nenhum livro emprestado no momento.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {activeLoans.map((emp) => {
                      const situacao = getSituacao(emp.data_prevista_devolucao)
                      const tipo = TIPO_LABELS[emp.tipo_emprestimo || 'comum'] || 'Comum'
                      return (
                        <div
                          key={emp.id}
                          className={cn(
                            'border rounded-lg p-4',
                            situacao === 'Atrasado'
                              ? 'bg-red-50/60 border-red-200'
                              : 'bg-white border-gray-200/80',
                          )}
                        >
                          <p className="text-lg font-bold text-gray-900">
                            {emp.expand?.livro?.titulo || 'Livro não encontrado'}
                          </p>
                          <div className="mt-1 space-y-1 text-base text-gray-700">
                            <p>
                              Livro nº{' '}
                              <span className="font-semibold">
                                {emp.expand?.livro?.numero_cadastro || '—'}
                              </span>
                            </p>
                            <p>
                              Tipo: <span className="font-semibold">{tipo}</span>
                            </p>
                            <p>Empréstimo: {formatDate(emp.data_emprestimo)}</p>
                            <p>Devolução: {formatDate(emp.data_prevista_devolucao)}</p>
                            <p className="flex items-center gap-2">
                              Situação:{' '}
                              <Badge className={SITUACAO_BADGE[situacao]}>{situacao}</Badge>
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Empréstimos atuais:</p>
                  <p className="text-base text-gray-600">Comum: {comumCount} de 1</p>
                  <p className="text-base text-gray-600">Estudo: {estudoCount} de 1</p>
                </div>
              </div>

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
      <LeitorForm
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={() => {
          loadData()
          toast.success('Dados atualizados com sucesso.')
        }}
        leitor={leitor}
      />
      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  )
}
