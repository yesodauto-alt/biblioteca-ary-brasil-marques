import { useState, useEffect } from 'react'
import { UserPlus, Loader2 } from 'lucide-react'
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
import { createLeitor, updateLeitor, type LeitorFormData, type Leitor } from '@/services/leitores'
import { toast } from 'sonner'

interface LeitorFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: (leitor?: Leitor) => void
  leitor?: Leitor | null
}

export function LeitorForm({ open, onOpenChange, onSaved, leitor }: LeitorFormProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nome_completo: '',
    telefone: '',
    email: '',
    data_nascimento: '',
    endereco: '',
    observacoes: '',
  })

  useEffect(() => {
    if (open) {
      if (leitor) {
        setForm({
          nome_completo: leitor.nome_completo,
          telefone: leitor.telefone,
          email: leitor.email || '',
          data_nascimento: leitor.data_nascimento || '',
          endereco: leitor.endereco || '',
          observacoes: leitor.observacoes || '',
        })
      } else {
        setForm({
          nome_completo: '',
          telefone: '',
          email: '',
          data_nascimento: '',
          endereco: '',
          observacoes: '',
        })
      }
    }
  }, [open, leitor])

  const handleFieldChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data: LeitorFormData = {
        nome_completo: form.nome_completo.trim(),
        telefone: form.telefone.trim(),
      }
      if (form.email?.trim()) data.email = form.email.trim()
      if (form.data_nascimento) data.data_nascimento = form.data_nascimento
      if (form.endereco?.trim()) data.endereco = form.endereco.trim()
      if (form.observacoes?.trim()) data.observacoes = form.observacoes.trim()

      if (leitor) {
        await updateLeitor(leitor.id, data)
        onSaved()
      } else {
        const created = await createLeitor(data)
        onSaved(created)
      }
      onOpenChange(false)
    } catch (error) {
      console.error('LeitorForm submit error:', error)
      toast.error(
        leitor
          ? 'Não foi possível atualizar o usuário. Verifique os dados e tente novamente.'
          : 'Não foi possível cadastrar o usuário. Verifique os dados e tente novamente.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {leitor ? 'Editar Usuário' : 'Novo Usuário'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {leitor ? 'Edite os dados do leitor.' : 'Cadastre um novo leitor da biblioteca.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-sm text-gray-500 font-medium">Número de cadastro</p>
            <p className="text-base font-bold text-gray-900">
              {leitor?.numero_cadastro || 'Gerado automaticamente'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nome_completo" className="text-base font-semibold">
              Nome Completo *
            </Label>
            <Input
              id="nome_completo"
              value={form.nome_completo}
              onChange={(e) => handleFieldChange('nome_completo', e.target.value)}
              className="h-12 text-base"
              placeholder="Nome do leitor"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone" className="text-base font-semibold">
              Telefone *
            </Label>
            <Input
              id="telefone"
              value={form.telefone}
              onChange={(e) => handleFieldChange('telefone', e.target.value)}
              className="h-12 text-base"
              placeholder="(11) 99999-9999"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-base font-semibold">
              E-mail (opcional)
            </Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              className="h-12 text-base"
              placeholder="email@exemplo.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="data_nascimento" className="text-base font-semibold">
              Data de Nascimento (opcional)
            </Label>
            <Input
              id="data_nascimento"
              type="date"
              value={form.data_nascimento}
              onChange={(e) => handleFieldChange('data_nascimento', e.target.value)}
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco" className="text-base font-semibold">
              Endereço (opcional)
            </Label>
            <Input
              id="endereco"
              value={form.endereco}
              onChange={(e) => handleFieldChange('endereco', e.target.value)}
              className="h-12 text-base"
              placeholder="Rua, número, bairro..."
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
              placeholder="Anotações sobre o leitor"
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
                <UserPlus className="w-5 h-5 mr-2" />
              )}
              {leitor ? 'Salvar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
