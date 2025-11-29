import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/actions/auth'
import { format } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const user = currentUser as any

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'appointments'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const supabase = await createClient() as any

    let data: any[] = []
    let filename = ''
    let headers: string[] = []

    switch (type) {
      case 'appointments':
        let appointmentsQuery = supabase
          .from('appointments')
          .select(`
            *,
            client:clients(name, phone, email),
            employee:employees(name),
            service:services(name, price)
          `)
          .eq('tenant_id', user.tenant_id)
          .order('start_time', { ascending: false })

        if (startDate) {
          appointmentsQuery = appointmentsQuery.gte('start_time', startDate)
        }
        if (endDate) {
          appointmentsQuery = appointmentsQuery.lte('start_time', endDate)
        }

        const appointmentsResult = await appointmentsQuery
        const appointments = appointmentsResult.data || []

        headers = ['Data', 'Horário', 'Cliente', 'Telefone', 'Email', 'Serviço', 'Funcionário', 'Valor', 'Status', 'Pagamento']
        data = appointments.map((apt: any) => [
          format(new Date(apt.start_time), 'dd/MM/yyyy'),
          format(new Date(apt.start_time), 'HH:mm'),
          apt.client?.name || '',
          apt.client?.phone || '',
          apt.client?.email || '',
          apt.service?.name || '',
          apt.employee?.name || '',
          apt.service?.price || 0,
          apt.status,
          apt.payment_status,
        ])
        filename = `agendamentos-${format(new Date(), 'yyyy-MM-dd')}.csv`
        break

      case 'clients':
        const clientsResult = await supabase
          .from('clients')
          .select('*')
          .eq('tenant_id', user.tenant_id)
          .order('name')
        
        const clients = clientsResult.data || []

        headers = ['Nome', 'Telefone', 'Email', 'Visitas', 'Total Gasto', 'Última Visita', 'Observações']
        data = clients.map((client: any) => [
          client.name,
          client.phone,
          client.email || '',
          client.total_visits,
          client.total_spent,
          client.last_visit_at ? format(new Date(client.last_visit_at), 'dd/MM/yyyy') : '',
          client.notes || '',
        ])
        filename = `clientes-${format(new Date(), 'yyyy-MM-dd')}.csv`
        break

      case 'services':
        const servicesResult = await supabase
          .from('services')
          .select('*')
          .eq('tenant_id', user.tenant_id)
          .order('name')

        const services = servicesResult.data || []

        headers = ['Nome', 'Descrição', 'Preço', 'Duração (min)', 'Categoria', 'Ativo']
        data = services.map((service: any) => [
          service.name,
          service.description || '',
          service.price,
          service.duration_minutes,
          service.category || '',
          service.is_active ? 'Sim' : 'Não',
        ])
        filename = `servicos-${format(new Date(), 'yyyy-MM-dd')}.csv`
        break

      case 'employees':
        const employeesResult = await supabase
          .from('employees')
          .select('*')
          .eq('tenant_id', user.tenant_id)
          .order('name')

        const employees = employeesResult.data || []

        headers = ['Nome', 'Email', 'Telefone', 'Biografia', 'Ativo']
        data = employees.map((emp: any) => [
          emp.name,
          emp.email || '',
          emp.phone || '',
          emp.bio || '',
          emp.is_active ? 'Sim' : 'Não',
        ])
        filename = `funcionarios-${format(new Date(), 'yyyy-MM-dd')}.csv`
        break

      default:
        return NextResponse.json({ error: 'Invalid export type' }, { status: 400 })
    }

    // Generate CSV
    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        row.map((cell: any) => {
          // Escape commas and quotes in cell values
          const value = String(cell ?? '')
          if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        }).join(',')
      ),
    ].join('\n')

    // Add BOM for Excel compatibility with UTF-8
    const bom = '\ufeff'
    const csvWithBom = bom + csvContent

    return new NextResponse(csvWithBom, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
