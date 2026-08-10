export type Situacao = 'em-dia' | 'vence-hoje' | 'atrasado' | 'sem-data'

const DEFAULT_TIMEZONE = 'America/Sao_Paulo'

export function getTodayInTimezone(timezone: string = DEFAULT_TIMEZONE): string {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

export function normalizeToDate(dateStr: string): string {
  if (!dateStr) return ''
  return dateStr.split(' ')[0].split('T')[0]
}

export function isValidDate(dateStr: string): boolean {
  if (!dateStr) return false
  const normalized = dateStr.includes('T')
    ? dateStr
    : dateStr.includes(' ')
      ? dateStr.replace(' ', 'T')
      : dateStr + 'T00:00:00'
  const d = new Date(normalized)
  return !isNaN(d.getTime())
}

export function getSituacao(dataPrevista: string, timezone: string = DEFAULT_TIMEZONE): Situacao {
  const normalized = normalizeToDate(dataPrevista)
  if (!normalized || !isValidDate(normalized)) return 'sem-data'
  const today = getTodayInTimezone(timezone)
  if (normalized > today) return 'em-dia'
  if (normalized === today) return 'vence-hoje'
  return 'atrasado'
}

export function getDaysOverdue(
  dataPrevista: string,
  timezone: string = DEFAULT_TIMEZONE,
): number | null {
  if (!dataPrevista || !isValidDate(dataPrevista)) return null
  const today = getTodayInTimezone(timezone)
  const dateOnly = normalizeToDate(dataPrevista)
  if (dateOnly >= today) return 0
  const prevista = new Date(dateOnly + 'T00:00:00')
  const hoje = new Date(today + 'T00:00:00')
  const diffMs = hoje.getTime() - prevista.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

export const SITUACAO_LABELS: Record<Situacao, string> = {
  'em-dia': 'Em dia',
  'vence-hoje': 'Vence hoje',
  atrasado: 'Atrasado',
  'sem-data': 'Data não informada',
}

export const SITUACAO_BADGE: Record<Situacao, string> = {
  'em-dia': 'bg-green-100 text-green-800 hover:bg-green-100',
  'vence-hoje': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  atrasado: 'bg-red-100 text-red-800 hover:bg-red-100',
  'sem-data': 'bg-gray-100 text-gray-600 hover:bg-gray-100',
}

export const SITUACAO_PRIORITY: Record<Situacao, number> = {
  atrasado: 0,
  'vence-hoje': 1,
  'em-dia': 2,
  'sem-data': 3,
}

export function formatDate(dateStr: string): string {
  if (!dateStr || !isValidDate(dateStr)) return 'Data não informada'
  const dateOnly = normalizeToDate(dateStr)
  const parts = dateOnly.split('-')
  if (parts.length !== 3) return 'Data não informada'
  return `${parts[2]}/${parts[1]}/${parts[0]}`
}

export function formatDateTime(dateStr: string, timezone: string = DEFAULT_TIMEZONE): string {
  if (!dateStr || !isValidDate(dateStr)) return 'Data não informada'
  const normalized = dateStr.includes('T')
    ? dateStr
    : dateStr.includes(' ')
      ? dateStr.replace(' ', 'T')
      : dateStr + 'T00:00:00'
  const date = new Date(normalized)
  const datePart = new Intl.DateTimeFormat('pt-BR', {
    timeZone: timezone,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
  const timePart = new Intl.DateTimeFormat('pt-BR', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
  return `${datePart} às ${timePart}`
}
