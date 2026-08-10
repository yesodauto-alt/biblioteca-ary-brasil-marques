export interface ImportFieldConfig {
  name: string
  label: string
  required: boolean
  type: 'text' | 'email' | 'date' | 'select'
  options?: string[]
}

export interface ImportConfig {
  label: string
  collection: string
  fields: ImportFieldConfig[]
}

export const IMPORT_CONFIGS: Record<string, ImportConfig> = {
  leitores: {
    label: 'Usuários',
    collection: 'leitores',
    fields: [
      { name: 'numero_cadastro', label: 'Número de Cadastro', required: true, type: 'text' },
      { name: 'nome_completo', label: 'Nome Completo', required: true, type: 'text' },
      { name: 'telefone', label: 'Telefone', required: true, type: 'text' },
      { name: 'email', label: 'E-mail', required: false, type: 'email' },
      { name: 'data_nascimento', label: 'Data de Nascimento', required: false, type: 'date' },
      { name: 'endereco', label: 'Endereço', required: false, type: 'text' },
      { name: 'data_cadastro', label: 'Data de Cadastro', required: false, type: 'date' },
      {
        name: 'status',
        label: 'Status',
        required: false,
        type: 'select',
        options: ['ativo', 'inativo'],
      },
      { name: 'observacoes', label: 'Observações', required: false, type: 'text' },
    ],
  },
  livros: {
    label: 'Livros',
    collection: 'livros',
    fields: [
      { name: 'numero_cadastro', label: 'Número de Cadastro', required: true, type: 'text' },
      { name: 'titulo', label: 'Título', required: true, type: 'text' },
      { name: 'autor', label: 'Autor', required: true, type: 'text' },
      { name: 'editora', label: 'Editora', required: true, type: 'text' },
      { name: 'categoria', label: 'Categoria', required: false, type: 'text' },
      { name: 'cod', label: 'COD', required: false, type: 'text' },
      { name: 'descricao', label: 'Descrição', required: false, type: 'text' },
      { name: 'cutter', label: 'CUTTER', required: false, type: 'text' },
      { name: 'observacoes', label: 'Observações', required: false, type: 'text' },
      {
        name: 'status',
        label: 'Status',
        required: false,
        type: 'select',
        options: ['disponível', 'emprestado', 'manutenção', 'extraviado', 'baixado'],
      },
    ],
  },
}

export interface MappedRecord {
  rowIndex: number
  data: Record<string, string>
}

export interface ValidationIssue {
  field: string
  message: string
}

export interface ValidationResult {
  valid: MappedRecord[]
  problems: { record: MappedRecord; issues: ValidationIssue[] }[]
}

export function autoMapColumns(headers: string[], importType: string): Record<string, string> {
  const config = IMPORT_CONFIGS[importType]
  if (!config) return {}
  const mapping: Record<string, string> = {}
  for (const header of headers) {
    const norm = header.toLowerCase().trim()
    const field = config.fields.find(
      (f) =>
        f.name === norm ||
        f.label.toLowerCase() === norm ||
        f.name.replace(/_/g, ' ') === norm ||
        f.name.replace(/_/g, '') === norm.replace(/\s/g, ''),
    )
    if (field) mapping[header] = field.name
  }
  return mapping
}

export function mapRecords(
  headers: string[],
  rows: string[][],
  mapping: Record<string, string>,
): MappedRecord[] {
  return rows.map((row, index) => {
    const data: Record<string, string> = {}
    headers.forEach((header, i) => {
      const target = mapping[header]
      if (target) data[target] = (row[i] || '').trim()
    })
    return { rowIndex: index + 2, data }
  })
}

function normalizeDate(value: string): string {
  const m = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (m) return `${m[3]}-${m[2]}-${m[1]}`
  return value
}

export function validateRecords(
  records: MappedRecord[],
  importType: string,
  existing: Set<string>,
): ValidationResult {
  const config = IMPORT_CONFIGS[importType]
  const valid: MappedRecord[] = []
  const problems: { record: MappedRecord; issues: ValidationIssue[] }[] = []
  const seen = new Set<string>()

  for (const record of records) {
    const issues: ValidationIssue[] = []

    for (const field of config.fields) {
      if (!field.required) continue
      const val = record.data[field.name]
      if (!val || val.trim() === '') {
        issues.push({ field: field.name, message: `${field.label} é obrigatório` })
      }
    }

    const num = record.data.numero_cadastro
    if (num) {
      if (seen.has(num)) {
        issues.push({ field: 'numero_cadastro', message: 'Duplicado no arquivo' })
      } else {
        seen.add(num)
      }
      if (existing.has(num)) {
        issues.push({ field: 'numero_cadastro', message: 'Já cadastrado no sistema' })
      }
    }

    for (const field of config.fields) {
      const val = record.data[field.name]
      if (!val || val.trim() === '') continue
      if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        issues.push({ field: field.name, message: 'E-mail inválido' })
      } else if (
        field.type === 'date' &&
        !/^\d{4}-\d{2}-\d{2}$/.test(val) &&
        !/^\d{2}\/\d{2}\/\d{4}$/.test(val)
      ) {
        issues.push({ field: field.name, message: 'Data inválida (use DD/MM/AAAA)' })
      } else if (field.type === 'select' && field.options && !field.options.includes(val)) {
        issues.push({ field: field.name, message: `Use: ${field.options.join(', ')}` })
      }
    }

    if (issues.length > 0) problems.push({ record, issues })
    else valid.push(record)
  }

  return { valid, problems }
}

export function normalizeRecord(record: MappedRecord, importType: string): Record<string, string> {
  const config = IMPORT_CONFIGS[importType]
  const data: Record<string, string> = {}
  for (const field of config.fields) {
    const val = record.data[field.name]
    if (val !== undefined && val !== '') {
      data[field.name] = field.type === 'date' ? normalizeDate(val) : val
    }
  }
  if (importType === 'leitores') {
    if (!data.data_cadastro) data.data_cadastro = new Date().toISOString().split('T')[0]
    if (!data.status) data.status = 'ativo'
  } else {
    if (!data.status) data.status = 'disponível'
  }
  return data
}
