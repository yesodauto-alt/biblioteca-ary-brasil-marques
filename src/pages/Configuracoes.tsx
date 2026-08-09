import { useState, useEffect } from 'react'
import { Settings, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getConfiguracoes,
  updateConfiguracoes,
  type Configuracoes as ConfigType,
} from '@/services/configuracoes'
import { toast } from 'sonner'

export default function Configuracoes() {
  const [config, setConfig] = useState<ConfigType | null>(null)
  const [prazo, setPrazo] = useState('')
  const [limite, setLimite] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getConfiguracoes()
      .then((c) => {
        setConfig(c)
        setPrazo(String(c?.prazo_devolucao_dias ?? 15))
        setLimite(String(c?.limite_renovacoes ?? 2))
      })
      .catch(() => toast.error('Erro ao carregar configurações.'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    if (!config) return
    const prazoNum = parseInt(prazo, 10)
    const limiteNum = parseInt(limite, 10)
    if (!prazoNum || prazoNum < 1 || isNaN(limiteNum) || limiteNum < 0) {
      toast.error('Informe valores válidos.')
      return
    }
    setSaving(true)
    try {
      const updated = await updateConfiguracoes(config.id, {
        prazo_devolucao_dias: prazoNum,
        limite_renovacoes: limiteNum,
      })
      setConfig(updated)
      toast.success('Configurações salvas com sucesso.')
    } catch {
      toast.error('Erro ao salvar configurações.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#1F5C8B] flex items-center justify-center text-white shrink-0">
          <Settings className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configurações</h2>
          <p className="text-base text-gray-500">Ajustes gerais do sistema</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 max-w-xl">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : (
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
            <label className="text-lg font-bold text-gray-800">Limite de renovações</label>
            <p className="text-sm text-gray-500">
              Número máximo de vezes que um empréstimo pode ser renovado.
            </p>
            <Input
              type="number"
              value={limite}
              onChange={(e) => setLimite(e.target.value)}
              className="h-14 text-lg font-medium border-gray-300"
              min={0}
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-14 text-lg font-bold bg-[#1F5C8B] hover:bg-[#174A73]"
          >
            <Save className="w-6 h-6 mr-2" />
            {saving ? 'Salvando...' : 'Salvar configurações'}
          </Button>
        </div>
      )}
    </div>
  )
}
