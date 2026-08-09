import pb from '@/lib/pocketbase/client'

export interface Configuracoes {
  id: string
  prazo_devolucao_dias: number
  limite_renovacoes: number
  created: string
  updated: string
}

export const getConfiguracoes = async (): Promise<Configuracoes | null> => {
  const records = await pb.collection('configuracoes').getFullList<Configuracoes>({
    sort: 'created',
  })
  return records[0] || null
}

export const updateConfiguracoes = async (
  id: string,
  data: { prazo_devolucao_dias: number; limite_renovacoes: number },
): Promise<Configuracoes> => {
  return await pb.collection('configuracoes').update<Configuracoes>(id, data)
}
