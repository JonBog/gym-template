import { describe, it, expect, vi, beforeEach } from 'vitest'
import { crearRutina } from './actions'

vi.mock('@/auth', () => ({ auth: vi.fn() }))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn(),
    rutina: {
      updateMany: vi.fn(),
      create: vi.fn(),
    },
    asignacionAlumno: {
      findFirst: vi.fn(),
    },
  },
}))
vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => { throw new Error('NEXT_REDIRECT') }),
}))

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

const mockAuth = vi.mocked(auth)
const mockTransaction = vi.mocked(prisma.$transaction)

const entrenadorSession = {
  user: { id: 'entrenador-1', rol: 'ENTRENADOR', gymId: 'gym-1' },
}

const validDia = {
  dia: 'LUNES',
  nombre: 'Día de piernas',
  tipo: 'FUERZA',
  ejercicios: [
    {
      nombre: 'Sentadilla',
      series: 4,
      repsMin: 8,
      repsMax: 12,
      pesoKg: 80,
      pesoNota: '',
      descansoSeg: 90,
      videoUrl: '',
      orden: 0,
    },
  ],
}

const validInput = {
  alumnoId: 'alumno-1',
  nombre: 'Rutina fuerza',
  descripcion: 'Descripción',
  vigenciaDesde: '2024-01-01',
  vigenciaHasta: '2024-03-01',
  dias: [validDia],
}

beforeEach(() => {
  vi.clearAllMocks()
  mockTransaction.mockImplementation((cb: (tx: typeof prisma) => Promise<unknown>) => cb(prisma))
  vi.mocked(prisma.rutina.updateMany).mockResolvedValue({ count: 0 })
  vi.mocked(prisma.rutina.create).mockResolvedValue({} as never)
})

describe('crearRutina', () => {
  describe('auth checks', () => {
    it('throws when no session', async () => {
      mockAuth.mockResolvedValue(null as never)
      await expect(crearRutina(validInput)).rejects.toThrow('No autenticado')
    })

    it('throws when user has wrong role', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'u1', rol: 'ALUMNO', gymId: 'gym-1' } } as never)
      await expect(crearRutina(validInput)).rejects.toThrow('No tenés permisos para crear rutinas')
    })

    it('allows ENTRENADOR role', async () => {
      mockAuth.mockResolvedValue(entrenadorSession as never)
      await expect(crearRutina(validInput)).rejects.toThrow('NEXT_REDIRECT')
    })

    it('rejects ADMIN_GYM without active assignment', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'u1', rol: 'ADMIN_GYM', gymId: 'gym-1' } } as never)
      vi.mocked(prisma.asignacionAlumno.findFirst).mockResolvedValue(null)
      await expect(crearRutina(validInput)).rejects.toThrow('No tenés permisos para crear rutinas para este alumno')
    })

    it('allows ADMIN_GYM with active assignment', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'admin-1', rol: 'ADMIN_GYM', gymId: 'gym-1' } } as never)
      vi.mocked(prisma.asignacionAlumno.findFirst).mockResolvedValue({ id: 'asig-1' } as never)
      await expect(crearRutina(validInput)).rejects.toThrow('NEXT_REDIRECT')
    })
  })

  describe('validation', () => {
    beforeEach(() => {
      mockAuth.mockResolvedValue(entrenadorSession as never)
    })

    it('throws when nombre is empty', async () => {
      await expect(crearRutina({ ...validInput, nombre: '' })).rejects.toThrow(
        'El nombre de la rutina es obligatorio',
      )
    })

    it('throws when nombre is only whitespace', async () => {
      await expect(crearRutina({ ...validInput, nombre: '   ' })).rejects.toThrow(
        'El nombre de la rutina es obligatorio',
      )
    })

    it('throws when dias is empty', async () => {
      await expect(crearRutina({ ...validInput, dias: [] })).rejects.toThrow(
        'Debés agregar al menos 1 día de entrenamiento',
      )
    })

    it('throws when a dia has no ejercicios', async () => {
      const diaVacio = { ...validDia, ejercicios: [] }
      await expect(crearRutina({ ...validInput, dias: [diaVacio] })).rejects.toThrow(
        `El día ${diaVacio.dia} no tiene ejercicios`,
      )
    })
  })

  describe('happy path', () => {
    beforeEach(() => {
      mockAuth.mockResolvedValue(entrenadorSession as never)
    })

    it('deactivates previous routines and creates new one', async () => {
      await expect(crearRutina(validInput)).rejects.toThrow('NEXT_REDIRECT')

      expect(prisma.rutina.updateMany).toHaveBeenCalledWith({
        where: { alumnoId: validInput.alumnoId, activa: true },
        data: { activa: false },
      })

      expect(prisma.rutina.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            alumnoId: validInput.alumnoId,
            entrenadorId: 'entrenador-1',
            nombre: validInput.nombre,
            activa: true,
          }),
        }),
      )
    })

    it('redirects to alumno page after creation', async () => {
      const { redirect } = await import('next/navigation')
      await expect(crearRutina(validInput)).rejects.toThrow('NEXT_REDIRECT')
      expect(redirect).toHaveBeenCalledWith(`/entrenador/alumnos/${validInput.alumnoId}`)
    })

    it('maps dia string to DiaSemana enum value', async () => {
      await expect(crearRutina(validInput)).rejects.toThrow('NEXT_REDIRECT')

      const createCall = vi.mocked(prisma.rutina.create).mock.calls[0][0]
      const diasCreated = (createCall.data as { dias: { create: { dia: string }[] } }).dias.create
      expect(diasCreated[0].dia).toBe('LUNES')
    })

    it('sets vigenciaHasta to null when not provided', async () => {
      await expect(crearRutina({ ...validInput, vigenciaHasta: '' })).rejects.toThrow('NEXT_REDIRECT')

      const createCall = vi.mocked(prisma.rutina.create).mock.calls[0][0]
      expect((createCall.data as { vigenciaHasta: null }).vigenciaHasta).toBeNull()
    })
  })
})
