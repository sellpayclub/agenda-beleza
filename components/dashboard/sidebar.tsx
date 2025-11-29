'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Calendar,
  Users,
  Scissors,
  UserCircle,
  BarChart3,
  DollarSign,
  Settings,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Link as LinkIcon,
  MessageSquare,
  Ban,
  Wallet,
  CreditCard,
  Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { signOut } from '@/lib/actions/auth'
import type { Tenant } from '@/types'

const SUPER_ADMIN_EMAIL = 'personaldann@gmail.com'

interface SidebarProps {
  tenant: Tenant
  userEmail?: string
}

const menuItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Agendamentos',
    href: '/dashboard/agendamentos',
    icon: Calendar,
  },
  {
    label: 'Serviços',
    href: '/dashboard/servicos',
    icon: Scissors,
  },
  {
    label: 'Funcionários',
    href: '/dashboard/funcionarios',
    icon: Users,
  },
  {
    label: 'Bloqueios',
    href: '/dashboard/bloqueios',
    icon: Ban,
  },
  {
    label: 'Clientes',
    href: '/dashboard/clientes',
    icon: UserCircle,
  },
  {
    label: 'Financeiro',
    href: '/dashboard/financeiro',
    icon: DollarSign,
  },
  {
    label: 'Gastos',
    href: '/dashboard/gastos',
    icon: Wallet,
  },
  {
    label: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
  {
    label: 'WhatsApp',
    href: '/dashboard/whatsapp',
    icon: MessageSquare,
  },
  {
    label: 'Assinatura',
    href: '/dashboard/assinatura',
    icon: CreditCard,
  },
  {
    label: 'Configurações',
    href: '/dashboard/configuracoes',
    icon: Settings,
  },
]

export function Sidebar({ tenant, userEmail }: SidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
  }

  const isSuperAdmin = userEmail === SUPER_ADMIN_EMAIL

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          {tenant.logo_url ? (
            <img
              src={tenant.logo_url}
              alt={tenant.name}
              className="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: tenant.primary_color }}
            >
              {tenant.name.charAt(0)}
            </div>
          )}
          <div>
            <h2 className="font-semibold text-white truncate max-w-[140px]">
              {tenant.name}
            </h2>
            <p className="text-xs text-gray-400">Minha Agenda Bio</p>
          </div>
        </div>
      </div>

      {/* Public Link */}
      <div className="px-4 py-3">
        <Link
          href={`/b/${tenant.slug}`}
          target="_blank"
          className="flex items-center gap-2 px-4 py-3 text-sm rounded-xl bg-gradient-to-r from-violet-500/20 to-pink-500/20 hover:from-violet-500/30 hover:to-pink-500/30 text-white transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-violet-500/10"
        >
          <LinkIcon className="w-5 h-5" />
          <span className="truncate font-medium">Ver página pública</span>
        </Link>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-violet-500/20 to-pink-500/20 text-white shadow-lg shadow-violet-500/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/10 hover:scale-[1.02]'
              )}
            >
              <item.icon className={cn('w-6 h-6 transition-transform', isActive && 'scale-110')} />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
        
        {/* Admin Menu - Only for Super Admin */}
        {isSuperAdmin && (
          <Link
            href="/dashboard/admin"
            prefetch={true}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 mt-4 border-t border-white/10 pt-4',
              pathname === '/dashboard/admin'
                ? 'bg-gradient-to-r from-violet-500/20 to-pink-500/20 text-white shadow-lg shadow-violet-500/10'
                : 'text-violet-400 hover:text-white hover:bg-white/10 hover:scale-[1.02]'
            )}
          >
            <Shield className="w-6 h-6" />
            <span className="font-medium">Painel Admin</span>
          </Link>
        )}
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t border-white/10">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-gray-400 hover:text-white hover:bg-white/5"
          onClick={handleSignOut}
        >
          <LogOut className="w-5 h-5" />
          Sair
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-gray-900 text-white"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen w-64 bg-gray-900 transition-transform lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent />
      </aside>
    </>
  )
}

