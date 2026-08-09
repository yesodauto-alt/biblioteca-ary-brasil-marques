import pb from '@/lib/pocketbase/client'
import { getLivroByCadastro } from '@/services/livros'
import { getConfiguracoes } from '@/services/configuracoes'

export interface Emprestimo {
  id: string
  leitor: string
  livro: string
  data_emprestimo: string
  data_prevista_devolucao: string
  data_devolucao_real: string
  status: 'ativo' | 'devolvido' | 'atrasado'
  quantidade_renovacoes: number
  responsavel: string
  tipo_emprestimo: 'comum' | 'estudo'
  created: string
  updated: string
  expand?: {
    livro?: {
      id: string
      titulo: string
      autor: string
      numero_cadastro: string
    }
  }
}

export const getEmprestimosByLeitor = async (leitorId: string): Promise<Emprestimo[]> => {
  return await pb.collection('emprestimos').getFullList<Emprestimo>({
    filter: `leitor = "${leitorId}"`,
    sort: '-data_emprestimo',
    expand: 'livro',
  })
}

export interface EmprestimoWithLeitor extends Emprestimo {
  expand?: {
    livro?: {
      id: string
      titulo: string
      autor: string
      numero_cadastro: string
    }
    leitor?: {
      id: string
      nome_completo: string
      numero_cadastro: string
    }
  }
}

export const getEmprestimosByLivro = async (livroId: string): Promise<EmprestimoWithLeitor[]> => {
  return await pb.collection('emprestimos').getFullList<EmprestimoWithLeitor>({
    filter: `livro = "${livroId}"`,
    sort: '-data_emprestimo',
    expand: 'leitor',
  })
}

export const LOAN_PERIOD_DAYS = 15
export const DEFAULT_MAX_BOOKS = 3

export interface CreateEmprestimoData {
  leitor: string
  livro: string
  responsavel: string
  tipo_emprestimo?: 'comum' | 'estudo'
}

export const createEmprestimo = async (data: CreateEmprestimoData): Promise<Emprestimo> => {
  const tipo = data.tipo_emprestimo || 'comum'

  let loanPeriod = LOAN_PERIOD_DAYS
  try {
    const config = await getConfiguracoes()
    if (config?.prazo_devolucao_dias) loanPeriod = config.prazo_devolucao_dias
  } catch {
    /* intentionally ignored */
  }

  if (tipo === 'estudo') {
    loanPeriod = 90
  }

  const today = new Date()
  const returnDate = new Date()
  returnDate.setDate(returnDate.getDate() + loanPeriod)

  const toDateStr = (d: Date) => d.toISOString().split('T')[0]

  return await pb.collection('emprestimos').create<Emprestimo>({
    leitor: data.leitor,
    livro: data.livro,
    data_emprestimo: toDateStr(today),
    data_prevista_devolucao: toDateStr(returnDate),
    data_devolucao_real: '',
    status: 'ativo',
    quantidade_renovacoes: 0,
    responsavel: data.responsavel,
    tipo_emprestimo: tipo,
  })
}

export const getActiveEmprestimoByLivroCadastro = async (
  numeroCadastro: string,
): Promise<EmprestimoWithLeitor> => {
  const livro = await getLivroByCadastro(numeroCadastro)
  return await pb
    .collection('emprestimos')
    .getFirstListItem<EmprestimoWithLeitor>(
      `livro = "${livro.id}" && (status = "ativo" || status = "atrasado")`,
      { expand: 'leitor,livro', sort: '-data_emprestimo' },
    )
}

export const devolverEmprestimo = async (id: string): Promise<Emprestimo> => {
  const today = new Date().toISOString().split('T')[0]
  return await pb.collection('emprestimos').update<Emprestimo>(id, {
    data_devolucao_real: today,
    status: 'devolvido',
  })
}

export const renovarEmprestimo = async (
  id: string,
  novaDataDevolucao: string,
): Promise<Emprestimo> => {
  const existing = await pb.collection('emprestimos').getOne<Emprestimo>(id)
  return await pb.collection('emprestimos').update<Emprestimo>(id, {
    data_prevista_devolucao: novaDataDevolucao,
    quantidade_renovacoes: existing.quantidade_renovacoes + 1,
  })
}
