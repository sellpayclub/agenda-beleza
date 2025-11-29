import { addMinutes, format, isBefore, isAfter, parseISO, startOfDay, endOfDay, setHours, setMinutes } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import type { Employee, Service, Appointment, ScheduleBlock, TenantSettingsRow, WorkingHours } from '@/types'

interface AvailabilityParams {
  tenantId: string
  employeeId: string
  serviceId: string
  date: Date
}

interface TimeSlot {
  time: string
  datetime: Date
  available: boolean
}

// Get day of week as string
function getDayOfWeek(date: Date): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  return days[date.getDay()]
}

// Parse time string (HH:mm) to minutes since midnight
function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// Create date with specific time
function setTime(date: Date, timeString: string): Date {
  const [hours, minutes] = timeString.split(':').map(Number)
  const result = new Date(date)
  result.setHours(hours, minutes, 0, 0)
  return result
}

// Check if two time ranges overlap
function rangesOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 < end2 && start2 < end1
}

export async function getAvailableSlots(params: AvailabilityParams): Promise<TimeSlot[]> {
  const { tenantId, employeeId, serviceId, date } = params
  const supabase = createClient() as any
  const slots: TimeSlot[] = []

  // 1. Get employee data with working hours
  const { data: employee } = await supabase
    .from('employees')
    .select('*')
    .eq('id', employeeId)
    .single()

  if (!employee || !employee.is_active) {
    return []
  }

  // 2. Get service duration
  const { data: service } = await supabase
    .from('services')
    .select('*')
    .eq('id', serviceId)
    .single()

  if (!service || !service.is_active) {
    return []
  }

  // 3. Get tenant settings
  const { data: settings } = await supabase
    .from('tenant_settings')
    .select('*')
    .eq('tenant_id', tenantId)
    .single()

  const slotInterval = settings?.slot_interval_minutes || 30
  const minAdvanceHours = settings?.min_advance_hours || 2
  const maxAdvanceDays = settings?.max_advance_days || 30
  const bufferMinutes = settings?.buffer_between_appointments || 0

  // 4. Check if date is within allowed range
  const now = new Date()
  const minDate = addMinutes(now, minAdvanceHours * 60)
  const maxDate = addMinutes(now, maxAdvanceDays * 24 * 60)

  if (isBefore(date, startOfDay(minDate)) || isAfter(date, endOfDay(maxDate))) {
    return []
  }

  // 5. Get working hours for this day
  const dayOfWeek = getDayOfWeek(date)
  const workingHours = employee.working_hours as unknown as WorkingHours
  const daySchedule = workingHours[dayOfWeek]

  if (!daySchedule || !daySchedule.enabled) {
    return []
  }

  // 6. Get existing appointments for this employee on this date
  const dayStart = startOfDay(date)
  const dayEnd = endOfDay(date)

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*')
    .eq('employee_id', employeeId)
    .gte('start_time', dayStart.toISOString())
    .lte('start_time', dayEnd.toISOString())
    .in('status', ['pending', 'confirmed'])

  // 7. Get schedule blocks for this employee on this date
  const { data: blocks } = await supabase
    .from('schedule_blocks')
    .select('*')
    .eq('employee_id', employeeId)
    .or(`and(start_time.lte.${dayEnd.toISOString()},end_time.gte.${dayStart.toISOString()})`)

  // 8. Generate all possible slots
  const workStart = setTime(date, daySchedule.start)
  const workEnd = setTime(date, daySchedule.end)
  const serviceDuration = service.duration_minutes

  let currentSlot = new Date(workStart)

  while (isBefore(currentSlot, workEnd)) {
    const slotEnd = addMinutes(currentSlot, serviceDuration)
    
    // Check if slot fits within working hours
    if (isAfter(slotEnd, workEnd)) {
      break
    }

    // Check if slot is in the past (including minimum advance time)
    const isPast = isBefore(currentSlot, minDate)

    // Check if slot overlaps with break time
    let isBreak = false
    if (daySchedule.breakStart && daySchedule.breakEnd) {
      const breakStart = setTime(date, daySchedule.breakStart)
      const breakEnd = setTime(date, daySchedule.breakEnd)
      isBreak = rangesOverlap(currentSlot, slotEnd, breakStart, breakEnd)
    }

    // Check if slot overlaps with existing appointments
    const hasAppointmentConflict = (appointments || []).some(apt => {
      const aptStart = new Date(apt.start_time)
      const aptEnd = addMinutes(new Date(apt.end_time), bufferMinutes)
      return rangesOverlap(currentSlot, slotEnd, aptStart, aptEnd)
    })

    // Check if slot overlaps with schedule blocks
    const hasBlockConflict = (blocks || []).some(block => {
      const blockStart = new Date(block.start_time)
      const blockEnd = new Date(block.end_time)
      return rangesOverlap(currentSlot, slotEnd, blockStart, blockEnd)
    })

    const isAvailable = !isPast && !isBreak && !hasAppointmentConflict && !hasBlockConflict

    slots.push({
      time: format(currentSlot, 'HH:mm'),
      datetime: new Date(currentSlot),
      available: isAvailable,
    })

    currentSlot = addMinutes(currentSlot, slotInterval)
  }

  return slots
}

export async function getAvailableDates(
  tenantId: string,
  employeeId: string,
  serviceId: string,
  startDate: Date,
  endDate: Date
): Promise<Date[]> {
  const supabase = createClient() as any
  const availableDates: Date[] = []

  // Get employee working hours
  const { data: employee } = await supabase
    .from('employees')
    .select('working_hours')
    .eq('id', employeeId)
    .single()

  if (!employee) {
    return []
  }

  const workingHours = employee.working_hours as unknown as WorkingHours

  // Check each date
  let currentDate = new Date(startDate)
  while (isBefore(currentDate, endDate) || currentDate.getTime() === endDate.getTime()) {
    const dayOfWeek = getDayOfWeek(currentDate)
    const daySchedule = workingHours[dayOfWeek]

    if (daySchedule && daySchedule.enabled) {
      // Check if there are available slots on this day
      const slots = await getAvailableSlots({
        tenantId,
        employeeId,
        serviceId,
        date: currentDate,
      })

      if (slots.some(slot => slot.available)) {
        availableDates.push(new Date(currentDate))
      }
    }

    currentDate = addMinutes(currentDate, 24 * 60)
  }

  return availableDates
}

export async function checkSlotAvailability(
  tenantId: string,
  employeeId: string,
  serviceId: string,
  startTime: Date
): Promise<boolean> {
  const slots = await getAvailableSlots({
    tenantId,
    employeeId,
    serviceId,
    date: startTime,
  })

  const timeString = format(startTime, 'HH:mm')
  const slot = slots.find(s => s.time === timeString)

  return slot?.available || false
}

