export type RouteGuardResult =
  | { action: 'allow' }
  | { action: 'redirect'; to: string }

const ROLE_ROUTES: Record<string, string[]> = {
  '/alumno':     ['ALUMNO'],
  '/entrenador': ['ENTRENADOR', 'ADMIN_GYM'],
  '/admin':      ['ADMIN_GYM'],
}

const DASHBOARDS: Record<string, string> = {
  ALUMNO:     '/alumno',
  ENTRENADOR: '/entrenador',
  ADMIN_GYM:  '/admin',
}

export function checkRouteAccess(
  pathname: string,
  session: { user: { rol: string } } | null,
): RouteGuardResult {
  for (const [prefix, roles] of Object.entries(ROLE_ROUTES)) {
    if (pathname.startsWith(prefix)) {
      if (!session) {
        return { action: 'redirect', to: '/login' }
      }
      if (!roles.includes(session.user.rol)) {
        return { action: 'redirect', to: DASHBOARDS[session.user.rol] }
      }
      return { action: 'allow' }
    }
  }

  if (pathname === '/login' && session) {
    return { action: 'redirect', to: DASHBOARDS[session.user.rol] }
  }

  return { action: 'allow' }
}
