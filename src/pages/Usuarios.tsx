import { Users } from 'lucide-react'
import { ModulePlaceholder } from '@/components/ModulePlaceholder'

export default function Usuarios() {
  return (
    <ModulePlaceholder
      title="Usuários"
      description="Cadastro e acompanhamento dos leitores da biblioteca."
      icon={Users}
      message="O módulo de Usuários será configurado em breve."
    />
  )
}
