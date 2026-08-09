import { CheckCircle2, XCircle, AlertTriangle, RotateCcw, FileCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface ImportResult {
  total: number
  imported: number
  ignored: number
  problems: number
}

export function ResultStep({ result, onReset }: { result: ImportResult; onReset: () => void }) {
  const cards = [
    {
      label: 'Total de registros encontrados',
      value: result.total,
      icon: FileCheck,
      color: 'text-gray-700',
      bg: 'bg-gray-50',
      border: 'border-gray-200',
    },
    {
      label: 'Registros importados',
      value: result.imported,
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
    },
    {
      label: 'Registros ignorados',
      value: result.ignored,
      icon: XCircle,
      color: 'text-gray-500',
      bg: 'bg-gray-50',
      border: 'border-gray-200',
    },
    {
      label: 'Registros com problema',
      value: result.problems,
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-9 h-9 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Importação concluída!</h2>
        <p className="text-base text-gray-500 mt-1">
          Os registros válidos foram criados com sucesso.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className={`${card.bg} ${card.border} border rounded-xl p-5 flex items-center gap-4`}
            >
              <div
                className={`w-12 h-12 rounded-full bg-white flex items-center justify-center ${card.color}`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
                <p className="text-sm font-medium text-gray-600">{card.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {result.problems > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4">
          <p className="text-sm text-amber-800">
            <strong>{result.problems}</strong> registro(s) não foram importados devido a problemas.
            Corrija os dados no arquivo e faça uma nova importação se necessário.
          </p>
        </div>
      )}

      <div className="flex justify-center">
        <Button
          onClick={onReset}
          className="h-12 px-8 text-base font-bold bg-[#1F5C8B] hover:bg-[#174A73]"
        >
          <RotateCcw className="w-5 h-5 mr-2" /> Nova importação
        </Button>
      </div>
    </div>
  )
}
