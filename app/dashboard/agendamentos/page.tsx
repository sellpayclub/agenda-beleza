import { getAppointments } from '@/lib/actions/appointments'
import { getEmployees } from '@/lib/actions/employees'
import { getServices } from '@/lib/actions/services'
import { AppointmentsClient } from './appointments-client'

export default async function AgendamentosPage() {
  const [appointments, employees, services] = await Promise.all([
    getAppointments(),
    getEmployees(),
    getServices(),
  ])

  return (
    <AppointmentsClient
      initialAppointments={appointments}
      employees={employees}
      services={services}
    />
  )
}

