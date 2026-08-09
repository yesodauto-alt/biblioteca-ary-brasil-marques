import { BookOpen } from 'lucide-react'
import { ModulePlaceholder } from '@/components/ModulePlaceholder'

export default function Acervo() {
  return (
    <ModulePlaceholder
      title="Acervo"
      description="Cadastro e organização dos livros da biblioteca."
      icon={BookOpen}
      message="O módulo de Acervo será configurado em breve."
    />
  )
}
