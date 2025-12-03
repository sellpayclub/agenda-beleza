'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { signIn } from '@/lib/actions/auth'
import { loginSchema, type LoginInput } from '@/lib/validations'
import { toast } from 'sonner'
import { Loader2, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('email', data.email)
      formData.append('password', data.password)
      
      const result = await signIn(formData)
      
      if (result?.error) {
        toast.error(result.error)
        setLoading(false)
      } else {
        // Se não houver erro, o redirect vai acontecer
        // Não precisa setar loading para false pois vai redirecionar
        router.push('/dashboard')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(error?.message || 'Erro ao fazer login')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-gray-950 to-gray-950" />
      
      <Card className="relative w-full max-w-md bg-gray-900/50 border-white/10 backdrop-blur">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            {/* Logo Agendify */}
            <div className="relative w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center overflow-hidden">
              <svg
                width="24"
                height="24"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute"
              >
                <rect
                  x="2"
                  y="4"
                  width="16"
                  height="14"
                  rx="2"
                  fill="url(#calendarGradientLogin)"
                />
                <rect x="4" y="2" width="3" height="2" rx="1" fill="url(#calendarGradientLogin)" />
                <rect x="9" y="2" width="3" height="2" rx="1" fill="url(#calendarGradientLogin)" />
                <path
                  d="M6 10L8.5 12.5L14 7"
                  stroke="#1e3a8a"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <defs>
                  <linearGradient id="calendarGradientLogin" x1="0" y1="0" x2="0" y2="20">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="font-bold text-white text-xl">Agendify</span>
          </div>
          <CardTitle className="text-2xl text-white">Bem-vindo de volta</CardTitle>
          <CardDescription className="text-gray-400">
            Entre na sua conta para continuar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-300">Senha</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-violet-400 hover:text-violet-300"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Não tem uma conta?{' '}
              <Link href="/register" className="text-violet-400 hover:text-violet-300">
                Criar conta
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

