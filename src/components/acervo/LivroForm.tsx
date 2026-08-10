import { useState, useEffect } from 'react'
import { BookPlus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { createLivro, updateLivro, type LivroFormData, type Livro } from '@/services/livros'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'

interface LivroFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
  livro?: Livro | null
}

export function LivroForm({ open, onOpenChange, onSaved, livro }: LivroFormProps) {
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [form, setForm] = useState<LivroFormData>({
    numero_cadastro: '',
    titulo: '',
    autor: '',
    editora: '',
    categoria: '',
    localizacao_fisica: '',
    observacoes: '',
  })

  useEffect(() => {
    if (open) {
      if (livro) {
        setForm({
          numero_cadastro: livro.numero_cadastro,
          titulo: livro.titulo,
          autor: livro.autor,
          editora: livro.editora,
          categoria: livro.categoria || '',
          localizacao_fisica: livro.localizacao_fisica || '',
          observacoes: livro.observacoes || '',
        })
      } else {
        setForm({
          numero_cadastro: '',
          titulo: '',
          autor: '',
          editora: '',
          categoria: '',
          localizacao_fisica: '',
          observacoes: '',
        })
      }
      setFieldErrors({})
    }
  }, [open, livro])

  const handleFieldChange = (field: keyof LivroFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setFieldErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setFieldErrors({})
    try {
      const data: LivroFormData = {
        numero_cadastro: form.numero_cadastro.trim(),
        titulo: form.titulo.trim(),
        autor: form.autor.trim(),
        editora: form.editora.trim(),
      }
      if (form.categoria?.trim()) data.categoria = form.categoria.trim()
      if (form.localizacao_fisica?.trim()) data.localizacao_fisica = form.localizacao_fisica.trim()
      if (form.observacoes?.trim()) data.observacoes = form.observacoes.trim()

      if (livro) {
        await updateLivro(livro.id, data)
      } else {
        await createLivro(data)
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {livro ? 'Editar Livro' : 'Novo Livro'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {livro
              ? 'Edite os dados do livro no acervo.'
              : 'Cadastre um novo livro no acervo da biblioteca.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="numero_cadastro" className="text-base font-semibold">
              Número de Cadastro *
            </Label>
            <Input
              id="numero_cadastro"
              value={form.numero_cadastro}
              onChange={(e) => handleFieldChange('numero_cadastro', e.target.value)}
              className="h-12 text-base"
              placeholder="Ex: 0001"
              required
            />
            {fieldErrors.numero_cadastro && (
              <p className="text-sm text-red-500 font-medium">{fieldErrors.numero_cadastro}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="titulo" className="text-base font-semibold">
              Título *
            </Label>
            <Input
              id="titulo"
              value={form.titulo}
              onChange={(e) => handleFieldChange('titulo', e.target.value)}
              className="h-12 text-base"
              placeholder="Título do livro"
              required
            />
            {fieldErrors.titulo && (
              <p className="text-sm text-red-500 font-medium">{fieldErrors.titulo}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="autor" className="text-base font-semibold">
              Autor *
            </Label>
            <Input
              id="autor"
              value={form.autor}
              onChange={(e) => handleFieldChange('autor', e.target.value)}
              className="h-12 text-base"
              placeholder="Nome do autor"
              required
            />
            {fieldErrors.autor && (
              <p className="text-sm text-red-500 font-medium">{fieldErrors.autor}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="editora" className="text-base font-semibold">
              Editora *
            </Label>
            <Input
              id="editora"
              value={form.editora}
              onChange={(e) => handleFieldChange('editora', e.target.value)}
              className="h-12 text-base"
              placeholder="Nome da editora"
              required
            />
            {fieldErrors.editora && (
              <p className="text-sm text-red-500 font-medium">{fieldErrors.editora}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria" className="text-base font-semibold">
              Categoria (opcional)
            </Label>
            <Input
              id="categoria"
              value={form.categoria}
              onChange={(e) => handleFieldChange('categoria', e.target.value)}
              className="h-12 text-base"
              placeholder="Ex: Romance, Espiritismo, Infantil..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="localizacao_fisica" className="text-base font-semibold">
              Localização Física (opcional)
            </Label>
            <Input
              id="localizacao_fisica"
              value={form.localizacao_fisica}
              onChange={(e) => handleFieldChange('localizacao_fisica', e.target.value)}
              className="h-12 text-base"
              placeholder="Ex: Estante A, Prateleira 3"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes" className="text-base font-semibold">
              Observações (opcional)
            </Label>
            <Textarea
              id="observacoes"
              value={form.observacoes}
              onChange={(e) => handleFieldChange('observacoes', e.target.value)}
              className="text-base min-h-[80px]"
              placeholder="Anotações sobre o livro"
            />
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
                <BookPlus className="w-5 h-5 mr-2" />
              )}
              {livro ? 'Salvar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
