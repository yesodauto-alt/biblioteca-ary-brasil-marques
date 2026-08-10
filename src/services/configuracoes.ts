import pb from '@/lib/pocketbase/client'

export interface Configuracoes {
  id: string
  prazo_devolucao_dias: number
  limite_renovacoes: number
  limite_livros_por_usuario: number
  nome_biblioteca: string
  telefone: string
  email: string
  informacoes_institucionais: string
  fuso_horario: string
  created: string
  updated: string
}

export const getConfiguracoes = async (): Promise<Configuracoes | null> => {
  return await pb.send('/backend/v1/config', { method: 'GET' })
}

export const updateConfiguracoes = async (
  id: string,
  data: Partial<
    Pick<
      Configuracoes,
      | 'prazo_devolucao_dias'
      | 'limite_renovacoes'
      | 'limite_livros_por_usuario'
      | 'nome_biblioteca'
      | 'telefone'
      | 'email'
      | 'informacoes_institucionais'
    >
  >,
): Promise<Configuracoes> => {
  return await pb.collection('configuracoes').update<Configuracoes>(id, data)
}
