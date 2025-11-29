'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  MoreHorizontal, 
  Trash2, 
  Clock, 
  Calendar,
  Coffee,
  Ban,
  User
} from 'lucide-react'
import { 
  createScheduleBlock, 
  deleteScheduleBlock,
  createLunchBlock,
  deleteLunchBlocks 
} from '@/lib/actions/schedule-blocks'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Employee, ScheduleBlock } from '@/types'

interface BlocksClientProps {
  initialBlocks: any[]
  employees: Employee[]
}

export function BlocksClient({ initialBlocks, employees }: BlocksClientProps) {
  const [blocks, setBlocks] = useState(initialBlocks)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLunchDialogOpen, setIsLunchDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<string>('')
  const [formData, setFormData] = useState({
    employeeId: '',
    date: '',
    startTime: '09:00',
    endTime: '18:00',
    reason: '',
    isFullDay: false,
  })
  const [lunchData, setLunchData] = useState({
    employeeId: '',
    startTime: '12:00',
    endTime: '13:00',
  })

  const filteredBlocks = selectedEmployee
    ? blocks.filter((b) => b.employee_id === selectedEmployee)
    : blocks

  const resetForm = () => {
    setFormData({
      employeeId: '',
      date: '',
      startTime: '09:00',
      endTime: '18:00',
      reason: '',
      isFullDay: false,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.employeeId || !formData.date) {
      toast.error('Selecione o funcionário e a data')
      return
    }

    const startDate = new Date(`${formData.date}T${formData.startTime}:00`)
    const endDate = new Date(`${formData.date}T${formData.endTime}:00`)

    if (formData.isFullDay) {
      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(23, 59, 59, 999)
    }

    const result = await createScheduleBlock({
      employeeId: formData.employeeId,
      startTime: startDate,
      endTime: endDate,
      reason: formData.reason || (formData.isFullDay ? 'Dia de folga' : 'Bloqueio de horário'),
    })

    if (result.error) {
      toast.error(result.error)
    } else if (result.data) {
      toast.success('Bloqueio criado com sucesso!')
      setBlocks([...blocks, result.data])
      setIsDialogOpen(false)
      resetForm()
    }
  }

  const handleDelete = async (id: string) => {
    const result = await deleteScheduleBlock(id)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Bloqueio excluído!')
      setBlocks(blocks.filter((b) => b.id !== id))
    }
  }

  const handleCreateLunchBlock = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!lunchData.employeeId) {
      toast.error('Selecione o funcionário')
      return
    }

    const result = await createLunchBlock(
      lunchData.employeeId,
      lunchData.startTime,
      lunchData.endTime
    )

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`Horário de almoço configurado! (${result.count} bloqueios criados)`)
      setIsLunchDialogOpen(false)
      // Reload blocks
      window.location.reload()
    }
  }

  const handleDeleteLunchBlocks = async (employeeId: string) => {
    const result = await deleteLunchBlocks(employeeId)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Horários de almoço removidos!')
      setBlocks(blocks.filter((b) => !(b.employee_id === employeeId && b.recurrence_rule === 'daily_lunch')))
    }
  }

  const getBlockTypeIcon = (block: any) => {
    if (block.recurrence_rule === 'daily_lunch') {
      return <Coffee className="w-4 h-4 text-orange-500" />
    }
    const start = parseISO(block.start_time)
    const end = parseISO(block.end_time)
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    if (hours >= 12) {
      return <Calendar className="w-4 h-4 text-red-500" />
    }
    return <Clock className="w-4 h-4 text-blue-500" />
  }

  const getBlockTypeBadge = (block: any) => {
    if (block.recurrence_rule === 'daily_lunch') {
      return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Almoço</Badge>
    }
    const start = parseISO(block.start_time)
    const end = parseISO(block.end_time)
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    if (hours >= 12) {
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Dia inteiro</Badge>
    }
    return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Horário</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bloqueios de Horário</h1>
          <p className="text-gray-500">Gerencie folgas, almoços e horários bloqueados</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isLunchDialogOpen} onOpenChange={setIsLunchDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Coffee className="w-4 h-4 mr-2" />
                Horário de Almoço
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configurar Horário de Almoço</DialogTitle>
                <DialogDescription>
                  Configure o horário de almoço para um funcionário. Isso criará bloqueios diários automáticos.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateLunchBlock} className="space-y-4">
                <div className="space-y-2">
                  <Label>Funcionário</Label>
                  <Select
                    value={lunchData.employeeId}
                    onValueChange={(v) => setLunchData({ ...lunchData, employeeId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o funcionário" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Início</Label>
                    <Input
                      type="time"
                      value={lunchData.startTime}
                      onChange={(e) => setLunchData({ ...lunchData, startTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fim</Label>
                    <Input
                      type="time"
                      value={lunchData.endTime}
                      onChange={(e) => setLunchData({ ...lunchData, endTime: e.target.value })}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Configurar Almoço
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Bloqueio
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Bloqueio</DialogTitle>
                <DialogDescription>
                  Bloqueie um horário ou dia inteiro para um funcionário
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Funcionário</Label>
                  <Select
                    value={formData.employeeId}
                    onValueChange={(v) => setFormData({ ...formData, employeeId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o funcionário" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isFullDay"
                    checked={formData.isFullDay}
                    onChange={(e) => setFormData({ ...formData, isFullDay: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="isFullDay">Dia inteiro (folga)</Label>
                </div>
                {!formData.isFullDay && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Início</Label>
                      <Input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fim</Label>
                      <Input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Motivo (opcional)</Label>
                  <Textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Ex: Consulta médica, viagem, etc."
                  />
                </div>
                <Button type="submit" className="w-full">
                  Criar Bloqueio
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Label className="whitespace-nowrap">Filtrar por funcionário:</Label>
            <Select value={selectedEmployee || "all"} onValueChange={(v) => setSelectedEmployee(v === "all" ? "" : v)}>
              <SelectTrigger className="max-w-xs">
                <SelectValue placeholder="Todos os funcionários" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os funcionários</SelectItem>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedEmployee && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedEmployee('')}
              >
                Limpar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Blocks List */}
      {filteredBlocks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Ban className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum bloqueio</h3>
            <p className="text-gray-500 text-center max-w-sm">
              Crie bloqueios para gerenciar folgas, horários de almoço e outros períodos indisponíveis.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBlocks.map((block) => (
            <Card key={block.id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getBlockTypeIcon(block)}
                    <div>
                      <CardTitle className="text-base">
                        {block.employee?.name || 'Funcionário'}
                      </CardTitle>
                      <CardDescription>
                        {format(parseISO(block.start_time), "dd 'de' MMMM", { locale: ptBR })}
                      </CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleDelete(block.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                      {block.recurrence_rule === 'daily_lunch' && (
                        <DropdownMenuItem
                          onClick={() => handleDeleteLunchBlocks(block.employee_id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remover todos os almoços
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Horário:</span>
                    <span className="text-sm font-medium">
                      {format(parseISO(block.start_time), 'HH:mm')} - {format(parseISO(block.end_time), 'HH:mm')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Tipo:</span>
                    {getBlockTypeBadge(block)}
                  </div>
                  {block.reason && (
                    <div className="pt-2 border-t">
                      <span className="text-sm text-gray-500">Motivo: </span>
                      <span className="text-sm">{block.reason}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

