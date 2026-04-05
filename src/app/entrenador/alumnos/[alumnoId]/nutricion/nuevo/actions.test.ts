import { describe, it, expect, vi, beforeEach } from 'vitest'
import { crearPlanNutricional } from './actions'

vi.mock('@/auth', () => ({ auth: vi.fn() }))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn(),
    planNutricional: {
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

const validAlimento = {
  nombre: 'Arroz',
  cantidad: 100,
  unidad: 'g',
  kcal: 130,
  proteinaG: 2.7,
  carbosG: 28,
  grasaG: 0.3,
  orden: 0,
}

const validComida = {
  nombre: 'Almuerzo',
  hora: '13:00',
  orden: 0,
  alimentos: [validAlimento],
}

const validDia = {
  dia: 'LUNES',
  nombre: 'Día 1',
  comidas: [validComida],
}

const validInput = {
  alumnoId: 'alumno-1',
  nombre: 'Plan volumen',
  objetivo: 'Ganar masa muscular',
  kcalObjetivo: 3000,
  proteinaG: 180,
  carbosG: 350,
  grasaG: 80,
  vigenciaDesde: '2024-01-01',
  vigenciaHasta: '2024-03-01',
  dias: [validDia],
}

beforeEach(() => {
  vi.clearAllMocks()
  mockTransaction.mockImplementation((cb: (tx: typeof prisma) => Promise<unknown>) => cb(prisma))
  vi.mocked(prisma.planNutricional.updateMany).mockResolvedValue({ count: 0 })
  vi.mocked(prisma.planNutricional.create).mockResolvedValue({} as never)
})

describe('crearPlanNutricional', () => {
  describe('auth checks', () => {
    it('throws when no session', async () => {
      mockAuth.mockResolvedValue(null as never)
      await expect(crearPlanNutricional(validInput)).rejects.toThrow('No autenticado')
    })

    it('throws when user has wrong role', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'u1', rol: 'ALUMNO', gymId: 'gym-1' } } as never)
      await expect(crearPlanNutricional(validInput)).rejects.toThrow(
        'No tenés permisos para crear planes nutricionales',
      )
    })

    it('allows ENTRENADOR role', async () => {
      mockAuth.mockResolvedValue(entrenadorSession as never)
      await expect(crearPlanNutricional(validInput)).rejects.toThrow('NEXT_REDIRECT')
    })

    it('rejects ADMIN_GYM without active assignment', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'u1', rol: 'ADMIN_GYM', gymId: 'gym-1' } } as never)
      vi.mocked(prisma.asignacionAlumno.findFirst).mockResolvedValue(null)
      await expect(crearPlanNutricional(validInput)).rejects.toThrow('No tenés permisos para crear planes nutricionales para este alumno')
    })

    it('allows ADMIN_GYM with active assignment', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'admin-1', rol: 'ADMIN_GYM', gymId: 'gym-1' } } as never)
      vi.mocked(prisma.asignacionAlumno.findFirst).mockResolvedValue({ id: 'asig-1' } as never)
      await expect(crearPlanNutricional(validInput)).rejects.toThrow('NEXT_REDIRECT')
    })
  })

  describe('validation', () => {
    beforeEach(() => {
      mockAuth.mockResolvedValue(entrenadorSession as never)
    })

    it('throws when nombre is empty', async () => {
      await expect(crearPlanNutricional({ ...validInput, nombre: '' })).rejects.toThrow(
        'El nombre del plan es obligatorio',
      )
    })

    it('throws when nombre is only whitespace', async () => {
      await expect(crearPlanNutricional({ ...validInput, nombre: '   ' })).rejects.toThrow(
        'El nombre del plan es obligatorio',
      )
    })

    it('throws when dias is empty', async () => {
      await expect(crearPlanNutricional({ ...validInput, dias: [] })).rejects.toThrow(
        'Debés agregar al menos 1 día al plan',
      )
    })

    it('throws when a dia has no comidas', async () => {
      const diaVacio = { ...validDia, comidas: [] }
      await expect(crearPlanNutricional({ ...validInput, dias: [diaVacio] })).rejects.toThrow(
        `El día ${diaVacio.dia} no tiene comidas`,
      )
    })
  })

  describe('happy path', () => {
    beforeEach(() => {
      mockAuth.mockResolvedValue(entrenadorSession as never)
    })

    it('deactivates previous plans and creates new one', async () => {
      await expect(crearPlanNutricional(validInput)).rejects.toThrow('NEXT_REDIRECT')

      expect(prisma.planNutricional.updateMany).toHaveBeenCalledWith({
        where: { alumnoId: validInput.alumnoId, activo: true },
        data: { activo: false },
      })

      expect(prisma.planNutricional.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            alumnoId: validInput.alumnoId,
            entrenadorId: 'entrenador-1',
            nombre: validInput.nombre,
            activo: true,
            kcalObjetivo: validInput.kcalObjetivo,
          }),
        }),
      )
    })

    it('redirects to alumno page after creation', async () => {
      const { redirect } = await import('next/navigation')
      await expect(crearPlanNutricional(validInput)).rejects.toThrow('NEXT_REDIRECT')
      expect(redirect).toHaveBeenCalledWith(`/entrenador/alumnos/${validInput.alumnoId}`)
    })

    it('maps dia string to DiaSemana enum value', async () => {
      await expect(crearPlanNutricional(validInput)).rejects.toThrow('NEXT_REDIRECT')

      const createCall = vi.mocked(prisma.planNutricional.create).mock.calls[0][0]
      const diasCreated = (createCall.data as { dias: { create: { dia: string }[] } }).dias.create
      expect(diasCreated[0].dia).toBe('LUNES')
    })

    it('sets vigenciaHasta to null when not provided', async () => {
      await expect(crearPlanNutricional({ ...validInput, vigenciaHasta: '' })).rejects.toThrow(
        'NEXT_REDIRECT',
      )

      const createCall = vi.mocked(prisma.planNutricional.create).mock.calls[0][0]
      expect((createCall.data as { vigenciaHasta: null }).vigenciaHasta).toBeNull()
    })

    it('passes macros correctly', async () => {
      await expect(crearPlanNutricional(validInput)).rejects.toThrow('NEXT_REDIRECT')

      const createCall = vi.mocked(prisma.planNutricional.create).mock.calls[0][0]
      const data = createCall.data as {
        proteinaG: number
        carbosG: number
        grasaG: number
      }
      expect(data.proteinaG).toBe(180)
      expect(data.carbosG).toBe(350)
      expect(data.grasaG).toBe(80)
    })
  })
})
