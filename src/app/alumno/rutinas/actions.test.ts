import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'

vi.mock('@/auth', () => ({ auth: vi.fn() }))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    ejercicioCompletado: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}))
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { toggleEjercicioCompletado } from './actions'

const mockAuth = vi.mocked(auth) as unknown as Mock<() => Promise<{ user: { id: string; rol: string; gymId: string } } | null>>
const mockFindUnique = vi.mocked(prisma.ejercicioCompletado.findUnique)
const mockCreate = vi.mocked(prisma.ejercicioCompletado.create)
const mockDelete = vi.mocked(prisma.ejercicioCompletado.delete)
const mockRevalidatePath = vi.mocked(revalidatePath)

const alumnoSession = {
  user: { id: 'alumno-1', rol: 'ALUMNO', gymId: 'gym-1' },
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('toggleEjercicioCompletado', () => {
  describe('auth checks', () => {
    it('throws when no session', async () => {
      mockAuth.mockResolvedValue(null)
      await expect(toggleEjercicioCompletado('ejercicio-1')).rejects.toThrow('No autenticado')
    })

    it('throws when session has no user', async () => {
      mockAuth.mockResolvedValue({ user: null } as never)
      await expect(toggleEjercicioCompletado('ejercicio-1')).rejects.toThrow('No autenticado')
    })
  })

  describe('toggle ON (no existing record)', () => {
    it('creates a new completado record for today', async () => {
      mockAuth.mockResolvedValue(alumnoSession)
      mockFindUnique.mockResolvedValue(null)
      mockCreate.mockResolvedValue({} as never)

      await toggleEjercicioCompletado('ejercicio-1')

      const now = new Date()
      const fechaHoy = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: {
          ejercicioId_alumnoId_fecha: {
            ejercicioId: 'ejercicio-1',
            alumnoId: 'alumno-1',
            fecha: fechaHoy,
          },
        },
      })

      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          ejercicioId: 'ejercicio-1',
          alumnoId: 'alumno-1',
          fecha: fechaHoy,
        },
      })

      expect(mockDelete).not.toHaveBeenCalled()
    })
  })

  describe('toggle OFF (existing record)', () => {
    it('deletes the existing completado record', async () => {
      mockAuth.mockResolvedValue(alumnoSession)
      mockFindUnique.mockResolvedValue({ id: 'completado-99' } as never)
      mockDelete.mockResolvedValue({} as never)

      await toggleEjercicioCompletado('ejercicio-1')

      expect(mockDelete).toHaveBeenCalledWith({
        where: { id: 'completado-99' },
      })

      expect(mockCreate).not.toHaveBeenCalled()
    })
  })

  describe('revalidation', () => {
    it('revalidates both /alumno/rutinas and /alumno after toggle', async () => {
      mockAuth.mockResolvedValue(alumnoSession)
      mockFindUnique.mockResolvedValue(null)
      mockCreate.mockResolvedValue({} as never)

      await toggleEjercicioCompletado('ejercicio-1')

      expect(mockRevalidatePath).toHaveBeenCalledWith('/alumno/rutinas')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/alumno')
      expect(mockRevalidatePath).toHaveBeenCalledTimes(2)
    })
  })
})
