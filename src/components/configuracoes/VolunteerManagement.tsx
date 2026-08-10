import { useState, useEffect, useCallback } from 'react'
import { UserPlus, Pencil, Power, Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog'
import { VolunteerForm } from '@/components/configuracoes/VolunteerForm'
import {
  getVoluntarios,
  updateVoluntario,
  deleteVoluntario,
  type Voluntario,
} from '@/services/voluntarios'
import { hasActiveLoansByResponsavel } from '@/services/emprestimos'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from 'sonner'

export function VolunteerManagement() {
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingVoluntario, setEditingVoluntario] = useState<Voluntario | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [voluntarioToDelete, setVoluntarioToDelete] = useState<Voluntario | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDeleteClick = (v: Voluntario) => {
    setVoluntarioToDelete(v)
    setDeleteOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!voluntarioToDelete) return
    setDeleting(true)
    try {
      const hasActive = await hasActiveLoansByResponsavel(voluntarioToDelete.id)
      if (hasActive) {
        toast.error('Este voluntário é responsável por empréstimos ativos e não pode ser excluído.')
        setDeleteOpen(false)
        return
      }
      await deleteVoluntario(voluntarioToDelete.id)
      toast.success('Voluntário excluído com sucesso.')
      setDeleteOpen(false)
      setVoluntarioToDelete(null)
    } catch {
      toast.error('Erro ao excluir voluntário.')
    } finally {
      setDeleting(false)
    }
  }

  const loadData = useCallback(async () => {
    try {
      setVoluntarios(await getVoluntarios())
    } catch {
      toast.error('Erro ao carregar voluntários.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('voluntarios', () => {
    loadData()
  })

  const handleEdit = (v: Voluntario) => {
    setEditingVoluntario(v)
    setFormOpen(true)
  }

  const handleNew = () => {
    setEditingVoluntario(null)
    setFormOpen(true)
  }

  const handleToggleStatus = async (v: Voluntario) => {
    const newStatus = v.status === 'ativo' ? 'inativo' : 'ativo'
    setTogglingId(v.id)
    try {
      await updateVoluntario(v.id, { status: newStatus })
      toast.success(newStatus === 'ativo' ? 'Voluntário ativado.' : 'Voluntário inativado.')
    } catch {
      toast.error('Erro ao alterar status.')
    } finally {
      setTogglingId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-3 max-w-2xl">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <Button
        onClick={handleNew}
        className="h-12 px-6 text-base font-bold bg-[#1F5C8B] hover:bg-[#174A73]"
      >
        <UserPlus className="w-5 h-5 mr-2" />
        Novo voluntário
      </Button>

      <div className="space-y-2">
        {voluntarios.map((v) => (
          <div
            key={v.id}
            className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between gap-4 flex-wrap"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-[#1F5C8B]">{v.matricula || '—'}</span>
                <span className="text-base font-semibold text-gray-900">{v.nome}</span>
                <Badge
                  className={
                    v.status === 'ativo'
                      ? 'bg-green-100 text-green-800 hover:bg-green-100'
                      : 'bg-red-100 text-red-800 hover:bg-red-100'
                  }
                >
                  {v.status === 'ativo' ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => handleEdit(v)}
                className="h-12 px-4 text-base font-semibold border-gray-300"
              >
                <Pencil className="w-5 h-5 mr-1" />
                Editar
              </Button>
              <Button
                variant="outline"
                onClick={() => handleToggleStatus(v)}
                disabled={togglingId === v.id}
                className="h-12 px-4 text-base font-semibold border-gray-300"
              >
                {togglingId === v.id ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Power className="w-5 h-5 mr-1" />
                )}
                {v.status === 'ativo' ? 'Inativar' : 'Ativar'}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDeleteClick(v)}
                className="h-12 px-4 text-base font-semibold border-red-300 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-5 h-5 mr-1" />
                Excluir
              </Button>
            </div>
          </div>
        ))}
      </div>

      <VolunteerForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editingVoluntario={editingVoluntario}
        onSaved={(created) => {
          if (created?.matricula) {
            toast.success('Voluntário cadastrado com sucesso.', {
              description: `Matrícula: ${created.matricula}`,
            })
          } else {
            toast.success('Dados salvos com sucesso.')
          }
        }}
      />
      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
      />
    </div>
  )
}
