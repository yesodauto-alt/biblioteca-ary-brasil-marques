import { useState, useEffect, useCallback } from 'react'
import { UserPlus, Pencil, Power, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { VolunteerForm } from '@/components/configuracoes/VolunteerForm'
import { getUsers, updateUser, type User } from '@/services/users'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from 'sonner'

export function VolunteerManagement() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      setUsers(await getUsers())
    } catch {
      toast.error('Erro ao carregar voluntários.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('users', () => {
    loadData()
  })

  const handleEdit = (u: User) => {
    setEditingUser(u)
    setFormOpen(true)
  }

  const handleNew = () => {
    setEditingUser(null)
    setFormOpen(true)
  }

  const handleToggleStatus = async (u: User) => {
    if (u.id === currentUser?.id) {
      toast.error('Você não pode inativar sua própria conta.')
      return
    }
    const newStatus = u.status === 'ativo' ? 'inativo' : 'ativo'
    setTogglingId(u.id)
    try {
      await updateUser(u.id, { status: newStatus })
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
        {users.map((u) => (
          <div
            key={u.id}
            className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between gap-4 flex-wrap"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-semibold text-gray-900">{u.name}</span>
                <Badge
                  className={
                    u.role === 'administrador'
                      ? 'bg-[#1F5C8B]/10 text-[#1F5C8B] hover:bg-[#1F5C8B]/10'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-200'
                  }
                >
                  {u.role === 'administrador' ? 'Administrador' : 'Voluntário'}
                </Badge>
                <Badge
                  className={
                    u.status === 'ativo'
                      ? 'bg-green-100 text-green-800 hover:bg-green-100'
                      : 'bg-red-100 text-red-800 hover:bg-red-100'
                  }
                >
                  {u.status === 'ativo' ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">{u.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => handleEdit(u)}
                className="h-12 px-4 text-base font-semibold border-gray-300"
              >
                <Pencil className="w-5 h-5 mr-1" />
                Editar
              </Button>
              <Button
                variant="outline"
                onClick={() => handleToggleStatus(u)}
                disabled={togglingId === u.id}
                className="h-12 px-4 text-base font-semibold border-gray-300"
              >
                {togglingId === u.id ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Power className="w-5 h-5 mr-1" />
                )}
                {u.status === 'ativo' ? 'Inativar' : 'Ativar'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <VolunteerForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editingUser={editingUser}
        onSaved={() => toast.success('Dados salvos com sucesso.')}
      />
    </div>
  )
}
