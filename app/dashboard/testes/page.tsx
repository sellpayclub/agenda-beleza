import { getCurrentUser } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'
import { TestesClient } from './testes-client'

export default async function TestesPage() {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    redirect('/login')
  }

  return <TestesClient />
}
