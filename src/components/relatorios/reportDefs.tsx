import type { ReportColumn } from '@/components/relatorios/ReportTable'
import type { PeriodFilter } from '@/services/relatorios'
import {
  fetchEmprestimosRealizados,
  fetchDevolucoesRealizadas,
  fetchRenovacoesRealizadas,
  fetchEmprestimosAtivos,
  fetchEmprestimosAtrasados,
  fetchLivrosDisponiveis,
  fetchLivrosMaisEmprestados,
  fetchUsuariosMaisUtilizam,
} from '@/services/relatorios'

export type ReportType =
  | 'emprestimos-realizados'
  | 'devolucoes-realizadas'
  | 'renovacoes-realizadas'
  | 'emprestimos-ativos'
  | 'emprestimos-atrasados'
  | 'livros-disponiveis'
  | 'livros-mais-emprestados'
  | 'usuarios-mais-utilizam'

export interface ClickHandlers {
  onLeitorClick: (id: string) => void
  onLivroClick: (id: string) => void
}

export interface ReportDef {
  label: string
  usesPeriod: boolean
  columns: ReportColumn<any>[]
  csvHeaders: string[]
  csvRow: (row: any) => (string | number)[]
  fetchData: (period: PeriodFilter) => Promise<any[]>
  highlightRow?: (row: any) => boolean
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00')
  return date.toLocaleDateString('pt-BR')
}

