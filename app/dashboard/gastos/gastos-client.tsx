'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Wallet,
  TrendingDown,
  Package,
  Repeat,
  DollarSign,
  CheckCircle2,
  Clock,
  Search,
} from 'lucide-react'
import {
  createExpense,
  updateExpense,
  deleteExpense,
  toggleExpensePaid,
  type Expense,
  type ExpenseType,
  type ExpenseRecurrence,
  type ExpenseStats,
  type ExpenseInsert,
} from '@/lib/actions/expenses'
import { formatCurrency } from '@/lib/utils/format'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'

interface GastosClientProps {
  initialExpenses: Expense[]
  initialStats: ExpenseStats
  categories: string[]
}

const typeLabels: Record<ExpenseType, string> = {
  fixed: 'Fixo',
  variable: 'Variável',
  material: 'Material',
  other: 'Outro',
}

const typeIcons: Record<ExpenseType, React.ReactNode> = {
  fixed: <Repeat className="w-4 h-4" />,
  variable: <TrendingDown className="w-4 h-4" />,
  material: <Package className="w-4 h-4" />,
  other: <Wallet className="w-4 h-4" />,
}

const typeColors: Record<ExpenseType, string> = {
  fixed: 'bg-blue-100 text-blue-700 border-blue-200',
  variable: 'bg-orange-100 text-orange-700 border-orange-200',
  material: 'bg-purple-100 text-purple-700 border-purple-200',
  other: 'bg-gray-100 text-gray-700 border-gray-200',
}

const recurrenceLabels: Record<ExpenseRecurrence, string> = {
  once: 'Única vez',
  daily: 'Diário',
  weekly: 'Semanal',
  monthly: 'Mensal',
  yearly: 'Anual',
}

