import pb from '@/lib/pocketbase/client'

export type LivroStatus = 'disponível' | 'emprestado' | 'manutenção' | 'extraviado' | 'baixado'

export interface Livro {
  id: string
  numero_cadastro: string
  titulo: string
  autor: string
  editora: string
  categoria: string
  localizacao_fisica: string
  observacoes: string
  status: LivroStatus
  created: string
  updated: string
}

export interface LivroFormData {
  numero_cadastro: string
  titulo: string
  autor: string
  editora: string
  categoria?: string
  localizacao_fisica?: string
  observacoes?: string
}

export const STATUS_LABELS: Record<LivroStatus, string> = {
  disponível: 'Disponível',
  emprestado: 'Emprestado',
  manutenção: 'Em manutenção',
  extraviado: 'Extraviado',
  baixado: 'Baixado',
}

export const STATUS_BADGE_CLASSES: Record<LivroStatus, string> = {
  disponível: 'bg-green-100 text-green-800 hover:bg-green-100',
  emprestado: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  manutenção: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  extraviado: 'bg-red-100 text-red-800 hover:bg-red-100',
  baixado: 'bg-gray-200 text-gray-700 hover:bg-gray-200',
}

export const getLivros = async (): Promise<Livro[]> => {
  return await pb.collection('livros').getFullList<Livro>({
    sort: 'titulo',
  })
}

export const getLivro = async (id: string): Promise<Livro> => {
  return await pb.collection('livros').getOne<Livro>(id)
}

export const createLivro = async (data: LivroFormData): Promise<Livro> => {
  return await pb.collection('livros').create<Livro>({
    ...data,
    status: 'disponível',
  })
}

export const getLivroByCadastro = async (numeroCadastro: string): Promise<Livro> => {
  return await pb
    .collection('livros')
    .getFirstListItem<Livro>(`numero_cadastro = "${numeroCadastro}"`)
}

export const updateLivroStatus = async (id: string, status: LivroStatus): Promise<Livro> => {
  return await pb.collection('livros').update<Livro>(id, { status })
}

export const updateLivro = async (id: string, data: Partial<LivroFormData>): Promise<Livro> => {
  return await pb.collection('livros').update<Livro>(id, data)
}

export const deleteLivro = async (id: string): Promise<void> => {
  await pb.collection('livros').delete(id)
}
