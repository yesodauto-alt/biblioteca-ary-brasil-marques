import { ArrowLeftRight } from 'lucide-react'
import { ModulePlaceholder } from '@/components/ModulePlaceholder'

export default function Emprestimos() {
  return (
    <ModulePlaceholder
      title="Empréstimos"
      description="Controle dos empréstimos e devoluções de livros."
      icon={ArrowLeftRight}
      message="O módulo de Empréstimos será configurado em breve."
    />
  )
}
