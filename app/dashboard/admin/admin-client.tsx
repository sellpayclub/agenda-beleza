'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Shield,
  Users,
  Building2,
  Calendar,
  Search,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Trash2,
  Edit,
  Eye,
  RefreshCw,
  ExternalLink,
  Plus,
} from 'lucide-react'
import {
  updateTenantSubscription,
  updateTenantData,
  deleteTenant,
  searchTenants,
  createTenant,
} from '@/lib/actions/admin'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'

interface AdminStats {
  total: number
  active: number
  trial: number
  cancelled: number
  expired: number
  totalAppointments: number
  totalClients: number
}

interface Tenant {
  id: string
  name: string
  slug: string
  email: string | null
  phone: string | null
  subscription_status: string
  subscription_plan: string | null
  subscription_expires_at: string | null
  created_at: string
  logo_url: string | null
}

interface AdminClientProps {
  initialStats: AdminStats | null
  initialTenants: Tenant[]
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  active: {
    label: 'Ativo',
    color: 'bg-green-100 text-green-700',
    icon: <CheckCircle className="w-4 h-4" />,
  },
  trial: {
    label: 'Trial',
    color: 'bg-blue-100 text-blue-700',
    icon: <Clock className="w-4 h-4" />,
  },
  cancelled: {
    label: 'Cancelado',
    color: 'bg-red-100 text-red-700',
    icon: <XCircle className="w-4 h-4" />,
  },
  expired: {
    label: 'Expirado',
    color: 'bg-amber-100 text-amber-700',
    icon: <AlertTriangle className="w-4 h-4" />,
  },
}

