import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export type PeriodType = 'hoje' | 'semana' | 'mes' | 'custom'

export interface PeriodFilterValue {
  type: PeriodType
  start: string
  end: string
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

function computePeriod(type: PeriodType, start?: string, end?: string): PeriodFilterValue {
  const today = todayStr()
  switch (type) {
    case 'hoje':
      return { type, start: today, end: today }
    case 'semana': {
      const d = new Date()
      const day = d.getDay()
      const sunday = new Date(d)
      sunday.setDate(d.getDate() - day)
      return { type, start: sunday.toISOString().split('T')[0], end: today }
    }
    case 'mes': {
      const d = new Date()
      const first = new Date(d.getFullYear(), d.getMonth(), 1)
      return { type, start: first.toISOString().split('T')[0], end: today }
    }
    case 'custom':
      return { type, start: start || today, end: end || today }
  }
}

export function getDefaultPeriod(): PeriodFilterValue {
  return computePeriod('mes')
}

interface PeriodFilterBarProps {
  value: PeriodFilterValue
  onChange: (value: PeriodFilterValue) => void
}

export function PeriodFilterBar({ value, onChange }: PeriodFilterBarProps) {
  const buttons: { type: PeriodType; label: string }[] = [
    { type: 'hoje', label: 'Hoje' },
    { type: 'semana', label: 'Esta semana' },
    { type: 'mes', label: 'Este mês' },
    { type: 'custom', label: 'Escolher período' },
  ]

  const handleClick = (type: PeriodType) => {
    if (type === 'custom') {
      onChange({ type: 'custom', start: value.start, end: value.end })
    } else {
      onChange(computePeriod(type))
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {buttons.map((b) => (
          <Button
            key={b.type}
            variant="outline"
            onClick={() => handleClick(b.type)}
            className={`h-12 px-5 text-base font-semibold ${
              value.type === b.type
                ? 'bg-[#1F5C8B] hover:bg-[#174A73] text-white border-[#1F5C8B]'
                : 'border-[#1F5C8B] text-[#1F5C8B] hover:bg-[#1F5C8B]/10'
            }`}
          >
            {b.label}
          </Button>
        ))}
      </div>
      {value.type === 'custom' && (
        <div className="flex flex-col sm:flex-row gap-3 animate-fade-in">
          <div className="flex-1">
            <label className="text-sm font-bold text-gray-600 block mb-1">Data inicial</label>
            <Input
              type="date"
              value={value.start}
              onChange={(e) => onChange({ type: 'custom', start: e.target.value, end: value.end })}
              className="h-12 text-base"
            />
          </div>
          <div className="flex-1">
            <label className="text-sm font-bold text-gray-600 block mb-1">Data final</label>
            <Input
              type="date"
              value={value.end}
              onChange={(e) =>
                onChange({ type: 'custom', start: value.start, end: e.target.value })
              }
              className="h-12 text-base"
            />
          </div>
        </div>
      )}
    </div>
  )
}
