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
  createVoluntario,
  updateVoluntario,
  type Voluntario,
  type VoluntarioStatus,
} from '@/services/voluntarios'
import { toast } from 'sonner'

interface VolunteerFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingVoluntario: Voluntario | null
  onSaved: (created?: Voluntario) => void
}

export function VolunteerForm({
  open,
  onOpenChange,
  editingVoluntario,
  onSaved,
}: VolunteerFormProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ nome: '', status: 'ativo' as VoluntarioStatus })

  useEffect(() => {
    if (open) {
      if (editingVoluntario) {
        setForm({ nome: editingVoluntario.nome, status: editingVoluntario.status })
      } else {
        setForm({ nome: '', status: 'ativo' })
      }
    }
  }, [open, editingVoluntario])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingVoluntario) {
        await updateVoluntario(editingVoluntario.id, {
          nome: form.nome.trim(),
          status: form.status,
        })
        onSaved()
        onOpenChange(false)
      } else {
        const created = await createVoluntario({ nome: form.nome.trim(), status: form.status })
        onSaved(created)
        onOpenChange(false)
      }
    } catch (error) {
      console.error('VolunteerForm submit error:', error)
      toast.error('Não foi possível salvar o voluntário. Verifique os dados e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {editingVoluntario ? 'Editar Voluntário' : 'Novo Voluntário'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {editingVoluntario
              ? 'Altere os dados do voluntário.'
              : 'Cadastre um novo voluntário no sistema.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {editingVoluntario?.matricula && (
            <div className="bg-[#1F5C8B]/5 border border-[#1F5C8B]/15 rounded-lg p-3 flex items-center gap-2">
              <BadgeCheck className="w-5 h-5 text-[#1F5C8B] shrink-0" />
              <div>
                <p className="text-sm text-gray-500 font-medium">Matrícula</p>
                <p className="text-base font-bold text-[#1F5C8B]">{editingVoluntario.matricula}</p>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Nome *</Label>
            <Input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className="h-12 text-base"
              required
            />
          </div>
          {editingVoluntario && (
            <div className="space-y-2">
              <Label className="text-base font-semibold">Status *</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v as VoluntarioStatus })}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
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
              {editingVoluntario ? 'Salvar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
