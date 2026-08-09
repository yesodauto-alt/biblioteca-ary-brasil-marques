import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  { key: 'type', label: 'Tipo' },
  { key: 'file', label: 'Arquivo' },
  { key: 'mapping', label: 'Mapeamento' },
  { key: 'validation', label: 'Validação' },
  { key: 'result', label: 'Resultado' },
]

export function ImportStepper({ currentStep }: { currentStep: string }) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep)

  return (
    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
      {STEPS.map((step, i) => (
        <div key={step.key} className="flex items-center gap-2">
          <div
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-full text-base font-semibold whitespace-nowrap transition-colors',
              i < currentIndex && 'bg-green-100 text-green-700',
              i === currentIndex && 'bg-[#1F5C8B] text-white',
              i > currentIndex && 'bg-gray-100 text-gray-500',
            )}
          >
            {i < currentIndex ? (
              <Check className="w-4 h-4" />
            ) : (
              <span className="w-4 h-4 flex items-center justify-center">{i + 1}</span>
            )}
            {step.label}
          </div>
          {i < STEPS.length - 1 && <div className="w-4 h-px bg-gray-300 shrink-0" />}
        </div>
      ))}
    </div>
  )
}
