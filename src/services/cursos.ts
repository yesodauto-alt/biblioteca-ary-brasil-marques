import pb from '@/lib/pocketbase/client'
import type { Livro } from '@/services/livros'

export interface Curso {
  id: string
  nome: string
  ano_nivel_etapa: string
  created: string
  updated: string
}

export interface CursoFormData {
  nome: string
  ano_nivel_etapa?: string
}

export interface CursoLivro {
  id: string
  curso: string
  livro: string
  created: string
  updated: string
  expand?: {
    livro?: Livro
  }
}

export const getCursos = async (): Promise<Curso[]> => {
  return await pb.collection('cursos').getFullList<Curso>({
    sort: 'nome',
  })
}

export const getCurso = async (id: string): Promise<Curso> => {
  return await pb.collection('cursos').getOne<Curso>(id)
}

export const createCurso = async (data: CursoFormData): Promise<Curso> => {
  return await pb.collection('cursos').create<Curso>(data)
}

export const updateCurso = async (id: string, data: Partial<CursoFormData>): Promise<Curso> => {
  return await pb.collection('cursos').update<Curso>(id, data)
}

export const deleteCurso = async (id: string): Promise<void> => {
  await pb.collection('cursos').delete(id)
}

export const getCursoLivros = async (cursoId: string): Promise<CursoLivro[]> => {
  return await pb.collection('cursos_livros').getFullList<CursoLivro>({
    filter: `curso = "${cursoId}"`,
    expand: 'livro',
    sort: '-created',
  })
}

export const linkLivroToCurso = async (cursoId: string, livroId: string): Promise<CursoLivro> => {
  return await pb.collection('cursos_livros').create<CursoLivro>({
    curso: cursoId,
    livro: livroId,
  })
}

export const unlinkLivroFromCurso = async (cursoLivroId: string): Promise<void> => {
  await pb.collection('cursos_livros').delete(cursoLivroId)
}

export const getLinkedLivroIds = async (cursoId: string): Promise<string[]> => {
  const links = await pb.collection('cursos_livros').getFullList<CursoLivro>({
    filter: `curso = "${cursoId}"`,
  })
  return links.map((l) => l.livro)
}
