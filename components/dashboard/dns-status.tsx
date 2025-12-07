'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, AlertCircle, Clock, RefreshCw, Copy } from 'lucide-react'
import { toast } from 'sonner'

interface DNSStatusProps {
  domain: string | null
}

type DNSStatus = 'configured' | 'pending' | 'invalid' | 'error' | 'checking' | null

export function DNSStatus({ domain }: DNSStatusProps) {
  const [status, setStatus] = useState<DNSStatus>(null)
  const [message, setMessage] = useState('')
  const [details, setDetails] = useState<{ type: string; value: string } | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const verifyDNS = async () => {
    if (!domain) {
      toast.error('Configure um domínio primeiro')
      return
    }

    setIsChecking(true)
    setStatus('checking')
    setMessage('Verificando DNS...')

    try {
      const response = await fetch('/api/domain/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      })

      const data = await response.json()

      setStatus(data.status)
      setMessage(data.message)
      setDetails(data.details || null)

      if (data.status === 'configured') {
        toast.success('DNS configurado corretamente!')
      } else if (data.status === 'invalid') {
        toast.warning('DNS não está configurado corretamente')
      } else if (data.status === 'pending') {
        toast.info('DNS ainda não configurado')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Erro ao verificar DNS')
      toast.error('Erro ao verificar DNS')
    } finally {
      setIsChecking(false)
    }
  }

  if (!domain) {
    return null
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'configured':
        return {
          icon: CheckCircle,
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          badge: 'bg-emerald-100 text-emerald-700',
          label: 'Configurado',
        }
      case 'pending':
        return {
          icon: Clock,
          color: 'text-amber-600',
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          badge: 'bg-amber-100 text-amber-700',
          label: 'Pendente',
        }
      case 'invalid':
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-200',
          badge: 'bg-red-100 text-red-700',
          label: 'Inválido',
        }
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-200',
          badge: 'bg-red-100 text-red-700',
          label: 'Erro',
        }
      case 'checking':
        return {
          icon: RefreshCw,
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          badge: 'bg-blue-100 text-blue-700',
          label: 'Verificando...',
        }
      default:
        return null
    }
  }

  const statusConfig = getStatusConfig()

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-gray-900">Status do DNS</h4>
          {statusConfig && (
            <Badge className={statusConfig.badge}>
              {statusConfig.label}
            </Badge>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={verifyDNS}
          disabled={isChecking}
        >
          {isChecking ? (
            <>
              <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
              Verificando...
            </>
          ) : (
            <>
              <RefreshCw className="w-3 h-3 mr-2" />
              Verificar DNS
            </>
          )}
        </Button>
      </div>

      {status && status !== 'checking' && (
        <Card className={`${statusConfig?.bg} ${statusConfig?.border} border-2`}>
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              {statusConfig && (
                <statusConfig.icon className={`w-5 h-5 ${statusConfig.color} flex-shrink-0 mt-0.5`} />
              )}
              <div className="flex-1 space-y-2">
                <p className={`text-sm font-medium ${statusConfig?.color}`}>
                  {message}
                </p>
                {details && (
                  <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">Tipo:</span>
                        <Badge variant="outline" className="text-xs">{details.type}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">Valor:</span>
                        <code className="px-2 py-1 bg-gray-100 rounded text-xs flex-1">
                          {details.value}
                        </code>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                          onClick={() => {
                            navigator.clipboard.writeText(details.value)
                            toast.success('Valor copiado!')
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                {status === 'pending' && (
                  <p className="text-xs text-gray-600 mt-2">
                    A propagação DNS pode levar de 5 minutos a 48 horas. Tente novamente mais tarde.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!status && (
        <Card className="bg-gray-50 border border-gray-200">
          <CardContent className="pt-4">
            <p className="text-sm text-gray-600">
              Clique em "Verificar DNS" para checar se seu domínio está configurado corretamente.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}









