import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'

vi.mock('@/auth', () => ({ auth: vi.fn() }))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))
vi.mock('bcryptjs', () => ({ default: { hash: vi.fn() } }))
vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => { throw new Error('NEXT_REDIRECT') }),
}))

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { crearEntrenador } from './actions'

const mockAuth = vi.mocked(auth) as unknown as Mock<() => Promise<{ user: { id: string; rol: string; gymId: string } } | null>>
const mockFindUnique = vi.mocked(prisma.user.findUnique)
const mockCreate = vi.mocked(prisma.user.create)
const mockHash = vi.mocked(bcrypt.hash)

const adminSession = {
  user: { id: 'user-1', rol: 'ADMIN_GYM', gymId: 'gym-1' },
}

const validInput = {
  nombre: 'Juan',
  apellido: 'Perez',
  email: 'juan@gym.com',
  telefono: '1234567890',
  especialidades: 'Pesas',
  password: 'secret123',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('crearEntrenador', () => {
  describe('auth checks', () => {
    it('throws when no session', async () => {
      mockAuth.mockResolvedValue(null)
      await expect(crearEntrenador(validInput)).rejects.toThrow('No autorizado')
    })

    it('throws when rol is not ADMIN_GYM', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'u', rol: 'ALUMNO', gymId: 'g' } })
      await expect(crearEntrenador(validInput)).rejects.toThrow('No autorizado')
    })
  })

  describe('validation', () => {
    beforeEach(() => {
      mockAuth.mockResolvedValue(adminSession)
    })

    it('throws when nombre is empty', async () => {
      await expect(crearEntrenador({ ...validInput, nombre: '   ' }))
        .rejects.toThrow('Nombre y apellido son obligatorios')
    })

    it('throws when apellido is empty', async () => {
      await expect(crearEntrenador({ ...validInput, apellido: '' }))
        .rejects.toThrow('Nombre y apellido son obligatorios')
    })

    it('throws when email is empty', async () => {
      await expect(crearEntrenador({ ...validInput, email: '   ' }))
        .rejects.toThrow('El email es obligatorio')
    })

    it('throws when password is shorter than 6 chars', async () => {
      await expect(crearEntrenador({ ...validInput, password: '123' }))
        .rejects.toThrow('La contrasena debe tener al menos 6 caracteres')
    })

    it('throws when password is missing', async () => {
      await expect(crearEntrenador({ ...validInput, password: '' }))
        .rejects.toThrow('La contrasena debe tener al menos 6 caracteres')
    })
  })

  describe('duplicate email', () => {
    it('throws when email already exists', async () => {
      mockAuth.mockResolvedValue(adminSession)
      mockFindUnique.mockResolvedValue({ id: 'existing' } as never)

      await expect(crearEntrenador(validInput)).rejects.toThrow('Ya existe un usuario con ese email')
    })
  })

  describe('happy path', () => {
    it('creates user with hashed password and redirects', async () => {
      mockAuth.mockResolvedValue(adminSession)
      mockFindUnique.mockResolvedValue(null)
      mockHash.mockResolvedValue('hashed-pw' as never)
      mockCreate.mockResolvedValue({} as never)

      await expect(crearEntrenador(validInput)).rejects.toThrow('NEXT_REDIRECT')

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { email: 'juan@gym.com' },
      })

      expect(mockHash).toHaveBeenCalledWith('secret123', 12)

      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          gymId: 'gym-1',
          nombre: 'Juan',
          apellido: 'Perez',
          email: 'juan@gym.com',
          telefono: '1234567890',
          passwordHash: 'hashed-pw',
          rol: 'ENTRENADOR',
        },
      })
    })

    it('trims fields and lowercases email before saving', async () => {
      mockAuth.mockResolvedValue(adminSession)
      mockFindUnique.mockResolvedValue(null)
      mockHash.mockResolvedValue('hashed-pw' as never)
      mockCreate.mockResolvedValue({} as never)

      await expect(
        crearEntrenador({ ...validInput, nombre: '  Ana  ', email: '  ANA@GYM.COM  ', telefono: '' })
      ).rejects.toThrow('NEXT_REDIRECT')

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            nombre: 'Ana',
            email: 'ana@gym.com',
            telefono: null,
          }),
        })
      )
    })
  })
})
