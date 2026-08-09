import { useRef, useState } from 'react'
import { Upload, FileText, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { parseCSV } from '@/lib/csv'
import { IMPORT_CONFIGS } from '@/lib/import-utils'

interface FileStepProps {
  importType: string
  fileName: string
  headers: string[]
  rows: string[][]
  onFileSelect: (name: string, headers: string[], rows: string[][]) => void
  onBack: () => void
  onNext: () => void
}

export function FileStep({
  importType,
  fileName,
  headers,
  rows,
  onFileSelect,
  onBack,
  onNext,
}: FileStepProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const config = IMPORT_CONFIGS[importType]

  const handleFile = (file: File) => {
    setError('')
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      setError('Formato Excel não suportado. Exporte o arquivo como CSV e tente novamente.')
      return
    }
    if (!file.name.endsWith('.csv')) {
      setError('Apenas arquivos CSV são aceitos.')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const parsed = parseCSV(text)
      if (parsed.headers.length === 0 || parsed.rows.length === 0) {
        setError('Arquivo vazio ou sem dados válidos.')
        return
      }
      onFileSelect(file.name, parsed.headers, parsed.rows)
    }
    reader.onerror = () => setError('Erro ao ler o arquivo.')
    reader.readAsText(file, 'UTF-8')
  }

  const previewRows = rows.slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Selecionar arquivo — {config.label}</h2>
        <p className="text-base text-gray-500 mt-1">Envie um arquivo CSV com os registros.</p>
      </div>

      {!fileName ? (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-300 rounded-xl p-12 flex flex-col items-center gap-4 hover:border-[#1F5C8B] hover:bg-[#1F5C8B]/5 transition-colors"
        >
          <Upload className="w-12 h-12 text-gray-400" />
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-700">
              Clique para selecionar um arquivo CSV
            </p>
            <p className="text-sm text-gray-500 mt-1">Ou arraste e solte o arquivo aqui</p>
          </div>
        </button>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-4">
            <FileText className="w-6 h-6 text-[#1F5C8B]" />
            <span className="font-semibold text-gray-900 flex-1">{fileName}</span>
            <Button variant="outline" onClick={() => inputRef.current?.click()} className="h-12">
              Trocar arquivo
            </Button>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">
              Pré-visualização ({rows.length} registros encontrados)
            </p>
            <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {headers.map((h, i) => (
                      <th
                        key={i}
                        className="px-3 py-2 text-left font-semibold text-gray-600 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      {headers.map((_, j) => (
                        <td key={j} className="px-3 py-2 text-gray-700 whitespace-nowrap">
                          {row[j] || '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rows.length > 5 && (
              <p className="text-xs text-gray-500 mt-1">Mostrando 5 de {rows.length} registros</p>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="h-12 px-6 text-base font-semibold">
          <ArrowLeft className="w-5 h-5 mr-2" /> Voltar
        </Button>
        <Button
          onClick={onNext}
          disabled={!fileName}
          className="h-12 px-6 text-base font-bold bg-[#1F5C8B] hover:bg-[#174A73]"
        >
          Continuar <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  )
}
