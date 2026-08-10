import { useEffect, useState } from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { getActiveVolunteers, type User } from '@/services/users'

interface VolunteerSelectProps {
  value: string
  onChange: (value: string) => void
}

export function VolunteerSelect({ value, onChange }: VolunteerSelectProps) {
  const [volunteers, setVolunteers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getActiveVolunteers()
      .then(setVolunteers)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-2">
      <Label className="text-base font-semibold">Voluntário responsável *</Label>
      {loading ? (
        <p className="text-sm text-gray-500">Carregando voluntários...</p>
      ) : volunteers.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhum voluntário ativo encontrado.</p>
      ) : (
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {volunteers.map((v) => (
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
              {v.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
