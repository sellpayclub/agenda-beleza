'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Scissors } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format'
import type { TopService } from '@/types'

interface TopServicesProps {
  data: TopService[]
}

export function TopServices({ data }: TopServicesProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scissors className="h-5 w-5 text-pink-600" />
            Serviços Mais Populares
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Scissors className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500">Nenhum serviço realizado este mês</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const maxCount = Math.max(...data.map(s => s.count))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scissors className="h-5 w-5 text-pink-600" />
          Serviços Mais Populares
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((service, index) => (
          <div key={service.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500">
                  #{index + 1}
                </span>
                <span className="font-medium text-gray-900">{service.name}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-gray-900">
                  {service.count} atendimentos
                </span>
                <span className="text-sm text-gray-500 ml-2">
                  {formatCurrency(service.revenue)}
                </span>
              </div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500"
                style={{ width: `${(service.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

