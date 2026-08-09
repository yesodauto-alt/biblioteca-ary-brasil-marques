import { Settings } from 'lucide-react'
import { ModulePlaceholder } from '@/components/ModulePlaceholder'

export default function Configuracoes() {
  return (
    <ModulePlaceholder
      title="Configurações"
      description="Ajustes gerais do sistema."
      icon={Settings}
      message="O módulo de Configurações será configurado em breve."
    />
  )
}
