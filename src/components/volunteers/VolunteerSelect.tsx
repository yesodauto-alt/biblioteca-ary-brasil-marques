import { useState, useMemo, useEffect } from 'react'
import { Search, Check } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { getActiveVoluntarios, type Voluntario } from '@/services/voluntarios'

interface VolunteerSelectProps {
  value: string
  onChange: (value: string) => void
  onSelect?: (voluntario: Voluntario | null) => void
}

export function VolunteerSelect({ value, onChange, onSelect }: VolunteerSelectProps) {
  const [volunteers, setVolunteers] = useState<Voluntario[]>([])
  const [loaded, setLoaded] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!value) {
      setSearch('')
      return
    }
    if (value && !loaded) {
      getActiveVoluntarios()
        .then((vols) => {
          setVolunteers(vols)
          setLoaded(true)
        })
        .catch(() => {})
    }
  }, [value, loaded])

  const selectedVolunteer = useMemo(() => {
    if (!value) return null
    return volunteers.find((v) => v.id === value) || null
  }, [value, volunteers])

  const handleSearchChange = (v: string) => {
    setSearch(v)
    if (v.trim() && !loaded) {
      getActiveVoluntarios()
        .then((vols) => {
          setVolunteers(vols)
          setLoaded(true)
        })
        .catch(() => {})
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return []
    return volunteers.filter(
      (v) => v.nome.toLowerCase().includes(q) || (v.matricula || '').toLowerCase().includes(q),
    )
  }, [volunteers, search])

  const handleSelect = (v: Voluntario) => {
    onChange(v.id)
    onSelect?.(v)
    setSearch('')
  }

  const handleClear = () => {
    onChange('')
    onSelect?.(null)
    setSearch('')
  }

  return (
    <div className="space-y-2">
      <Label className="text-base font-semibold">Voluntário responsável *</Label>
      {selectedVolunteer ? (
        <div className="flex items-center justify-between p-3 rounded-lg border-2 border-[#1F5C8B] bg-[#1F5C8B]/5">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-[#1F5C8B] shrink-0" />
            <span className="text-base font-semibold text-[#1F5C8B]">
              {selectedVolunteer.matricula || '—'} — {selectedVolunteer.nome}
            </span>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium"
          >
            Trocar
          </button>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.preventDefault()
              }}
              placeholder="Buscar por nome ou matrícula..."
              className="h-10 pl-10 text-sm border-gray-200"
            />
          </div>
          {loaded && filtered.length > 0 && (
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {filtered.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => handleSelect(v)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg border-2 transition-all duration-150 text-base font-medium',
                    'border-gray-200 hover:border-[#1F5C8B]/40 hover:bg-gray-50',
                  )}
                >
                  {v.matricula || '—'} — {v.nome}
                </button>
              ))}
            </div>
          )}
          {loaded && filtered.length === 0 && search.trim() && (
            <p className="text-sm text-gray-500 text-center py-2">Nenhum voluntário encontrado.</p>
          )}
        </>
      )}
    </div>
  )
}
