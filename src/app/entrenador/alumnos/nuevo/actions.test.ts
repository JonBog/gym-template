import { describe, it, expect, vi, beforeEach } from 'vitest'
import { crearAlumno } from './actions'

vi.mock('@/auth', () => ({ auth: vi.fn() }))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn(),
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    asignacionAlumno: {
      create: vi.fn(),
    },
  },
}))
vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => { throw new Error('NEXT_REDIRECT') }),
}))
vi.mock('bcryptjs', () => ({
  default: { hash: vi.fn() },
}))

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const mockAuth = vi.mocked(auth)
const mockBcryptHash = vi.mocked(bcrypt.hash)
const mockTransaction = vi.mocked(prisma.$transaction)

const entrenadorSession = {
  user: { id: 'entrenador-1', rol: 'ENTRENADOR', gymId: 'gym-1' },
}

const validInput = {
  nombre: 'Juan',
  apellido: 'Pérez',
  email: 'juan@example.com',
  telefono: '1122334455',
  fechaNacimiento: '1995-06-15',
  objetivo: 'Perder peso',
  password: 'secret123',
}

const createdUser = { id: 'alumno-new-1', ...validInput }

beforeEach(() => {
  vi.clearAllMocks()
  mockBcryptHash.mockResolvedValue('hashed-password' as never)
  vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
  vi.mocked(prisma.user.create).mockResolvedValue(createdUser as never)
  vi.mocked(prisma.asignacionAlumno.create).mockResolvedValue({} as never)
  mockTransaction.mockImplementation((cb: (tx: typeof prisma) => Promise<unknown>) => cb(prisma))
})

describe('crearAlumno', () => {
  describe('auth checks', () => {
    it('throws when no session', async () => {
      mockAuth.mockResolvedValue(null as never)
      await expect(crearAlumno(validInput)).rejects.toThrow('No autorizado')
    })

    it('throws when user has wrong role', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'u1', rol: 'ALUMNO', gymId: 'gym-1' } } as never)
      await expect(crearAlumno(validInput)).rejects.toThrow('No autorizado')
    })

    it('allows ENTRENADOR role', async () => {
      mockAuth.mockResolvedValue(entrenadorSession as never)
      await expect(crearAlumno(validInput)).rejects.toThrow('NEXT_REDIRECT')
    })

    it('allows ADMIN_GYM role', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'u1', rol: 'ADMIN_GYM', gymId: 'gym-1' } } as never)
      await expect(crearAlumno(validInput)).rejects.toThrow('NEXT_REDIRECT')
    })
  })

  describe('validation', () => {
    beforeEach(() => {
      mockAuth.mockResolvedValue(entrenadorSession as never)
    })

    it('throws when nombre is empty', async () => {
      await expect(crearAlumno({ ...validInput, nombre: '' })).rejects.toThrow(
        'Nombre y apellido son obligatorios',
      )
    })

    it('throws when apellido is empty', async () => {
      await expect(crearAlumno({ ...validInput, apellido: '' })).rejects.toThrow(
        'Nombre y apellido son obligatorios',
      )
    })

    it('throws when nombre is only whitespace', async () => {
      await expect(crearAlumno({ ...validInput, nombre: '   ' })).rejects.toThrow(
        'Nombre y apellido son obligatorios',
      )
    })

    it('throws when email is empty', async () => {
      await expect(crearAlumno({ ...validInput, email: '' })).rejects.toThrow(
        'El email es obligatorio',
      )
    })

    it('throws when password is too short', async () => {
      await expect(crearAlumno({ ...validInput, password: '12345' })).rejects.toThrow(
        'La contraseña debe tener al menos 6 caracteres',
      )
    })

    it('throws when password is empty', async () => {
      await expect(crearAlumno({ ...validInput, password: '' })).rejects.toThrow(
        'La contraseña debe tener al menos 6 caracteres',
      )
    })
  })

  describe('duplicate email', () => {
    beforeEach(() => {
      mockAuth.mockResolvedValue(entrenadorSession as never)
    })

    it('throws when email already exists', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'existing-1' } as never)
      await expect(crearAlumno(validInput)).rejects.toThrow('Ya existe un usuario con ese email')
    })
  })

  describe('password hashing', () => {
    beforeEach(() => {
      mockAuth.mockResolvedValue(entrenadorSession as never)
    })

    it('hashes password with bcrypt cost 12', async () => {
      await expect(crearAlumno(validInput)).rejects.toThrow('NEXT_REDIRECT')
      expect(mockBcryptHash).toHaveBeenCalledWith(validInput.password, 12)
    })

    it('stores hashed password, not plain text', async () => {
      await expect(crearAlumno(validInput)).rejects.toThrow('NEXT_REDIRECT')

      const createCall = vi.mocked(prisma.user.create).mock.calls[0][0]
      expect((createCall.data as { passwordHash: string }).passwordHash).toBe('hashed-password')
      expect(createCall.data).not.toHaveProperty('password')
    })
  })

  describe('happy path', () => {
    beforeEach(() => {
      mockAuth.mockResolvedValue(entrenadorSession as never)
    })

    it('creates user with correct data', async () => {
      await expect(crearAlumno(validInput)).rejects.toThrow('NEXT_REDIRECT')

      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            gymId: 'gym-1',
            nombre: validInput.nombre,
            apellido: validInput.apellido,
            email: validInput.email.toLowerCase(),
            rol: 'ALUMNO',
            passwordHash: 'hashed-password',
          }),
        }),
      )
    })

    it('normalizes email to lowercase', async () => {
      await expect(
        crearAlumno({ ...validInput, email: 'Juan@Example.COM' }),
      ).rejects.toThrow('NEXT_REDIRECT')

      const createCall = vi.mocked(prisma.user.create).mock.calls[0][0]
      expect((createCall.data as { email: string }).email).toBe('juan@example.com')
    })

    it('creates asignacion for the entrenador', async () => {
      await expect(crearAlumno(validInput)).rejects.toThrow('NEXT_REDIRECT')

      expect(prisma.asignacionAlumno.create).toHaveBeenCalledWith({
        data: {
          entrenadorId: 'entrenador-1',
          alumnoId: createdUser.id,
        },
      })
    })

    it('redirects to new alumno page', async () => {
      const { redirect } = await import('next/navigation')
      await expect(crearAlumno(validInput)).rejects.toThrow('NEXT_REDIRECT')
      expect(redirect).toHaveBeenCalledWith(`/entrenador/alumnos/${createdUser.id}`)
    })

    it('sets telefono to null when empty', async () => {
      await expect(crearAlumno({ ...validInput, telefono: '' })).rejects.toThrow('NEXT_REDIRECT')

      const createCall = vi.mocked(prisma.user.create).mock.calls[0][0]
      expect((createCall.data as { telefono: null }).telefono).toBeNull()
    })

    it('sets fechaNacimiento to null when not provided', async () => {
      await expect(crearAlumno({ ...validInput, fechaNacimiento: '' })).rejects.toThrow(
        'NEXT_REDIRECT',
      )

      const createCall = vi.mocked(prisma.user.create).mock.calls[0][0]
      expect((createCall.data as { fechaNacimiento: null }).fechaNacimiento).toBeNull()
    })
  })
})
