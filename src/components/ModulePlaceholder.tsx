import { LucideIcon } from 'lucide-react'

interface ModulePlaceholderProps {
  title: string
  description: string
  icon: LucideIcon
  message: string
}

export function ModulePlaceholder({
  title,
  description,
  icon: Icon,
  message,
}: ModulePlaceholderProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-lg text-gray-600 leading-relaxed">{description}</p>
      </div>

      <div className="border-2 border-dashed border-[#A9A9A9] rounded-xl bg-white p-12 text-center min-h-[360px] flex flex-col items-center justify-center space-y-4 shadow-sm">
        <div className="w-20 h-20 rounded-full bg-[#1F5C8B]/10 flex items-center justify-center text-[#1F5C8B]">
          <Icon className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
        <p className="text-[#4A4A4A] text-lg max-w-md">{message}</p>
      </div>
    </div>
  )
}
