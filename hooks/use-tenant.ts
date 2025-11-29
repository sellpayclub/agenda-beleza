'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { Tenant, User } from '@/types'

export function useTenant() {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient() as any

    async function fetchUserAndTenant() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (!authUser) {
          setLoading(false)
          return
        }

        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (!profile) {
          setLoading(false)
          return
        }

        setUser(profile)

        const { data: tenantData } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', profile.tenant_id)
          .single()

        setTenant(tenantData)
      } catch (error) {
        console.error('Error fetching tenant:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndTenant()
  }, [])

  return { tenant, user, loading }
}

export function useRealtimeAppointments(tenantId: string) {
  const [appointments, setAppointments] = useState<any[]>([])
  const supabase = createClient() as any

  useEffect(() => {
    // Initial fetch
    const fetchAppointments = async () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const { data } = await supabase
        .from('appointments')
        .select(`
          *,
          client:clients (*),
          employee:employees (*),
          service:services (*)
        `)
        .eq('tenant_id', tenantId)
        .gte('start_time', today.toISOString())
        .order('start_time')

      if (data) {
        setAppointments(data)
      }
    }

    fetchAppointments()

    // Subscribe to changes
    const channel = supabase
      .channel('appointments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `tenant_id=eq.${tenantId}`,
        },
        () => {
          // Refetch on any change
          fetchAppointments()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [tenantId, supabase])

  return appointments
}
