import { useState, useEffect } from 'react'
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
import { createCurso, updateCurso, type CursoFormData, type Curso } from '@/services/cursos'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'

interface CursoFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
  curso?: Curso | null
}

export function CursoForm({ open, onOpenChange, onSaved, curso }: CursoFormProps) {
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [form, setForm] = useState<CursoFormData>({
    nome: '',
    ano_nivel_etapa: '',
    tempo_emprestimo_dias: 90,
  })

  useEffect(() => {
    if (open) {
      if (curso) {
        setForm({
          nome: curso.nome,
          ano_nivel_etapa: curso.ano_nivel_etapa || '',
          tempo_emprestimo_dias: curso.tempo_emprestimo_dias || 90,
        })
      } else {
        setForm({ nome: '', ano_nivel_etapa: '', tempo_emprestimo_dias: 90 })
      }
      setFieldErrors({})
    }
  }, [open, curso])

  const handleFieldChange = (field: keyof CursoFormData, value: string | number) => {
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
        tempo_emprestimo_dias: Number(form.tempo_emprestimo_dias) || 90,
      }
      if (form.ano_nivel_etapa?.trim()) data.ano_nivel_etapa = form.ano_nivel_etapa.trim()

      if (curso) {
        await updateCurso(curso.id, data)
      } else {
        await createCurso(data)
      }
      onSaved()
      onOpenChange(false)
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
          <DialogTitle className="text-xl font-bold">
            {curso ? 'Editar Curso' : 'Novo Curso'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {curso
              ? 'Edite as informações do curso de estudo.'
              : 'Cadastre um novo curso de estudo da casa.'}
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
              placeholder="Ex: ESDE — 1º Ano, Curso Mediúnico..."
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

          <div className="space-y-2">
            <Label htmlFor="tempo_emprestimo_dias" className="text-base font-semibold">
              Tempo de empréstimo (dias) *
            </Label>
            <Input
              id="tempo_emprestimo_dias"
              type="number"
              min={1}
              value={form.tempo_emprestimo_dias}
              onChange={(e) => handleFieldChange('tempo_emprestimo_dias', e.target.value)}
              className="h-12 text-base"
            />
            <p className="text-sm text-gray-500">
              Padrão: 90 dias para livros de estudo vinculados a este curso.
            </p>
            {fieldErrors.tempo_emprestimo_dias && (
              <p className="text-sm text-red-500 font-medium">
                {fieldErrors.tempo_emprestimo_dias}
              </p>
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
              {curso ? 'Salvar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
