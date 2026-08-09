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
