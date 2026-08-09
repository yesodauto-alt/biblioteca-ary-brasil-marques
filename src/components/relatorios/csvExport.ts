export function exportToCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const escape = (val: string | number) => `"${String(val).replace(/"/g, '""')}"`
  const csv = [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))].join(
    '\r\n',
  )
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
