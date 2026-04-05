import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'

vi.mock('@/auth', () => ({ auth: vi.fn() }))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    gym: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { obtenerGym, actualizarGym } from './actions'

const mockAuth = vi.mocked(auth) as unknown as Mock<() => Promise<{ user: { id: string; rol: string; gymId: string } } | null>>
const mockFindUnique = vi.mocked(prisma.gym.findUnique)
const mockUpdate = vi.mocked(prisma.gym.update)
const mockRevalidatePath = vi.mocked(revalidatePath)

const adminSession = {
  user: { id: 'user-1', rol: 'ADMIN_GYM', gymId: 'gym-1' },
}

const gymData = {
  id: 'gym-1',
  nombre: 'FitZone',
  ciudad: 'Buenos Aires',
  pais: 'Argentina',
  whatsapp: '+54911',
  instagram: '@fitzone',
  facebook: 'fitzone',
}

const validInput = {
  id: 'gym-1',
  nombre: 'FitZone',
  ciudad: 'Buenos Aires',
  pais: 'Argentina',
  whatsapp: '+54911',
  instagram: '@fitzone',
  facebook: 'fitzone',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('obtenerGym', () => {
  describe('auth checks', () => {
    it('throws when no session', async () => {
      mockAuth.mockResolvedValue(null)
      await expect(obtenerGym()).rejects.toThrow('No autorizado')
    })

    it('throws when rol is not ADMIN_GYM', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'u', rol: 'ENTRENADOR', gymId: 'g' } })
      await expect(obtenerGym()).rejects.toThrow('No autorizado')
    })
  })

  describe('gym not found', () => {
    it('throws when gym does not exist', async () => {
      mockAuth.mockResolvedValue(adminSession)
      mockFindUnique.mockResolvedValue(null)
      await expect(obtenerGym()).rejects.toThrow('Gym no encontrado')
    })
  })

  describe('happy path', () => {
    it('returns gym data for the session gymId', async () => {
      mockAuth.mockResolvedValue(adminSession)
      mockFindUnique.mockResolvedValue(gymData as never)

      const result = await obtenerGym()

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: 'gym-1' },
        select: {
          id: true,
          nombre: true,
          ciudad: true,
          pais: true,
          whatsapp: true,
          instagram: true,
          facebook: true,
        },
      })

      expect(result).toEqual(gymData)
    })
  })
})

describe('actualizarGym', () => {
  describe('auth checks', () => {
    it('throws when no session', async () => {
      mockAuth.mockResolvedValue(null)
      await expect(actualizarGym(validInput)).rejects.toThrow('No autorizado')
    })

    it('throws when rol is not ADMIN_GYM', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'u', rol: 'ALUMNO', gymId: 'g' } })
      await expect(actualizarGym(validInput)).rejects.toThrow('No autorizado')
    })
  })

  describe('validation', () => {
    it('throws when nombre is empty', async () => {
      mockAuth.mockResolvedValue(adminSession)
      await expect(actualizarGym({ ...validInput, nombre: '   ' }))
        .rejects.toThrow('El nombre del gym es obligatorio')
    })
  })

  describe('happy path', () => {
    it('updates gym with trimmed values and revalidates', async () => {
      mockAuth.mockResolvedValue(adminSession)
      mockUpdate.mockResolvedValue({} as never)

      await actualizarGym(validInput)

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'gym-1' },
        data: {
          nombre: 'FitZone',
          ciudad: 'Buenos Aires',
          pais: 'Argentina',
          whatsapp: '+54911',
          instagram: '@fitzone',
          facebook: 'fitzone',
        },
      })

      expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/configuracion')
    })
  })

  describe('optional fields become null', () => {
    it('sets optional fields to null when empty', async () => {
      mockAuth.mockResolvedValue(adminSession)
      mockUpdate.mockResolvedValue({} as never)

      await actualizarGym({
        ...validInput,
        ciudad: '',
        pais: '  ',
        whatsapp: '',
        instagram: '   ',
        facebook: '',
      })

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'gym-1' },
        data: expect.objectContaining({
          ciudad: null,
          pais: null,
          whatsapp: null,
          instagram: null,
          facebook: null,
        }),
      })
    })
  })
})
