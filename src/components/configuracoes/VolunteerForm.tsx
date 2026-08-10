import { useState, useEffect } from 'react'
import { Loader2, UserPlus, BadgeCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'
import {
  createUser,
  updateUser,
  type User,
  type UserRole,
  type CreateUserData,
  type UpdateUserData,
} from '@/services/users'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import { toast } from 'sonner'

interface VolunteerFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingUser: User | null
  onSaved: (created?: User) => void
}

export function VolunteerForm({ open, onOpenChange, editingUser, onSaved }: VolunteerFormProps) {
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [form, setForm] = useState<CreateUserData>({
    name: '',
    email: '',
    password: '',
    role: 'voluntário',
  })

  useEffect(() => {
    if (open) {
      setFieldErrors({})
      if (editingUser) {
        setForm({
          name: editingUser.name,
          email: editingUser.email,
          password: '',
          role: editingUser.role,
        })
      } else {
        setForm({ name: '', email: '', password: '', role: 'voluntário' })
      }
    }
  }, [open, editingUser])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setFieldErrors({})
    try {
      if (editingUser) {
        const data: UpdateUserData = {
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
        }
        if (form.password) {
          data.password = form.password
        }
        await updateUser(editingUser.id, data)
        onSaved()
      } else {
        const created = await createUser({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
        })
        onSaved(created)
        toast.success('Voluntário cadastrado com sucesso.', {
          description: created?.matricula ? `Matrícula: ${created.matricula}` : undefined,
        })
      }
      onOpenChange(false)
    } catch (error) {
      console.error('VolunteerForm submit error:', error)
      setFieldErrors({})
      toast.error(
        editingUser
          ? 'Não foi possível atualizar o voluntário. Verifique os dados e tente novamente.'
          : 'Não foi possível cadastrar o voluntário. Verifique os dados e tente novamente.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {editingUser ? 'Editar Voluntário' : 'Novo Voluntário'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {editingUser
              ? 'Altere os dados do voluntário.'
              : 'Cadastre um novo voluntário no sistema.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {editingUser?.matricula && (
            <div className="bg-[#1F5C8B]/5 border border-[#1F5C8B]/15 rounded-lg p-3 flex items-center gap-2">
              <BadgeCheck className="w-5 h-5 text-[#1F5C8B] shrink-0" />
              <div>
                <p className="text-sm text-gray-500 font-medium">Matrícula</p>
                <p className="text-base font-bold text-[#1F5C8B]">{editingUser.matricula}</p>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Nome *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="h-12 text-base"
              required
            />
            {fieldErrors.name && <p className="text-sm text-red-500">{fieldErrors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-base font-semibold">E-mail *</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="h-12 text-base"
              required
            />
            {fieldErrors.email && <p className="text-sm text-red-500">{fieldErrors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-base font-semibold">
              Senha {editingUser ? '(deixe em branco para manter)' : '*'}
            </Label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="h-12 text-base"
              placeholder={editingUser ? '••••••••' : 'Mínimo 8 caracteres'}
              required={!editingUser}
            />
            {fieldErrors.password && <p className="text-sm text-red-500">{fieldErrors.password}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-base font-semibold">Perfil *</Label>
            <Select
              value={form.role}
              onValueChange={(v) => setForm({ ...form, role: v as UserRole })}
            >
              <SelectTrigger className="h-12 text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="voluntário">Voluntário</SelectItem>
                <SelectItem value="administrador">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-12 text-base font-semibold"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 h-12 text-base font-bold bg-[#1F5C8B] hover:bg-[#174A73]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <UserPlus className="w-5 h-5 mr-2" />
              )}
              {editingUser ? 'Salvar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
