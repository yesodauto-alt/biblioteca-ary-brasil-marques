import pb from '@/lib/pocketbase/client'

export type VoluntarioStatus = 'ativo' | 'inativo'

export interface Voluntario {
  id: string
  matricula: string
  nome: string
  status: VoluntarioStatus
  created: string
  updated: string
}

export interface VoluntarioFormData {
  nome: string
  status?: VoluntarioStatus
}

export const getVoluntarios = async (): Promise<Voluntario[]> => {
  return await pb.collection('voluntarios').getFullList<Voluntario>({ sort: 'nome' })
}

export const getVoluntario = async (id: string): Promise<Voluntario> => {
  return await pb.collection('voluntarios').getOne<Voluntario>(id)
}

export const createVoluntario = async (data: VoluntarioFormData): Promise<Voluntario> => {
  return await pb.collection('voluntarios').create<Voluntario>({
    nome: data.nome,
    status: data.status || 'ativo',
  })
}

export const updateVoluntario = async (
  id: string,
  data: Partial<VoluntarioFormData>,
): Promise<Voluntario> => {
  return await pb.collection('voluntarios').update<Voluntario>(id, data)
}

export const deleteVoluntario = async (id: string): Promise<void> => {
  await pb.collection('voluntarios').delete(id)
}

export const getActiveVoluntarios = async (): Promise<Voluntario[]> => {
  return await pb.collection('voluntarios').getFullList<Voluntario>({
    filter: 'status = "ativo"',
    sort: 'nome',
  })
}
