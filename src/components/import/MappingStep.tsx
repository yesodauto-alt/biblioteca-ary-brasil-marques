import { ArrowLeft, ArrowRight, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { IMPORT_CONFIGS } from '@/lib/import-utils'

interface MappingStepProps {
  importType: string
  headers: string[]
  mapping: Record<string, string>
  onMappingChange: (mapping: Record<string, string>) => void
  onBack: () => void
  onNext: () => void
}

export function MappingStep({
  importType,
  headers,
  mapping,
  onMappingChange,
  onBack,
  onNext,
}: MappingStepProps) {
  const config = IMPORT_CONFIGS[importType]

  const handleChange = (header: string, value: string) => {
    const next = { ...mapping }
    if (value === '__none__') {
      delete next[header]
    } else {
      next[header] = value
    }
    onMappingChange(next)
  }

  const mappedCount = Object.keys(mapping).length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Mapear colunas</h2>
        <p className="text-base text-gray-500 mt-1">
          Relacione cada coluna do arquivo a um campo do sistema. Campos com * são obrigatórios.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
        {headers.map((header) => (
          <div key={header} className="flex items-center gap-4 p-4">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <ArrowUpDown className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="font-medium text-gray-900 truncate">{header}</span>
            </div>
            <div className="w-64 shrink-0">
              <Select
                value={mapping[header] || '__none__'}
                onValueChange={(v) => handleChange(header, v)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Não importar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Não importar</SelectItem>
                  {config.fields.map((field) => (
                    <SelectItem key={field.name} value={field.name}>
                      {field.label}
                      {field.required ? ' *' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onBack} className="h-12 px-6 text-base font-semibold">
          <ArrowLeft className="w-5 h-5 mr-2" /> Voltar
        </Button>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{mappedCount} coluna(s) mapeada(s)</span>
          <Button
            onClick={onNext}
            className="h-12 px-6 text-base font-bold bg-[#1F5C8B] hover:bg-[#174A73]"
          >
            Validar <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
