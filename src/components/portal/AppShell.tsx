'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import LogoBadge from '@/components/landing/LogoBadge'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'

export type NavItem = {
  label: string
  href: string
  icon: React.ReactNode
}

type AppShellProps = {
  children: React.ReactNode
  user: {
    name: string
    email: string
    rol: string
    image?: string | null
  }
  navItems: NavItem[]
  pageTitle: string
  onSignOut: () => Promise<void>
}

function NavContent({
  user,
  navItems,
  pathname,
  onSignOut,
  onNavClick,
}: {
  user: AppShellProps['user']
  navItems: NavItem[]
  pathname: string
  onSignOut: () => Promise<void>
  onNavClick?: () => void
}) {
  const rolLabels: Record<string, string> = {
    ALUMNO: 'Alumno',
    ENTRENADOR: 'Entrenador',
    ADMIN_GYM: 'Admin',
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-4">
        <LogoBadge size="sm" variant="primary" />
        <span
          className="text-lg font-bold tracking-wide"
          style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
        >
          DDR FITNESS
        </span>
      </div>

      {/* User info */}
      <div
        className="mx-4 mb-5 flex items-center gap-3 rounded-xl px-3 py-3"
        style={{ background: 'var(--gym-surface-alt)' }}
      >
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold flex-shrink-0"
          style={{
            background: 'var(--primary)',
            color: '#0a0a0a',
            fontFamily: 'var(--font-heading)',
          }}
        >
          {user.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()}
        </div>
        <div className="flex flex-col min-w-0">
          <span
            className="text-sm font-semibold truncate"
            style={{ color: '#ffffff' }}
          >
            {user.name}
          </span>
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider mt-0.5 w-fit"
            style={{
              background: 'rgba(255, 170, 25, 0.15)',
              color: 'var(--primary)',
            }}
          >
            {rolLabels[user.rol] ?? user.rol}
          </span>
        </div>
      </div>

      {/* Separator */}
      <div
        className="mx-4 mb-2"
        style={{ borderBottom: '1px solid var(--gym-border)' }}
      />

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = item.href === '/'
            ? pathname === item.href
            : item.href.split('/').filter(Boolean).length <= 1
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
              style={{
                background: isActive ? 'var(--gym-surface-alt)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--gym-muted)',
                borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
              }}
            >
              <span
                className="flex-shrink-0"
                style={{ color: isActive ? 'var(--primary)' : 'var(--gym-muted)' }}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 pb-6 pt-4">
        <form action={onSignOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
            style={{ color: 'var(--gym-muted)' }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Cerrar sesion
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AppShell({
  children,
  user,
  navItems,
  pageTitle,
  onSignOut,
}: AppShellProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const today = new Date().toLocaleDateString('es-PY', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--gym-bg)' }}>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-40"
        style={{
          width: 260,
          background: 'var(--gym-surface)',
          borderRight: '1px solid var(--gym-border)',
        }}
      >
        <NavContent
          user={user}
          navItems={navItems}
          pathname={pathname}
          onSignOut={onSignOut}
        />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="p-0 w-[280px]"
          style={{
            background: 'var(--gym-surface)',
            borderRight: '1px solid var(--gym-border)',
          }}
        >
          <SheetTitle className="sr-only">Menu de navegacion</SheetTitle>
          <NavContent
            user={user}
            navItems={navItems}
            pathname={pathname}
            onSignOut={onSignOut}
            onNavClick={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 lg:ml-[260px]">
        {/* Header */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between px-4 py-4 lg:px-8"
          style={{
            background: 'var(--gym-bg)',
            borderBottom: '1px solid var(--gym-border)',
          }}
        >
          <div className="flex items-center gap-4">
            {/* Mobile hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg"
                style={{ color: '#ffffff' }}
              >
                <Menu size={22} />
              </SheetTrigger>
            </Sheet>

            <div>
              <h1
                className="text-xl font-bold"
                style={{
                  fontFamily: 'var(--font-heading)',
                  color: '#ffffff',
                }}
              >
                {pageTitle}
              </h1>
              <p
                className="text-xs capitalize"
                style={{ color: 'var(--gym-muted)' }}
              >
                {today}
              </p>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
