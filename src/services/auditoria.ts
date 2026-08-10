import pb from '@/lib/pocketbase/client'

export interface AuditoriaRecord {
  id: string
  acao: string
  entidade: string
  registro_id: string
  usuario: string
  detalhes: string
  created: string
  expand?: {
    usuario?: {
      id: string
      name: string
    }
  }
}

export const ACAO_LABELS_LEITOR: Record<string, string> = {
  emprestimo: 'Empréstimo',
  renovacao: 'Renovação',
  devolucao: 'Devolução',
  criacao: 'Criação',
  alteracao: 'Alteração',
  mudanca_status: 'Mudança de status',
}

export const ACAO_LABELS_LIVRO: Record<string, string> = {
  emprestimo: 'Emprestado',
  renovacao: 'Renovado',
  devolucao: 'Devolvido',
  criacao: 'Criado',
  alteracao: 'Alterado',
  mudanca_status: 'Status alterado',
}

export const getAuditoriaByEmprestimoIds = async (ids: string[]): Promise<AuditoriaRecord[]> => {
  if (ids.length === 0) return []
  const batches: AuditoriaRecord[] = []
  for (let i = 0; i < ids.length; i += 30) {
    const batch = ids.slice(i, i + 30)
    const filter = batch.map((id) => `registro_id = "${id}"`).join(' || ')
    const records = await pb.collection('auditoria').getFullList<AuditoriaRecord>({
      filter,
      sort: 'created',
      expand: 'usuario',
    })
    batches.push(...records)
  }
  return batches.sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime())
}

export function groupAuditByRegistro(
  records: AuditoriaRecord[],
): Record<string, AuditoriaRecord[]> {
  const map: Record<string, AuditoriaRecord[]> = {}
  for (const r of records) {
    if (!map[r.registro_id]) map[r.registro_id] = []
    map[r.registro_id].push(r)
  }
  return map
}
