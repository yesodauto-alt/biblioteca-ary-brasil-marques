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
    responsavel?: {
      id: string
      name: string
      matricula: string
    }
  }
}

export const getEmprestimosByLeitor = async (leitorId: string): Promise<Emprestimo[]> => {
  return await pb.collection('emprestimos').getFullList<Emprestimo>({
    filter: `leitor = "${leitorId}"`,
    sort: '-data_emprestimo',
    expand: 'livro,responsavel',
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
    expand: 'leitor,responsavel',
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
  let timezone = 'America/Sao_Paulo'
  try {
    const config = await getConfiguracoes()
    if (config?.prazo_devolucao_dias) loanPeriod = config.prazo_devolucao_dias
    if (config?.fuso_horario) timezone = config.fuso_horario
  } catch {
    /* intentionally ignored */
  }

  if (tipo === 'estudo') {
    loanPeriod = 90
  }

  const today = new Date()
  const returnDate = new Date()
  returnDate.setDate(returnDate.getDate() + loanPeriod)

  const toDateStr = (d: Date) =>
    new Intl.DateTimeFormat('sv-SE', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d)

  return await pb.collection('emprestimos').create<Emprestimo>({
    leitor: data.leitor,
    livro: data.livro,
    data_emprestimo: toDateStr(today),
    data_prevista_devolucao: toDateStr(returnDate),
    status: 'ativo',
    quantidade_renovacoes: 0,
    responsavel: data.responsavel,
    tipo_emprestimo: tipo,
  })
}

export const getActiveEmprestimos = async (): Promise<EmprestimoWithLeitor[]> => {
  return await pb.collection('emprestimos').getFullList<EmprestimoWithLeitor>({
    filter: `status = "ativo" || status = "atrasado"`,
    sort: 'data_prevista_devolucao',
    expand: 'leitor,livro',
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

export const getDevolucoesHoje = async (): Promise<EmprestimoWithLeitor[]> => {
  const today = new Date().toISOString().split('T')[0]
  return await pb.collection('emprestimos').getFullList<EmprestimoWithLeitor>({
    filter: `status = "devolvido" && data_devolucao_real = "${today}"`,
    sort: '-updated',
    expand: 'leitor,livro',
  })
}

export const devolverEmprestimo = async (id: string, voluntarioId: string): Promise<Emprestimo> => {
  return await pb.send(`/backend/v1/emprestimos/${id}/devolver`, {
    method: 'POST',
    body: JSON.stringify({ voluntario_id: voluntarioId }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export const renovarEmprestimo = async (
  id: string,
  novaDataDevolucao: string,
  voluntarioId: string,
): Promise<Emprestimo> => {
  return await pb.send(`/backend/v1/emprestimos/${id}/renovar`, {
    method: 'POST',
    body: JSON.stringify({
      voluntario_id: voluntarioId,
      nova_data_devolucao: novaDataDevolucao,
    }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export const hasActiveLoansByLeitor = async (leitorId: string): Promise<boolean> => {
  try {
    await pb
      .collection('emprestimos')
      .getFirstListItem(`leitor = "${leitorId}" && (status = "ativo" || status = "atrasado")`)
    return true
  } catch {
    return false
  }
}

export const hasActiveLoansByLivro = async (livroId: string): Promise<boolean> => {
  try {
    await pb
      .collection('emprestimos')
      .getFirstListItem(`livro = "${livroId}" && (status = "ativo" || status = "atrasado")`)
    return true
  } catch {
    return false
  }
}

export const hasActiveLoansByResponsavel = async (userId: string): Promise<boolean> => {
  try {
    await pb
      .collection('emprestimos')
      .getFirstListItem(`responsavel = "${userId}" && (status = "ativo" || status = "atrasado")`)
    return true
  } catch {
    return false
  }
}
