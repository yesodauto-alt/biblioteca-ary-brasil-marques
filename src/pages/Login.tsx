import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookMarked, LogIn, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { signIn, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  if (isAuthenticated) {
    navigate('/', { replace: true })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    if (!email || !password) {
      setErrorMessage('Por favor, preencha o e-mail e a senha.')
      setIsSubmitting(false)
      return
    }

    const { error } = await signIn(email, password)

    if (error) {
      const msg = error?.message || ''
      setErrorMessage(
        msg.includes('inativa') ? msg : 'E-mail ou senha incorretos. Tente novamente.',
      )
      setIsSubmitting(false)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl border border-[#D4D4D4] shadow-elevation p-8 space-y-6 animate-fade-in">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-[#1F5C8B] text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <BookMarked className="w-10 h-10" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Biblioteca do Centro Espírita
          </h1>
          <p className="text-gray-600 text-base">Acesso ao Sistema de Gestão</p>
        </div>

        {errorMessage && (
          <div className="p-4 bg-[#C62828]/10 border border-[#C62828] text-[#C62828] rounded-lg flex items-start gap-3 font-semibold text-base">
            <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-lg font-semibold text-gray-800">
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu.email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-h-[52px] h-[52px] text-lg px-4 border-[#D4D4D4] focus-visible:ring-2 focus-visible:ring-[#1F5C8B]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-lg font-semibold text-gray-800">
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="min-h-[52px] h-[52px] text-lg px-4 border-[#D4D4D4] focus-visible:ring-2 focus-visible:ring-[#1F5C8B]"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full min-h-[52px] h-[52px] bg-[#1F5C8B] hover:bg-[#174A70] text-white font-bold text-lg rounded-lg flex items-center justify-center gap-3 shadow-md"
          >
            <LogIn className="w-6 h-6" />
            <span>{isSubmitting ? 'Entrando...' : 'Entrar'}</span>
          </Button>
        </form>

        <p className="text-center text-gray-600 text-sm border-t border-[#D4D4D4] pt-4">
          Este sistema é de uso interno dos voluntários.
        </p>
      </div>
    </div>
  )
}
