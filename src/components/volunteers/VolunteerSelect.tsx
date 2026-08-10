import { useEffect, useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { getActiveVolunteers, type User } from '@/services/users'

interface VolunteerSelectProps {
  value: string
  onChange: (value: string) => void
}

export function VolunteerSelect({ value, onChange }: VolunteerSelectProps) {
  const [volunteers, setVolunteers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getActiveVolunteers()
      .then(setVolunteers)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return volunteers
    return volunteers.filter(
      (v) => v.name.toLowerCase().includes(q) || (v.matricula || '').toLowerCase().includes(q),
    )
  }, [volunteers, search])

  return (
    <div className="space-y-2">
      <Label className="text-base font-semibold">Voluntário responsável *</Label>
      {loading ? (
        <p className="text-sm text-gray-500">Carregando voluntários...</p>
      ) : volunteers.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhum voluntário ativo encontrado.</p>
      ) : (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.preventDefault()
              }}
              placeholder="Buscar por nome ou matrícula..."
              className="h-10 pl-10 text-sm border-gray-200"
            />
          </div>
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {filtered.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => onChange(v.id)}
                className={cn(
                  'w-full text-left p-3 rounded-lg border-2 transition-all duration-150 text-base font-medium',
                  value === v.id
                    ? 'border-[#1F5C8B] bg-[#1F5C8B]/5 text-[#1F5C8B]'
                    : 'border-gray-200 hover:border-[#1F5C8B]/40 hover:bg-gray-50',
                )}
              >
                {v.matricula || '—'} — {v.name}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-2">
                Nenhum voluntário encontrado.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
