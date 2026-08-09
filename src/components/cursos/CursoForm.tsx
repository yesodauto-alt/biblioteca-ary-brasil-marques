import { useState } from 'react'
import { GraduationCap, Loader2 } from 'lucide-react'
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
import { createCurso, type CursoFormData } from '@/services/cursos'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'

interface CursoFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}

export function CursoForm({ open, onOpenChange, onCreated }: CursoFormProps) {
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [form, setForm] = useState<CursoFormData>({
    nome: '',
    ano_nivel_etapa: '',
  })

  const handleFieldChange = (field: keyof CursoFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setFieldErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setFieldErrors({})
    try {
      const data: CursoFormData = {
        nome: form.nome.trim(),
      }
      if (form.ano_nivel_etapa?.trim()) data.ano_nivel_etapa = form.ano_nivel_etapa.trim()

      await createCurso(data)
      onCreated()
      onOpenChange(false)
      setForm({ nome: '', ano_nivel_etapa: '' })
    } catch (error) {
      setFieldErrors(extractFieldErrors(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Novo Curso</DialogTitle>
          <DialogDescription className="text-base">
            Cadastre um novo curso de estudo da casa.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-base font-semibold">
              Nome do curso *
            </Label>
            <Input
              id="nome"
              value={form.nome}
              onChange={(e) => handleFieldChange('nome', e.target.value)}
              className="h-12 text-base"
              placeholder="Ex: ESDE, Curso Mediúnico..."
              required
            />
            {fieldErrors.nome && (
              <p className="text-sm text-red-500 font-medium">{fieldErrors.nome}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ano_nivel_etapa" className="text-base font-semibold">
              Ano, nível ou etapa (opcional)
            </Label>
            <Input
              id="ano_nivel_etapa"
              value={form.ano_nivel_etapa}
              onChange={(e) => handleFieldChange('ano_nivel_etapa', e.target.value)}
              className="h-12 text-base"
              placeholder="Ex: 1º Ano, 2º Ano..."
            />
            {fieldErrors.ano_nivel_etapa && (
              <p className="text-sm text-red-500 font-medium">{fieldErrors.ano_nivel_etapa}</p>
            )}
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
                <GraduationCap className="w-5 h-5 mr-2" />
              )}
              Cadastrar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
