'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Calendar as CalendarIcon,
  User,
  Scissors,
  Loader2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { createAppointment } from '@/lib/actions/appointments'
import { getAvailableSlots } from '@/lib/services/availability'
import { formatCurrency, formatDuration, formatPhone, formatDate } from '@/lib/utils/format'
import { format, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import type { Service, Employee, TimeSlot } from '@/types'

interface BookingPageProps {
  tenant: any
}

type BookingStep = 'service' | 'employee' | 'datetime' | 'confirm' | 'success'

export function BookingPage({ tenant }: BookingPageProps) {
  const [step, setStep] = useState<BookingStep>('service')
  const [services, setServices] = useState<Service[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [clientData, setClientData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
  })
  const [appointmentId, setAppointmentId] = useState<string | null>(null)

  const supabase = createClient()
  const settings = Array.isArray(tenant.tenant_settings)
    ? tenant.tenant_settings[0]
    : tenant.tenant_settings

  // Load services
  useEffect(() => {
    async function loadServices() {
      const { data } = await supabase
        .from('services')
        .select('*')
        .eq('tenant_id', tenant.id)
        .eq('is_active', true)
        .order('name')

      if (data) {
        setServices(data)
      }
    }
    loadServices()
  }, [tenant.id, supabase])

  // Load employees for selected service
  useEffect(() => {
    if (!selectedService) return

    const serviceId = selectedService.id

    async function loadEmployees() {
      const { data } = await supabase
        .from('employee_services')
        .select('employees(*)')
        .eq('service_id', serviceId)

      if (data) {
        const emps = data
          .map((d: any) => d.employees)
          .filter((e: any) => e && e.is_active)
        
        if (emps.length === 0) {
          // If no specific employees, load all active employees
          const { data: allEmployees } = await supabase
            .from('employees')
            .select('*')
            .eq('tenant_id', tenant.id)
            .eq('is_active', true)
            .order('name')

          setEmployees(allEmployees || [])
        } else {
          setEmployees(emps)
        }
      }
    }
    loadEmployees()
  }, [selectedService, tenant.id, supabase])

  // Load available slots when date changes
  useEffect(() => {
    if (!selectedDate || !selectedEmployee || !selectedService) return

    const employeeId = selectedEmployee.id
    const serviceId = selectedService.id
    const date = selectedDate

    async function loadSlots() {
      setLoadingSlots(true)
      try {
        const slots = await getAvailableSlots({
          tenantId: tenant.id,
          employeeId,
          serviceId,
          date,
        })
        setAvailableSlots(slots)
      } catch (error) {
        console.error('Error loading slots:', error)
        setAvailableSlots([])
      } finally {
        setLoadingSlots(false)
      }
    }
    loadSlots()
  }, [selectedDate, selectedEmployee, selectedService, tenant.id])

  const handleSelectService = (service: Service) => {
    setSelectedService(service)
    setStep('employee')
  }

  const handleSelectEmployee = (employee: Employee) => {
    setSelectedEmployee(employee)
    setStep('datetime')
  }

  const handleSelectTime = (time: string) => {
    setSelectedTime(time)
    setStep('confirm')
  }

  const handleBack = () => {
    switch (step) {
      case 'employee':
        setStep('service')
        setSelectedService(null)
        break
      case 'datetime':
        setStep('employee')
        setSelectedEmployee(null)
        setSelectedDate(null)
        break
      case 'confirm':
        setStep('datetime')
        setSelectedTime(null)
        break
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedService || !selectedEmployee || !selectedDate || !selectedTime) return

    setSubmitting(true)

    try {
      const [hours, minutes] = selectedTime.split(':').map(Number)
      const startTime = new Date(selectedDate)
      startTime.setHours(hours, minutes, 0, 0)

      const result: any = await createAppointment({
        tenantId: tenant.id,
        clientData: {
          name: clientData.name,
          phone: clientData.phone,
          email: clientData.email || undefined,
        },
        employeeId: selectedEmployee.id,
        serviceId: selectedService.id,
        startTime,
        notes: clientData.notes || undefined,
      })

      if (result.error) {
        toast.error(result.error)
      } else if (result.data) {
        setAppointmentId(result.data.id)
        setStep('success')
      }
    } catch (error) {
      toast.error('Erro ao criar agendamento')
    } finally {
      setSubmitting(false)
    }
  }

  const minDate = new Date()
  const maxDate = addDays(new Date(), settings?.max_advance_days || 30)

  return (
    <div
      className="min-h-screen"
      style={{
        background: `linear-gradient(135deg, ${tenant.primary_color}10 0%, ${tenant.secondary_color}10 100%)`,
      }}
    >
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {tenant.logo_url ? (
              <img
                src={tenant.logo_url}
                alt={tenant.name}
                className="w-12 h-12 rounded-xl object-cover"
              />
            ) : (
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl"
                style={{ backgroundColor: tenant.primary_color }}
              >
                {tenant.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="font-bold text-lg text-gray-900">{tenant.name}</h1>
              {tenant.description && (
                <p className="text-sm text-gray-500 line-clamp-1">{tenant.description}</p>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Progress Steps */}
        {step !== 'success' && (
          <div className="flex items-center justify-center gap-2 mb-6">
            {['service', 'employee', 'datetime', 'confirm'].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    step === s
                      ? 'text-white'
                      : ['service', 'employee', 'datetime', 'confirm'].indexOf(step) > i
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                  style={step === s ? { backgroundColor: tenant.primary_color } : undefined}
                >
                  {['service', 'employee', 'datetime', 'confirm'].indexOf(step) > i ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                {i < 3 && (
                  <div
                    className={`w-8 h-0.5 ${
                      ['service', 'employee', 'datetime', 'confirm'].indexOf(step) > i
                        ? 'bg-emerald-200'
                        : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Step: Select Service */}
        {step === 'service' && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Escolha um serviço</h2>
              <p className="text-gray-500">Selecione o serviço que deseja agendar</p>
            </div>

            {services.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Scissors className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum serviço disponível no momento</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {services.map((service) => (
                  <Card
                    key={service.id}
                    className="cursor-pointer hover:border-violet-300 transition-all"
                    onClick={() => handleSelectService(service)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{service.name}</h3>
                          {service.description && (
                            <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatDuration(service.duration_minutes)}
                            </span>
                            <span
                              className="font-semibold"
                              style={{ color: tenant.primary_color }}
                            >
                              {formatCurrency(service.price)}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step: Select Employee */}
        {step === 'employee' && (
          <div className="space-y-4">
            <Button variant="ghost" onClick={handleBack} className="mb-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>

            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Escolha o profissional</h2>
              <p className="text-gray-500">
                Para: <span className="font-medium">{selectedService?.name}</span>
              </p>
            </div>

            {employees.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum profissional disponível</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {employees.map((employee) => (
                  <Card
                    key={employee.id}
                    className="cursor-pointer hover:border-violet-300 transition-all"
                    onClick={() => handleSelectEmployee(employee)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={employee.avatar_url || undefined} />
                          <AvatarFallback
                            style={{ backgroundColor: tenant.primary_color + '20' }}
                          >
                            {employee.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{employee.name}</h3>
                          {employee.bio && (
                            <p className="text-sm text-gray-500 line-clamp-1">{employee.bio}</p>
                          )}
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step: Select Date and Time */}
        {step === 'datetime' && (
          <div className="space-y-4">
            <Button variant="ghost" onClick={handleBack} className="mb-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>

            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Escolha data e horário</h2>
              <p className="text-gray-500">
                {selectedService?.name} com {selectedEmployee?.name}
              </p>
            </div>

            <Card>
              <CardContent className="p-4">
                <Calendar
                  mode="single"
                  selected={selectedDate || undefined}
                  onSelect={(date) => {
                    setSelectedDate(date || null)
                    setSelectedTime(null)
                  }}
                  locale={ptBR}
                  disabled={(date) => date < minDate || date > maxDate}
                  className="rounded-md mx-auto"
                />
              </CardContent>
            </Card>

            {selectedDate && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5" style={{ color: tenant.primary_color }} />
                    Horários disponíveis
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                  </p>
                </CardHeader>
                <CardContent>
                  {loadingSlots ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  ) : availableSlots.filter((s) => s.available).length === 0 ? (
                    <div className="text-center py-8">
                      <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Nenhum horário disponível nesta data</p>
                      <p className="text-sm text-gray-400">Tente outra data</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {availableSlots
                        .filter((s) => s.available)
                        .map((slot) => (
                          <Button
                            key={slot.time}
                            variant={selectedTime === slot.time ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleSelectTime(slot.time)}
                            style={
                              selectedTime === slot.time
                                ? { backgroundColor: tenant.primary_color }
                                : undefined
                            }
                          >
                            {slot.time}
                          </Button>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Step: Confirmation */}
        {step === 'confirm' && (
          <div className="space-y-4">
            <Button variant="ghost" onClick={handleBack} className="mb-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>

            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Confirme seu agendamento</h2>
              <p className="text-gray-500">Preencha seus dados para finalizar</p>
            </div>

            {/* Summary Card */}
            <Card className="bg-gray-50">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Scissors className="w-5 h-5" style={{ color: tenant.primary_color }} />
                  <div>
                    <p className="font-medium">{selectedService?.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatDuration(selectedService?.duration_minutes || 0)}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5" style={{ color: tenant.primary_color }} />
                  <p className="font-medium">{selectedEmployee?.name}</p>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-5 h-5" style={{ color: tenant.primary_color }} />
                  <div>
                    <p className="font-medium">
                      {selectedDate && format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    </p>
                    <p className="text-sm text-gray-500">às {selectedTime}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total</span>
                  <span
                    className="text-xl font-bold"
                    style={{ color: tenant.primary_color }}
                  >
                    {formatCurrency(selectedService?.price || 0)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Client Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Seus dados</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo *</Label>
                    <Input
                      id="name"
                      value={clientData.name}
                      onChange={(e) =>
                        setClientData({ ...clientData, name: e.target.value })
                      }
                      placeholder="Seu nome"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">WhatsApp *</Label>
                    <Input
                      id="phone"
                      value={clientData.phone}
                      onChange={(e) =>
                        setClientData({ ...clientData, phone: e.target.value })
                      }
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email (opcional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={clientData.email}
                      onChange={(e) =>
                        setClientData({ ...clientData, email: e.target.value })
                      }
                      placeholder="seu@email.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Observações (opcional)</Label>
                    <Textarea
                      id="notes"
                      value={clientData.notes}
                      onChange={(e) =>
                        setClientData({ ...clientData, notes: e.target.value })
                      }
                      placeholder="Alguma observação especial?"
                      rows={3}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting || !clientData.name || !clientData.phone}
                    className="w-full py-6 text-lg"
                    style={{ backgroundColor: tenant.primary_color }}
                  >
                    {submitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'Confirmar Agendamento'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <Card className="text-center">
            <CardContent className="py-12">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: tenant.primary_color + '20' }}
              >
                <Check className="w-10 h-10" style={{ color: tenant.primary_color }} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Agendamento Confirmado!
              </h2>
              <p className="text-gray-500 mb-6">
                Enviamos uma confirmação para seu WhatsApp/Email
              </p>

              <Card className="bg-gray-50 text-left mb-6">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Scissors className="w-5 h-5" style={{ color: tenant.primary_color }} />
                    <p className="font-medium">{selectedService?.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5" style={{ color: tenant.primary_color }} />
                    <p>{selectedEmployee?.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-5 h-5" style={{ color: tenant.primary_color }} />
                    <p>
                      {selectedDate && format(selectedDate, "dd/MM/yyyy", { locale: ptBR })} às{' '}
                      {selectedTime}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {tenant.address && (
                <div className="flex items-start gap-2 text-sm text-gray-600 mb-6">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{tenant.address}</span>
                </div>
              )}

              <Button
                variant="outline"
                onClick={() => {
                  setStep('service')
                  setSelectedService(null)
                  setSelectedEmployee(null)
                  setSelectedDate(null)
                  setSelectedTime(null)
                  setClientData({ name: '', phone: '', email: '', notes: '' })
                }}
              >
                Fazer novo agendamento
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t bg-white">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex flex-col items-center gap-4">
            {/* Contact Info */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
              {tenant.phone && (
                <a href={`tel:${tenant.phone}`} className="flex items-center gap-1 hover:text-gray-900">
                  <Phone className="w-4 h-4" />
                  {formatPhone(tenant.phone)}
                </a>
              )}
              {tenant.email && (
                <a href={`mailto:${tenant.email}`} className="flex items-center gap-1 hover:text-gray-900">
                  <Mail className="w-4 h-4" />
                  {tenant.email}
                </a>
              )}
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {tenant.instagram && (
                <a
                  href={`https://instagram.com/${tenant.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-pink-500 transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {tenant.facebook && (
                <a
                  href={tenant.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
            </div>

            {/* Powered by */}
            <p className="text-xs text-gray-400">
              Powered by{' '}
              <a href="/" className="hover:text-violet-500">
                Minha Agenda Bio
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

