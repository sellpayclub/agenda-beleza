'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, MoreHorizontal, Pencil, Trash2, Users, Search, Clock } from 'lucide-react'
import { createEmployee, updateEmployee, deleteEmployee, toggleEmployeeStatus } from '@/lib/actions/employees'
import { getDayName } from '@/lib/utils/format'
import { toast } from 'sonner'
import type { Employee, Service, WorkingHours } from '@/types'
import { useTenant } from '@/hooks/use-tenant'
import { hasFeature, FEATURES } from '@/lib/utils/plan-features'
import { FeatureGate } from '@/components/dashboard/feature-gate'

interface EmployeesClientProps {
  initialEmployees: Employee[]
  services: Service[]
}

const defaultWorkingHours: WorkingHours = {
  monday: { enabled: true, start: '09:00', end: '18:00' },
  tuesday: { enabled: true, start: '09:00', end: '18:00' },
  wednesday: { enabled: true, start: '09:00', end: '18:00' },
  thursday: { enabled: true, start: '09:00', end: '18:00' },
  friday: { enabled: true, start: '09:00', end: '18:00' },
  saturday: { enabled: true, start: '09:00', end: '13:00' },
  sunday: { enabled: false, start: '09:00', end: '18:00' },
}

export function EmployeesClient({ initialEmployees, services }: EmployeesClientProps) {
  const [employees, setEmployees] = useState(initialEmployees)
  const [search, setSearch] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    is_active: true,
    working_hours: defaultWorkingHours,
  })

  const filteredEmployees = employees.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  )

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      bio: '',
      is_active: true,
      working_hours: defaultWorkingHours,
    })
    setEditingEmployee(null)
  }

  const handleOpenDialog = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee)
      setFormData({
        name: employee.name,
        email: employee.email || '',
        phone: employee.phone || '',
        bio: employee.bio || '',
        is_active: employee.is_active,
        working_hours: (employee.working_hours as WorkingHours) || defaultWorkingHours,
      })
    } else {
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const data = {
      name: formData.name,
      email: formData.email || null,
      phone: formData.phone || null,
      bio: formData.bio || null,
      is_active: formData.is_active,
      working_hours: formData.working_hours as any,
    }

    if (editingEmployee) {
      const result = await updateEmployee(editingEmployee.id, data)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Funcionário atualizado com sucesso')
        setEmployees(employees.map((e) => (e.id === editingEmployee.id ? { ...e, ...data } : e)))
        setIsDialogOpen(false)
        resetForm()
      }
    } else {
      const result: any = await createEmployee(data)
      if (result.error) {
        toast.error(result.error)
      } else if (result.data) {
        toast.success('Funcionário criado com sucesso')
        setEmployees([...employees, result.data])
        setIsDialogOpen(false)
        resetForm()
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este funcionário?')) return

    const result = await deleteEmployee(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Funcionário excluído com sucesso')
      setEmployees(employees.filter((e) => e.id !== id))
    }
  }

  const handleToggleStatus = async (id: string) => {
    const result = await toggleEmployeeStatus(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      setEmployees(employees.map((e) => (e.id === id ? { ...e, is_active: !e.is_active } : e)))
    }
  }

  const updateWorkingHours = (day: string, field: string, value: any) => {
    setFormData({
      ...formData,
      working_hours: {
        ...formData.working_hours,
        [day]: {
          ...formData.working_hours[day],
          [field]: value,
        },
      },
    })
  }

  return (
    <FeatureGate feature={FEATURES.EMPLOYEES}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Funcionários</h1>
          <p className="text-gray-500">Gerencie sua equipe</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600"
              onClick={() => handleOpenDialog()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Funcionário
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEmployee ? 'Editar Funcionário' : 'Novo Funcionário'}
              </DialogTitle>
              <DialogDescription>
                {editingEmployee
                  ? 'Atualize as informações do funcionário'
                  : 'Preencha as informações do novo funcionário'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="info">Informações</TabsTrigger>
                  <TabsTrigger value="hours">Horários</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nome completo"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Biografia</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Especialidades, experiência..."
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_active">Ativo</Label>
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_active: checked })
                      }
                    />
                  </div>
                </TabsContent>

                <TabsContent value="hours" className="space-y-4 mt-4">
                  <p className="text-sm text-gray-500 mb-4">
                    Configure os horários de trabalho para cada dia da semana
                  </p>
                  {Object.entries(formData.working_hours).map(([day, hours]) => (
                    <div
                      key={day}
                      className="flex items-center gap-4 p-3 rounded-lg bg-gray-50"
                    >
                      <Switch
                        checked={hours.enabled}
                        onCheckedChange={(checked) =>
                          updateWorkingHours(day, 'enabled', checked)
                        }
                      />
                      <span className="w-24 font-medium">{getDayName(day)}</span>
                      {hours.enabled ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            type="time"
                            value={hours.start}
                            onChange={(e) =>
                              updateWorkingHours(day, 'start', e.target.value)
                            }
                            className="w-28"
                          />
                          <span className="text-gray-500">até</span>
                          <Input
                            type="time"
                            value={hours.end}
                            onChange={(e) =>
                              updateWorkingHours(day, 'end', e.target.value)
                            }
                            className="w-28"
                          />
                        </div>
                      ) : (
                        <span className="text-gray-400">Folga</span>
                      )}
                    </div>
                  ))}
                </TabsContent>
              </Tabs>

              <div className="flex gap-2 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsDialogOpen(false)
                    resetForm()
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-violet-500 to-pink-500"
                >
                  {editingEmployee ? 'Salvar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar funcionários..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filteredEmployees.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Nenhum funcionário cadastrado
            </h3>
            <p className="text-gray-500 mb-4">Comece adicionando sua equipe</p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Funcionário
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEmployees.map((employee) => {
            const workingHours = employee.working_hours as WorkingHours
            const activeDays = Object.entries(workingHours || {}).filter(
              ([_, hours]) => hours.enabled
            ).length

            return (
              <Card key={employee.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={employee.avatar_url || undefined} />
                        <AvatarFallback className="bg-violet-100 text-violet-700 text-lg">
                          {employee.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{employee.name}</h3>
                        {employee.email && (
                          <p className="text-sm text-gray-500">{employee.email}</p>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenDialog(employee)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(employee.id)}>
                          {employee.is_active ? 'Desativar' : 'Ativar'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(employee.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  {employee.bio && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{employee.bio}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{activeDays} dias/semana</span>
                    </div>
                    <Badge
                      className={
                        employee.is_active
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-100 text-gray-700'
                      }
                    >
                      {employee.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
      </div>
    </FeatureGate>
  )
}

