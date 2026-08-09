import pb from '@/lib/pocketbase/client'

export interface Leitor {
  id: string
  numero_cadastro: string
  nome_completo: string
  telefone: string
  email: string
  data_nascimento: string
  endereco: string
  data_cadastro: string
  status: 'ativo' | 'inativo'
  observacoes: string
  created: string
  updated: string
}

export interface LeitorFormData {
  numero_cadastro: string
  nome_completo: string
  telefone: string
  email?: string
  data_nascimento?: string
  endereco?: string
  observacoes?: string
}

export const getLeitores = async (): Promise<Leitor[]> => {
  return await pb.collection('leitores').getFullList<Leitor>({
    sort: 'nome_completo',
  })
}

export const getLeitor = async (id: string): Promise<Leitor> => {
  return await pb.collection('leitores').getOne<Leitor>(id)
}

export const createLeitor = async (data: LeitorFormData): Promise<Leitor> => {
  return await pb.collection('leitores').create<Leitor>({
    ...data,
    data_cadastro: new Date().toISOString().split('T')[0],
    status: 'ativo',
  })
}

export const updateLeitor = async (id: string, data: Partial<LeitorFormData>): Promise<Leitor> => {
  return await pb.collection('leitores').update<Leitor>(id, data)
}

export const deleteLeitor = async (id: string): Promise<void> => {
  await pb.collection('leitores').delete(id)
}

export const getLeitorByCadastro = async (numeroCadastro: string): Promise<Leitor> => {
  return await pb
    .collection('leitores')
    .getFirstListItem<Leitor>(`numero_cadastro = "${numeroCadastro}"`)
}

export const searchLeitores = async (query: string): Promise<Leitor[]> => {
  const q = query.trim()
  if (!q) return []
  return await pb.collection('leitores').getFullList<Leitor>({
    filter: `nome_completo ~ "${q}" || numero_cadastro = "${q}"`,
    sort: 'nome_completo',
  })
}
