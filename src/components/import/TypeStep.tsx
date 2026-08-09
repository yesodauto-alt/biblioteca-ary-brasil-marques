import { Users, BookOpen } from 'lucide-react'
import { IMPORT_CONFIGS } from '@/lib/import-utils'

export function TypeStep({ onSelect }: { onSelect: (type: string) => void }) {
  const types = Object.entries(IMPORT_CONFIGS)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">O que deseja importar?</h2>
        <p className="text-base text-gray-500 mt-1">
          Selecione o tipo de registro para importação em lote.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {types.map(([key, config]) => {
          const Icon = key === 'leitores' ? Users : BookOpen
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className="flex flex-col items-center gap-4 p-8 bg-white border-2 border-gray-200 rounded-xl hover:border-[#1F5C8B] hover:bg-[#1F5C8B]/5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1F5C8B]"
            >
              <div className="w-16 h-16 rounded-full bg-[#1F5C8B]/10 flex items-center justify-center">
                <Icon className="w-8 h-8 text-[#1F5C8B]" />
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">{config.label}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {key === 'leitores' ? 'Leitores da biblioteca' : 'Livros do acervo'}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