export function GastosClient({ initialExpenses, initialStats, categories }: GastosClientProps) {
  const [expenses, setExpenses] = useState(initialExpenses)
  const [stats, setStats] = useState(initialStats)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [formData, setFormData] = useState<ExpenseInsert>({
    name: '',
    description: '',
    amount: 0,
    type: 'variable',
    category: '',
    recurrence: 'once',
    expense_date: format(new Date(), 'yyyy-MM-dd'),
    is_paid: false,
  })

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.name.toLowerCase().includes(search.toLowerCase()) ||
      (expense.description || '').toLowerCase().includes(search.toLowerCase())
    const matchesType = filterType === 'all' || expense.type === filterType
    return matchesSearch && matchesType
  })

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      amount: 0,
      type: 'variable',
      category: '',
      recurrence: 'once',
      expense_date: format(new Date(), 'yyyy-MM-dd'),
      is_paid: false,
    })
    setEditingExpense(null)
  }

  const handleOpenDialog = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense)
      setFormData({
        name: expense.name,
        description: expense.description || '',
        amount: expense.amount,
        type: expense.type,
        category: expense.category || '',
        recurrence: expense.recurrence,
        expense_date: expense.expense_date,
        is_paid: expense.is_paid,
      })
    } else {
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || formData.amount <= 0) {
      toast.error('Preencha o nome e o valor')
      return
    }

    if (editingExpense) {
      const result = await updateExpense(editingExpense.id, formData)
      if (result.error) {
        toast.error(result.error)
      } else if (result.data) {
        toast.success('Despesa atualizada!')
        setExpenses(expenses.map(e => e.id === editingExpense.id ? result.data : e))
        setIsDialogOpen(false)
        resetForm()
      }
    } else {
      const result = await createExpense(formData)
      if (result.error) {
        toast.error(result.error)
      } else if (result.data) {
        toast.success('Despesa criada!')
        setExpenses([result.data, ...expenses])
        // Update stats
        setStats({
          ...stats,
          total: stats.total + formData.amount,
          [`total${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}`]: 
            (stats as any)[`total${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}`] + formData.amount,
          pendingTotal: formData.is_paid ? stats.pendingTotal : stats.pendingTotal + formData.amount,
          paidTotal: formData.is_paid ? stats.paidTotal + formData.amount : stats.paidTotal,
        })
        setIsDialogOpen(false)
        resetForm()
      }
    }
  }

  const handleDelete = async (id: string) => {
    const expense = expenses.find(e => e.id === id)
    if (!expense) return

    const result = await deleteExpense(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Despesa excluída!')
      setExpenses(expenses.filter(e => e.id !== id))
      // Update stats
      setStats({
        ...stats,
        total: stats.total - expense.amount,
        pendingTotal: expense.is_paid ? stats.pendingTotal : stats.pendingTotal - expense.amount,
        paidTotal: expense.is_paid ? stats.paidTotal - expense.amount : stats.paidTotal,
      })
    }
  }

  const handleTogglePaid = async (expense: Expense) => {
    const result = await toggleExpensePaid(expense.id, !expense.is_paid)
    if (result.error) {
      toast.error(result.error)
    } else if (result.data) {
      setExpenses(expenses.map(e => e.id === expense.id ? result.data : e))
      // Update stats
      if (expense.is_paid) {
        setStats({
          ...stats,
          paidTotal: stats.paidTotal - expense.amount,
          pendingTotal: stats.pendingTotal + expense.amount,
        })
      } else {
        setStats({
          ...stats,
          paidTotal: stats.paidTotal + expense.amount,
          pendingTotal: stats.pendingTotal - expense.amount,
        })
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Controle de Gastos</h1>
          <p className="text-gray-500">Gerencie suas despesas e custos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Despesa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingExpense ? 'Editar Despesa' : 'Nova Despesa'}
              </DialogTitle>
              <DialogDescription>
                {editingExpense ? 'Atualize os dados da despesa' : 'Adicione uma nova despesa ou custo'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Aluguel, Shampoo, etc."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input
                    type="date"
                    value={formData.expense_date}
                    onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v: ExpenseType) => setFormData({ ...formData, type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixo</SelectItem>
                      <SelectItem value="variable">Variável</SelectItem>
                      <SelectItem value="material">Material</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Recorrência</Label>
                  <Select
                    value={formData.recurrence}
                    onValueChange={(v: ExpenseRecurrence) => setFormData({ ...formData, recurrence: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">Única vez</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="yearly">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Categoria</Label>
                <Input
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Ex: Produtos, Infraestrutura, etc."
                  list="categories"
                />
                <datalist id="categories">
                  {categories.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalhes adicionais..."
                  rows={2}
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_paid"
                  checked={formData.is_paid}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_paid: !!checked })}
                />
                <Label htmlFor="is_paid" className="cursor-pointer">Já foi pago</Label>
              </div>

              <Button type="submit" className="w-full">
                {editingExpense ? 'Salvar Alterações' : 'Criar Despesa'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-full">
                <DollarSign className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total do Mês</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(stats.total)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Repeat className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Gastos Fixos</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalFixed)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <TrendingDown className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Gastos Variáveis</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalVariable)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Materiais</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalMaterial)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Paid vs Pending */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Pago</span>
              </div>
              <span className="text-xl font-bold text-green-600">
                {formatCurrency(stats.paidTotal)}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-600" />
                <span className="font-medium text-amber-800">Pendente</span>
              </div>
              <span className="text-xl font-bold text-amber-600">
                {formatCurrency(stats.pendingTotal)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar despesas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="fixed">Fixos</SelectItem>
                <SelectItem value="variable">Variáveis</SelectItem>
                <SelectItem value="material">Materiais</SelectItem>
                <SelectItem value="other">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Expenses List */}
      {filteredExpenses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wallet className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma despesa</h3>
            <p className="text-gray-500 text-center max-w-sm">
              Comece a registrar suas despesas para ter um controle financeiro completo.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredExpenses.map((expense) => (
            <Card key={expense.id} className={expense.is_paid ? 'opacity-60' : ''}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={expense.is_paid}
                      onCheckedChange={() => handleTogglePaid(expense)}
                    />
                    <div className={`p-2 rounded-lg ${typeColors[expense.type]}`}>
                      {typeIcons[expense.type]}
                    </div>
                    <div>
                      <p className={`font-medium ${expense.is_paid ? 'line-through text-gray-400' : ''}`}>
                        {expense.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={typeColors[expense.type]}>
                          {typeLabels[expense.type]}
                        </Badge>
                        {expense.recurrence !== 'once' && (
                          <Badge variant="outline">
                            <Repeat className="w-3 h-3 mr-1" />
                            {recurrenceLabels[expense.recurrence]}
                          </Badge>
                        )}
                        {expense.category && (
                          <span className="text-xs text-gray-500">{expense.category}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`font-bold ${expense.is_paid ? 'text-gray-400' : 'text-red-600'}`}>
                        {formatCurrency(expense.amount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(parseISO(expense.expense_date), "dd 'de' MMM", { locale: ptBR })}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenDialog(expense)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(expense.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

