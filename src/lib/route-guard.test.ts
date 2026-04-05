import { describe, it, expect } from 'vitest'
import { checkRouteAccess } from './route-guard'

const session = (rol: string) => ({ user: { rol } })

describe('checkRouteAccess', () => {
  describe('unauthenticated user', () => {
    it('redirects to /login when accessing /alumno', () => {
      expect(checkRouteAccess('/alumno', null)).toEqual({ action: 'redirect', to: '/login' })
    })

    it('redirects to /login when accessing /entrenador', () => {
      expect(checkRouteAccess('/entrenador', null)).toEqual({ action: 'redirect', to: '/login' })
    })

    it('redirects to /login when accessing /admin', () => {
      expect(checkRouteAccess('/admin', null)).toEqual({ action: 'redirect', to: '/login' })
    })

    it('allows access to /login', () => {
      expect(checkRouteAccess('/login', null)).toEqual({ action: 'allow' })
    })

    it('allows access to public route /', () => {
      expect(checkRouteAccess('/', null)).toEqual({ action: 'allow' })
    })
  })

  describe('ALUMNO role', () => {
    it('allows access to /alumno', () => {
      expect(checkRouteAccess('/alumno', session('ALUMNO'))).toEqual({ action: 'allow' })
    })

    it('redirects to /alumno when accessing /entrenador', () => {
      expect(checkRouteAccess('/entrenador', session('ALUMNO'))).toEqual({ action: 'redirect', to: '/alumno' })
    })

    it('redirects to /alumno when accessing /admin', () => {
      expect(checkRouteAccess('/admin', session('ALUMNO'))).toEqual({ action: 'redirect', to: '/alumno' })
    })

    it('redirects to /alumno when accessing /login', () => {
      expect(checkRouteAccess('/login', session('ALUMNO'))).toEqual({ action: 'redirect', to: '/alumno' })
    })
  })

  describe('ENTRENADOR role', () => {
    it('allows access to /entrenador', () => {
      expect(checkRouteAccess('/entrenador', session('ENTRENADOR'))).toEqual({ action: 'allow' })
    })

    it('redirects to /entrenador when accessing /admin', () => {
      expect(checkRouteAccess('/admin', session('ENTRENADOR'))).toEqual({ action: 'redirect', to: '/entrenador' })
    })

    it('redirects to /entrenador when accessing /alumno', () => {
      expect(checkRouteAccess('/alumno', session('ENTRENADOR'))).toEqual({ action: 'redirect', to: '/entrenador' })
    })

    it('redirects to /entrenador when accessing /login', () => {
      expect(checkRouteAccess('/login', session('ENTRENADOR'))).toEqual({ action: 'redirect', to: '/entrenador' })
    })
  })

  describe('ADMIN_GYM role', () => {
    it('allows access to /admin', () => {
      expect(checkRouteAccess('/admin', session('ADMIN_GYM'))).toEqual({ action: 'allow' })
    })

    it('allows access to /entrenador', () => {
      expect(checkRouteAccess('/entrenador', session('ADMIN_GYM'))).toEqual({ action: 'allow' })
    })

    it('redirects to /admin when accessing /alumno', () => {
      expect(checkRouteAccess('/alumno', session('ADMIN_GYM'))).toEqual({ action: 'redirect', to: '/admin' })
    })

    it('redirects to /admin when accessing /login', () => {
      expect(checkRouteAccess('/login', session('ADMIN_GYM'))).toEqual({ action: 'redirect', to: '/admin' })
    })
  })

  describe('nested routes', () => {
    it('protects /alumno/dashboard the same as /alumno', () => {
      expect(checkRouteAccess('/alumno/dashboard', null)).toEqual({ action: 'redirect', to: '/login' })
    })

    it('allows ALUMNO on /alumno/perfil', () => {
      expect(checkRouteAccess('/alumno/perfil', session('ALUMNO'))).toEqual({ action: 'allow' })
    })
  })
})
