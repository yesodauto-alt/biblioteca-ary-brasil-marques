import { useState, useEffect } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { getConfiguracoes, updateConfiguracoes, type Configuracoes } from '@/services/configuracoes'
import { toast } from 'sonner'

export function LoanSettings() {
  const [config, setConfig] = useState<Configuracoes | null>(null)
  const [prazo, setPrazo] = useState('')
  const [limiteLivros, setLimiteLivros] = useState('')
  const [limiteRenovacoes, setLimiteRenovacoes] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getConfiguracoes()
      .then((c) => {
        setConfig(c)
        setPrazo(String(c?.prazo_devolucao_dias ?? 15))
        setLimiteLivros(String(c?.limite_livros_por_usuario ?? 3))
        setLimiteRenovacoes(String(c?.limite_renovacoes ?? 2))
      })
      .catch(() => toast.error('Erro ao carregar configurações.'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    if (!config) return
    const prazoNum = parseInt(prazo, 10)
    const livrosNum = parseInt(limiteLivros, 10)
    const renovNum = parseInt(limiteRenovacoes, 10)
    if (
      !prazoNum ||
      prazoNum < 1 ||
      !livrosNum ||
      livrosNum < 1 ||
      isNaN(renovNum) ||
      renovNum < 0
    ) {
      toast.error('Informe valores válidos.')
      return
    }
    setSaving(true)
    try {
      const updated = await updateConfiguracoes(config.id, {
        prazo_devolucao_dias: prazoNum,
        limite_livros_por_usuario: livrosNum,
        limite_renovacoes: renovNum,
      })
      setConfig(updated)
      toast.success('Configurações de empréstimo salvas com sucesso.')
    } catch {
      toast.error('Erro ao salvar configurações.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-xl">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6 max-w-xl">
      <div className="space-y-2">
        <label className="text-lg font-bold text-gray-800">Prazo de devolução (dias)</label>
        <p className="text-sm text-gray-500">
          Número de dias que o leitor tem para devolver o livro.
        </p>
        <Input
          type="number"
          value={prazo}
          onChange={(e) => setPrazo(e.target.value)}
          className="h-14 text-lg font-medium border-gray-300"
          min={1}
        />
      </div>

      <div className="space-y-2">
        <label className="text-lg font-bold text-gray-800">Máximo de livros simultâneos</label>
        <p className="text-sm text-gray-500">
          Quantidade máxima de livros que um usuário pode ter emprestados ao mesmo tempo.
        </p>
        <Input
          type="number"
          value={limiteLivros}
          onChange={(e) => setLimiteLivros(e.target.value)}
          className="h-14 text-lg font-medium border-gray-300"
          min={1}
        />
      </div>

      <div className="space-y-2">
        <label className="text-lg font-bold text-gray-800">Limite de renovações</label>
        <p className="text-sm text-gray-500">
          Número máximo de vezes que um empréstimo pode ser renovado.
        </p>
        <Input
          type="number"
          value={limiteRenovacoes}
          onChange={(e) => setLimiteRenovacoes(e.target.value)}
          className="h-14 text-lg font-medium border-gray-300"
          min={0}
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
        {saving ? 'Salvando...' : 'Salvar configurações'}
      </Button>
    </div>
  )
}
