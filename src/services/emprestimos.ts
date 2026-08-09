import pb from '@/lib/pocketbase/client'

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

export interface CreateEmprestimoData {
  leitor: string
  livro: string
  responsavel: string
}

export const createEmprestimo = async (data: CreateEmprestimoData): Promise<Emprestimo> => {
  const today = new Date()
  const returnDate = new Date()
  returnDate.setDate(returnDate.getDate() + LOAN_PERIOD_DAYS)

  const toDateStr = (d: Date) => d.toISOString().split('T')[0]

  return await pb.collection('emprestimos').create<Emprestimo>({
    leitor: data.leitor,
    livro: data.livro,
    data_emprestimo: toDateStr(today),
    data_prevista_devolucao: toDateStr(returnDate),
    status: 'ativo',
    quantidade_renovacoes: 0,
    responsavel: data.responsavel,
  })
}
