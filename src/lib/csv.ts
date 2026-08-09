export function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines: string[][] = []
  let currentLine: string[] = []
  let currentField = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          currentField += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        currentField += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === ',') {
        currentLine.push(currentField)
        currentField = ''
      } else if (char === '\n') {
        currentLine.push(currentField)
        lines.push(currentLine)
        currentLine = []
        currentField = ''
      } else if (char !== '\r') {
        currentField += char
      }
    }
  }
  if (currentField || currentLine.length > 0) {
    currentLine.push(currentField)
    lines.push(currentLine)
  }
  if (lines.length === 0) return { headers: [], rows: [] }
  const headers = lines[0].map((h) => h.trim())
  const rows = lines.slice(1).filter((r) => r.some((c) => c.trim() !== ''))
  return { headers, rows }
}