function capitalize(s: string): string {
  if (!s) return '—'
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function getSituacao(r: any): string {
  if (r.dataDevolucaoReal) {
    const dev = new Date(r.dataDevolucaoReal + 'T00:00:00')
    const due = new Date(r.dataPrevistaDevolucao + 'T00:00:00')
    return dev > due ? 'Devolvido com atraso' : 'Devolvido no prazo'
  }
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(r.dataPrevistaDevolucao + 'T00:00:00')
  due.setHours(0, 0, 0, 0)
  return today > due ? 'Atrasado' : 'No prazo'
}

export function getReportDefs(h: ClickHandlers): Record<ReportType, ReportDef> {
  const col = (header: string, accessor: string, className?: string): ReportColumn<any> => ({
    header,
    render: (r: any) => r[accessor] ?? '—',
    className,
  })
  const dateCol = (header: string, accessor: string): ReportColumn<any> => ({
    header,
    render: (r: any) => formatDate(r[accessor]),
  })
  const clickCol = (
    header: string,
    accessor: string,
    handler: (id: string) => void,
    idAccessor: string,
  ): ReportColumn<any> => ({
    header,
    render: (r: any) => r[accessor] ?? '—',
    onClick: (r: any) => handler(r[idAccessor]),
  })
  const situacaoCol: ReportColumn<any> = { header: 'Situação', render: (r: any) => getSituacao(r) }
  const statusCol: ReportColumn<any> = {
    header: 'Status',
    render: (r: any) => capitalize(r.status),
  }

  return {
    'emprestimos-realizados': {
      label: 'Empréstimos realizados',
      usesPeriod: true,
      columns: [
        clickCol('Usuário', 'leitorNome', h.onLeitorClick, 'leitorId'),
        col('Nº Cadastro', 'leitorNumero'),
        clickCol('Livro', 'livroTitulo', h.onLivroClick, 'livroId'),
        col('Nº Livro', 'livroNumero'),
        dateCol('Data Empréstimo', 'dataEmprestimo'),
        dateCol('Dev. Prevista', 'dataPrevistaDevolucao'),
        statusCol,
      ],
      csvHeaders: [
        'Usuário',
        'Nº Cadastro Usuário',
        'Livro',
        'Nº Cadastro Livro',
        'Data Empréstimo',
        'Devolução Prevista',
        'Status',
      ],
      csvRow: (r) => [
        r.leitorNome,
        r.leitorNumero,
        r.livroTitulo,
        r.livroNumero,
        r.dataEmprestimo,
        r.dataPrevistaDevolucao,
        r.status,
      ],
      fetchData: (p) => fetchEmprestimosRealizados(p),
    },
    'devolucoes-realizadas': {
      label: 'Devoluções realizadas',
      usesPeriod: true,
      columns: [
        clickCol('Usuário', 'leitorNome', h.onLeitorClick, 'leitorId'),
        col('Nº Cadastro', 'leitorNumero'),
        clickCol('Livro', 'livroTitulo', h.onLivroClick, 'livroId'),
        col('Nº Livro', 'livroNumero'),
        dateCol('Data Empréstimo', 'dataEmprestimo'),
        dateCol('Data Devolução', 'dataDevolucaoReal'),
        situacaoCol,
      ],
      csvHeaders: [
        'Usuário',
        'Nº Cadastro Usuário',
        'Livro',
        'Nº Cadastro Livro',
        'Data Empréstimo',
        'Data Devolução',
        'Situação',
      ],
      csvRow: (r) => [
        r.leitorNome,
        r.leitorNumero,
        r.livroTitulo,
        r.livroNumero,
        r.dataEmprestimo,
        r.dataDevolucaoReal,
        getSituacao(r),
      ],
      fetchData: (p) => fetchDevolucoesRealizadas(p),
    },
    'renovacoes-realizadas': {
      label: 'Renovações realizadas',
      usesPeriod: true,
      columns: [
        clickCol('Usuário', 'leitorNome', h.onLeitorClick, 'leitorId'),
        col('Nº Cadastro', 'leitorNumero'),
        clickCol('Livro', 'livroTitulo', h.onLivroClick, 'livroId'),
        dateCol('Data Renovação', 'dataRenovacao'),
        dateCol('Nova Dev. Prevista', 'novaDataPrevista'),
        col('Responsável', 'responsavelNome'),
      ],
      csvHeaders: [
        'Usuário',
        'Nº Cadastro Usuário',
        'Livro',
        'Data Renovação',
        'Nova Devolução Prevista',
        'Responsável',
      ],
      csvRow: (r) => [
        r.leitorNome,
        r.leitorNumero,
        r.livroTitulo,
        r.dataRenovacao,
        r.novaDataPrevista,
        r.responsavelNome,
      ],
      fetchData: (p) => fetchRenovacoesRealizadas(p),
    },
    'emprestimos-ativos': {
      label: 'Empréstimos ativos',
      usesPeriod: false,
      columns: [
        clickCol('Usuário', 'leitorNome', h.onLeitorClick, 'leitorId'),
        col('Nº Cadastro', 'leitorNumero'),
        clickCol('Livro', 'livroTitulo', h.onLivroClick, 'livroId'),
        col('Nº Livro', 'livroNumero'),
        dateCol('Data Empréstimo', 'dataEmprestimo'),
        dateCol('Dev. Prevista', 'dataPrevistaDevolucao'),
        situacaoCol,
      ],
      csvHeaders: [
        'Usuário',
        'Nº Cadastro Usuário',
        'Livro',
        'Nº Cadastro Livro',
        'Data Empréstimo',
        'Devolução Prevista',
        'Situação',
      ],
      csvRow: (r) => [
        r.leitorNome,
        r.leitorNumero,
        r.livroTitulo,
        r.livroNumero,
        r.dataEmprestimo,
        r.dataPrevistaDevolucao,
        getSituacao(r),
      ],
      fetchData: (p) => fetchEmprestimosAtivos(p),
    },
    'emprestimos-atrasados': {
      label: 'Empréstimos atrasados',
      usesPeriod: false,
      columns: [
        clickCol('Usuário', 'leitorNome', h.onLeitorClick, 'leitorId'),
        col('Nº Cadastro', 'leitorNumero'),
        clickCol('Livro', 'livroTitulo', h.onLivroClick, 'livroId'),
        col('Nº Livro', 'livroNumero'),
        dateCol('Data Empréstimo', 'dataEmprestimo'),
        dateCol('Dev. Prevista', 'dataPrevistaDevolucao'),
        situacaoCol,
      ],
      csvHeaders: [
        'Usuário',
        'Nº Cadastro Usuário',
        'Livro',
        'Nº Cadastro Livro',
        'Data Empréstimo',
        'Devolução Prevista',
        'Situação',
      ],
      csvRow: (r) => [
        r.leitorNome,
        r.leitorNumero,
        r.livroTitulo,
        r.livroNumero,
        r.dataEmprestimo,
        r.dataPrevistaDevolucao,
        getSituacao(r),
      ],
      fetchData: (p) => fetchEmprestimosAtrasados(p),
      highlightRow: () => true,
    },
    'livros-disponiveis': {
      label: 'Livros disponíveis',
      usesPeriod: false,
      columns: [
        col('Nº Cadastro', 'numeroCadastro'),
        clickCol('Título', 'titulo', h.onLivroClick, 'id'),
        col('Autor', 'autor'),
        col('Editora', 'editora'),
        col('Categoria', 'categoria'),
        col('Localização', 'localizacaoFisica'),
        statusCol,
      ],
      csvHeaders: [
        'Nº Cadastro',
        'Título',
        'Autor',
        'Editora',
        'Categoria',
        'Localização Física',
        'Status',
      ],
      csvRow: (r) => [
        r.numeroCadastro,
        r.titulo,
        r.autor,
        r.editora,
        r.categoria,
        r.localizacaoFisica,
        r.status,
      ],
      fetchData: (p) => fetchLivrosDisponiveis(p),
    },
    'livros-mais-emprestados': {
      label: 'Livros mais emprestados',
      usesPeriod: false,
      columns: [
        clickCol('Título', 'titulo', h.onLivroClick, 'livroId'),
        col('Nº Cadastro', 'numeroCadastro'),
        col('Autor', 'autor'),
        col('Empréstimos', 'quantidade', 'text-right font-bold'),
      ],
      csvHeaders: ['Título', 'Nº Cadastro', 'Autor', 'Quantidade de Empréstimos'],
      csvRow: (r) => [r.titulo, r.numeroCadastro, r.autor, r.quantidade],
      fetchData: (p) => fetchLivrosMaisEmprestados(p),
    },
    'usuarios-mais-utilizam': {
      label: 'Usuários mais ativos',
      usesPeriod: false,
      columns: [
        clickCol('Nome', 'nome', h.onLeitorClick, 'leitorId'),
        col('Nº Cadastro', 'numeroCadastro'),
        col('Telefone', 'telefone'),
        col('Empréstimos', 'quantidade', 'text-right font-bold'),
      ],
      csvHeaders: ['Nome', 'Nº Cadastro', 'Telefone', 'Quantidade de Empréstimos'],
      csvRow: (r) => [r.nome, r.numeroCadastro, r.telefone, r.quantidade],
      fetchData: (p) => fetchUsuariosMaisUtilizam(p),
    },
  }
}