export function AdminClient({ initialStats, initialTenants }: AdminClientProps) {
  const [stats] = useState(initialStats)
  const [tenants, setTenants] = useState(initialTenants)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isSearching, setIsSearching] = useState(false)
  
  // Edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null)
  const [editForm, setEditForm] = useState({ name: '', slug: '', email: '', phone: '' })
  
  // Status dialog
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [statusTenant, setStatusTenant] = useState<Tenant | null>(null)
  const [newStatus, setNewStatus] = useState('')
  const [newPlan, setNewPlan] = useState('')
  
  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingTenant, setDeletingTenant] = useState<Tenant | null>(null)
  
  // Create dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createForm, setCreateForm] = useState({
    businessName: '',
    email: '',
    phone: '',
    password: '',
    adminName: '',
    status: 'trial' as 'trial' | 'active' | 'cancelled' | 'expired',
    plan: 'start',
  })
  const [creating, setCreating] = useState(false)

  const handleSearch = async () => {
    setIsSearching(true)
    try {
      const results = await searchTenants(search, filterStatus)
      setTenants(results)
    } catch (error) {
      toast.error('Erro ao buscar tenants')
    } finally {
      setIsSearching(false)
    }
  }

  const handleEditClick = (tenant: Tenant) => {
    setEditingTenant(tenant)
    setEditForm({
      name: tenant.name,
      slug: tenant.slug,
      email: tenant.email || '',
      phone: tenant.phone || '',
    })
    setEditDialogOpen(true)
  }

  const handleEditSubmit = async () => {
    if (!editingTenant) return

    const result = await updateTenantData(editingTenant.id, editForm)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Dados atualizados!')
      setTenants(tenants.map(t => 
        t.id === editingTenant.id 
          ? { ...t, ...editForm } 
          : t
      ))
      setEditDialogOpen(false)
    }
  }

  const handleStatusClick = (tenant: Tenant) => {
    setStatusTenant(tenant)
    setNewStatus(tenant.subscription_status)
    setNewPlan(tenant.subscription_plan || 'trial')
    setStatusDialogOpen(true)
  }

  const handleStatusSubmit = async () => {
    if (!statusTenant) return

    const result = await updateTenantSubscription(
      statusTenant.id, 
      newStatus as 'trial' | 'active' | 'cancelled' | 'expired',
      undefined,
      newPlan
    )
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Status e plano atualizados!')
      setTenants(tenants.map(t => 
        t.id === statusTenant.id 
          ? { ...t, subscription_status: newStatus, subscription_plan: newPlan } 
          : t
      ))
      setStatusDialogOpen(false)
    }
  }

  const handleDeleteClick = (tenant: Tenant) => {
    setDeletingTenant(tenant)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingTenant) return

    const result = await deleteTenant(deletingTenant.id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Tenant excluído!')
      setTenants(tenants.filter(t => t.id !== deletingTenant.id))
      setDeleteDialogOpen(false)
    }
  }

  const handleCreateClick = () => {
    setCreateForm({
      businessName: '',
      email: '',
      phone: '',
      password: '',
      adminName: '',
      status: 'trial',
      plan: 'start',
    })
    setCreateDialogOpen(true)
  }

  const handleCreateSubmit = async () => {
    if (!createForm.businessName || !createForm.email || !createForm.phone || !createForm.password || !createForm.adminName) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    setCreating(true)
    try {
      const result = await createTenant(createForm)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Tenant criado com sucesso!')
        setCreateDialogOpen(false)
        // Recarregar lista de tenants
        const results = await searchTenants(search, filterStatus)
        setTenants(results)
      }
    } catch (error) {
      toast.error('Erro ao criar tenant')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-violet-500 to-pink-500 rounded-xl">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Painel Admin</h1>
          <p className="text-gray-500">Gerencie todos os tenants do sistema</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-violet-100 rounded-full">
                  <Building2 className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Tenants</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ativos</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Trial</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.trial}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-full">
                  <Calendar className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Agendamentos</p>
                  <p className="text-2xl font-bold">{stats.totalAppointments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, email ou slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="cancelled">Cancelados</SelectItem>
                <SelectItem value="expired">Expirados</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span className="ml-2">Buscar</span>
            </Button>
            </div>
            <Button onClick={handleCreateClick} className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600">
              <Plus className="w-4 h-4 mr-2" />
              Criar Novo Tenant
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tenants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tenants ({tenants.length})</CardTitle>
          <CardDescription>Lista de todos os negócios cadastrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Negócio</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      Nenhum tenant encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  tenants.map((tenant) => {
                    const status = statusConfig[tenant.subscription_status] || statusConfig.trial
                    return (
                      <TableRow key={tenant.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {tenant.logo_url ? (
                              <img
                                src={tenant.logo_url}
                                alt={tenant.name}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                                <span className="text-violet-600 font-bold">
                                  {tenant.name.charAt(0)}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{tenant.name}</p>
                              <p className="text-sm text-gray-500">/{tenant.slug}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{tenant.email || '-'}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge className={`${status.color} gap-1 w-fit`}>
                              {status.icon}
                              {status.label}
                            </Badge>
                            {tenant.subscription_plan && (
                              <Badge variant="outline" className="w-fit text-xs">
                                {tenant.subscription_plan === 'start' ? 'Plano Start' : 
                                 tenant.subscription_plan === 'completo' ? 'Plano Completo' : 
                                 'Trial'}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(parseISO(tenant.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <a
                                  href={`/b/${tenant.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center"
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Ver página pública
                                </a>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEditClick(tenant)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Editar dados
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusClick(tenant)}>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Alterar status
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(tenant)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tenant</DialogTitle>
            <DialogDescription>
              Atualize os dados do negócio
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={editForm.slug}
                onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditSubmit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Assinatura</DialogTitle>
            <DialogDescription>
              Atualize o status e plano para {statusTenant?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Status da Assinatura</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                  <SelectItem value="expired">Expirado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Plano</Label>
              <Select value={newPlan} onValueChange={setNewPlan}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="start">Plano Start (R$ 9,90)</SelectItem>
                  <SelectItem value="completo">Plano Completo (R$ 19,90)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleStatusSubmit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Novo Tenant</DialogTitle>
            <DialogDescription>
              Crie um novo negócio no sistema com usuário admin inicial
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Nome do Negócio *</Label>
                <Input
                  id="businessName"
                  value={createForm.businessName}
                  onChange={(e) => setCreateForm({ ...createForm, businessName: e.target.value })}
                  placeholder="Ex: Salão de Beleza"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminName">Nome do Admin *</Label>
                <Input
                  id="adminName"
                  value={createForm.adminName}
                  onChange={(e) => setCreateForm({ ...createForm, adminName: e.target.value })}
                  placeholder="Ex: João Silva"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="admin@exemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  placeholder="11999999999"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha Inicial *</Label>
              <Input
                id="password"
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                placeholder="Senha para login"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status Inicial</Label>
                <Select value={createForm.status} onValueChange={(v: any) => setCreateForm({ ...createForm, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                    <SelectItem value="expired">Expirado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan">Plano Inicial</Label>
                <Select value={createForm.plan} onValueChange={(v) => setCreateForm({ ...createForm, plan: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="start">Plano Start (R$ 9,90)</SelectItem>
                    <SelectItem value="completo">Plano Completo (R$ 19,90)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateSubmit} disabled={creating}>
              {creating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Tenant'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Tenant?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{deletingTenant?.name}</strong>?
              Esta ação não pode ser desfeita e todos os dados serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

