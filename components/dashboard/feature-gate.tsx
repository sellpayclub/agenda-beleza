'use client'

import { useTenant } from '@/hooks/use-tenant'
import { hasFeature, FEATURES } from '@/lib/utils/plan-features'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock } from 'lucide-react'

interface FeatureGateProps {
  feature: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const { tenant } = useTenant()
  const plan = (tenant as any)?.subscription_plan
  const hasAccess = hasFeature(plan, feature)

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Lock className="w-6 h-6 text-amber-600" />
            <div>
              <CardTitle className="text-amber-900">Recurso não disponível no seu plano</CardTitle>
              <CardDescription className="text-amber-700">
                Este recurso está disponível apenas no Plano Completo
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-amber-800 mb-4">
            Faça upgrade para o Plano Completo e tenha acesso a todos os recursos, incluindo:
          </p>
          <ul className="list-disc list-inside text-amber-800 mb-4 space-y-1">
            <li>Funcionários ilimitados</li>
            <li>Dashboard e Analytics completos</li>
            <li>Controle financeiro total</li>
            <li>Relatórios exportáveis</li>
            <li>White-label e domínio próprio</li>
          </ul>
          <p className="text-amber-800 text-sm">
            Para fazer upgrade, acesse sua conta na LastLink.
          </p>
        </CardContent>
      </Card>
    )
  }

  return <>{children}</>
}



