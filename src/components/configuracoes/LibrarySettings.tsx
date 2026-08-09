import { useState, useEffect } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { getConfiguracoes, updateConfiguracoes, type Configuracoes } from '@/services/configuracoes'
import { toast } from 'sonner'

export function LibrarySettings() {
  const [config, setConfig] = useState<Configuracoes | null>(null)
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getConfiguracoes()
      .then((c) => {
        setConfig(c)
        setNome(c?.nome_biblioteca ?? '')
        setTelefone(c?.telefone ?? '')
        setEmail(c?.email ?? '')
        setInfo(c?.informacoes_institucionais ?? '')
      })
      .catch(() => toast.error('Erro ao carregar dados.'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    if (!config) return
    if (!nome.trim()) {
      toast.error('O nome da biblioteca é obrigatório.')
      return
    }
    setSaving(true)
    try {
      const updated = await updateConfiguracoes(config.id, {
        nome_biblioteca: nome.trim(),
        telefone: telefone.trim(),
        email: email.trim(),
        informacoes_institucionais: info.trim(),
      })
      setConfig(updated)
      toast.success('Dados da biblioteca salvos com sucesso.')
    } catch {
      toast.error('Erro ao salvar dados.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-xl">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6 max-w-xl">
      <div className="space-y-2">
        <Label className="text-lg font-bold text-gray-800">Nome da biblioteca *</Label>
        <Input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="h-14 text-lg font-medium border-gray-300"
          placeholder="Ex: Biblioteca do Centro Espírita"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-lg font-bold text-gray-800">Telefone (opcional)</Label>
        <Input
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          className="h-14 text-lg font-medium border-gray-300"
          placeholder="(11) 99999-9999"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-lg font-bold text-gray-800">E-mail (opcional)</Label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-14 text-lg font-medium border-gray-300"
          placeholder="contato@biblioteca.org"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-lg font-bold text-gray-800">
          Informações institucionais (opcional)
        </Label>
        <Textarea
          value={info}
          onChange={(e) => setInfo(e.target.value)}
          className="text-base min-h-[100px] border-gray-300"
          placeholder="Endereço, horários de funcionamento, etc."
        />
      </div>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full h-14 text-lg font-bold bg-[#1F5C8B] hover:bg-[#174A73]"
      >
        {saving ? (
          <Loader2 className="w-6 h-6 mr-2 animate-spin" />
        ) : (
          <Save className="w-6 h-6 mr-2" />
        )}
        {saving ? 'Salvando...' : 'Salvar dados'}
      </Button>
    </div>
  )
}
