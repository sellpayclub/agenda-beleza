'use client'

import { useState } from 'react'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { signUp } from '@/lib/actions/auth'
import { registerSchema, type RegisterInput } from '@/lib/validations'
import { toast } from 'sonner'
import { Loader2, Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('email', data.email)
      formData.append('password', data.password)
      formData.append('businessName', data.businessName)
      formData.append('phone', data.phone)
      
      const result: any = await signUp(formData)
      
      if (result?.error) {
        toast.error(result.error)
        setLoading(false)
      } else if (result?.requiresConfirmation) {
        toast.success(result.message || 'Conta criada! Verifique seu email.')
        setLoading(false)
        // Redirecionar para login após 2 segundos
        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
      } else {
        // Sucesso - o redirect vai acontecer automaticamente
        toast.success('Conta criada com sucesso!')
      }
    } catch (error: any) {
      console.error('Register error:', error)
      toast.error(error?.message || 'Erro ao criar conta')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 py-8">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-gray-950 to-gray-950" />
      
      <Card className="relative w-full max-w-md bg-gray-900/50 border-white/10 backdrop-blur">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500" />
          </div>
          <CardTitle className="text-2xl text-white">Criar sua conta</CardTitle>
          <CardDescription className="text-gray-400">
            Comece grátis por 14 dias. Sem cartão de crédito.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">Seu nome</Label>
              <Input
                id="name"
                placeholder="Maria Silva"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-red-400">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-gray-300">Nome do negócio</Label>
              <Input
                id="businessName"
                placeholder="Salão da Maria"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                {...register('businessName')}
              />
              {errors.businessName && (
                <p className="text-sm text-red-400">{errors.businessName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-300">WhatsApp</Label>
              <Input
                id="phone"
                placeholder="(11) 99999-9999"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                {...register('phone')}
              />
              {errors.phone && (
                <p className="text-sm text-red-400">{errors.phone.message}</p>
              )}
            </div>

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
              <Label htmlFor="password" className="text-gray-300">Senha</Label>
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
                'Criar conta'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Já tem uma conta?{' '}
              <Link href="/login" className="text-violet-400 hover:text-violet-300">
                Entrar
              </Link>
            </p>
          </div>

          <p className="mt-4 text-xs text-gray-500 text-center">
            Ao criar uma conta, você concorda com nossos{' '}
            <Link href="/terms" className="text-violet-400 hover:text-violet-300">
              Termos de Uso
            </Link>{' '}
            e{' '}
            <Link href="/privacy" className="text-violet-400 hover:text-violet-300">
              Política de Privacidade
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

