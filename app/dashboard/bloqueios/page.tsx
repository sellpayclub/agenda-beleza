import { getScheduleBlocks } from '@/lib/actions/schedule-blocks'
import { getEmployees } from '@/lib/actions/employees'
import { BlocksClient } from './blocks-client'

export const metadata = {
  title: 'Bloqueios de Horário - Minha Agenda Bio',
}

export default async function BlocksPage() {
  const [blocks, employees] = await Promise.all([
    getScheduleBlocks(),
    getEmployees(),
  ])

  return <BlocksClient initialBlocks={blocks} employees={employees} />
}

