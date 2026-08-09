import type { ReactNode } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export interface ReportColumn<T = any> {
  header: string
  render: (row: T) => ReactNode
  onClick?: (row: T) => void
  className?: string
}

interface ReportTableProps<T = any> {
  columns: ReportColumn<T>[]
  data: T[]
  loading?: boolean
  highlightRow?: (row: T) => boolean
}

export function ReportTable<T = any>({
  columns,
  data,
  loading,
  highlightRow,
}: ReportTableProps<T>) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
        <p className="text-lg font-semibold text-gray-600">Nenhum registro encontrado.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {columns.map((col, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-left text-base font-bold text-gray-600 uppercase tracking-wide whitespace-nowrap"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, ri) => (
              <tr
                key={ri}
                className={`border-b border-gray-100 last:border-0 ${
                  highlightRow?.(row) ? 'bg-red-50' : 'hover:bg-gray-50'
                }`}
              >
                {columns.map((col, ci) => (
                  <td
                    key={ci}
                    className={`px-4 py-3 text-base text-gray-800 whitespace-nowrap ${col.className || ''}`}
                  >
                    {col.onClick ? (
                      <button
                        onClick={() => col.onClick!(row)}
                        className="text-[#1F5C8B] font-semibold hover:underline text-left"
                      >
                        {col.render(row)}
                      </button>
                    ) : (
                      col.render(row)
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
