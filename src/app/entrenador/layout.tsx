import { redirect } from 'next/navigation'
import { auth, signOut } from '@/auth'
import AppShell from '@/components/portal/AppShell'
import type { NavItem } from '@/components/portal/AppShell'

export default async function EntrenadorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.rol !== 'ENTRENADOR' && session.user.rol !== 'ADMIN_GYM') {
    redirect('/alumno')
  }

  const isAdmin = session.user.rol === 'ADMIN_GYM'

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/entrenador',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    {
      label: 'Mis Alumnos',
      href: '/entrenador/alumnos',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: 'Mensajes',
      href: '/entrenador/mensajes',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
        </svg>
      ),
    },
    ...(isAdmin
      ? [
          {
            label: 'Panel Admin',
            href: '/admin',
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
            ),
          } satisfies NavItem,
        ]
      : []),
  ]

  const pageTitle = isAdmin ? 'Portal Entrenador' : 'Panel de Entrenador'

  async function handleSignOut() {
    'use server'
    await signOut({ redirectTo: '/login' })
  }

  return (
    <AppShell
      user={{
        name: session.user.name ?? 'Entrenador',
        email: session.user.email ?? '',
        rol: session.user.rol,
        image: session.user.image,
      }}
      navItems={navItems}
      pageTitle={pageTitle}
      onSignOut={handleSignOut}
    >
      {children}
    </AppShell>
  )
}
