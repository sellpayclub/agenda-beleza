import { getEmployees } from '@/lib/actions/employees'
import { getServices } from '@/lib/actions/services'
import { EmployeesClient } from './employees-client'

export default async function FuncionariosPage() {
  const [employees, services] = await Promise.all([
    getEmployees(),
    getServices(),
  ])

  return <EmployeesClient initialEmployees={employees} services={services} />
}

