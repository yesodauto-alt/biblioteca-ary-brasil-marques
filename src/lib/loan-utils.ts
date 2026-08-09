export type Situacao = 'em-dia' | 'vence-hoje' | 'atrasado'

export function getSituacao(dataPrevista: string): Situacao {
  if (!dataPrevista) return 'em-dia'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const previsto = new Date(dataPrevista + 'T00:00:00')
  previsto.setHours(0, 0, 0, 0)
  if (today > previsto) return 'atrasado'
  if (today.getTime() === previsto.getTime()) return 'vence-hoje'
  return 'em-dia'
}

export const SITUACAO_LABELS: Record<Situacao, string> = {
  'em-dia': 'Em dia',
  'vence-hoje': 'Vence hoje',
  atrasado: 'Atrasado',
}

export const SITUACAO_BADGE: Record<Situacao, string> = {
  'em-dia': 'bg-green-100 text-green-800 hover:bg-green-100',
  'vence-hoje': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  atrasado: 'bg-red-100 text-red-800 hover:bg-red-100',
}

export const SITUACAO_PRIORITY: Record<Situacao, number> = {
  atrasado: 0,
  'vence-hoje': 1,
  'em-dia': 2,
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR')
}
