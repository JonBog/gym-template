import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

// Infer return types directly from the Prisma query shapes

const alumnoSelect = {
  id: true,
  nombre: true,
  apellido: true,
  email: true,
  telefono: true,
  activo: true,
  createdAt: true,
  avatarUrl: true,
} satisfies Prisma.UserSelect

const rutinaInclude = {
  dias: {
    include: { ejercicios: true },
    orderBy: { orden: 'asc' as const },
  },
} satisfies Prisma.RutinaInclude

type AlumnoRow = Prisma.UserGetPayload<{ select: typeof alumnoSelect }>
type RutinaActiva = Prisma.RutinaGetPayload<{ include: typeof rutinaInclude }> | null
const planActivoSelect = {
  id: true,
  nombre: true,
  objetivo: true,
  activo: true,
  kcalObjetivo: true,
  proteinaG: true,
  carbosG: true,
  grasaG: true,
  vigenciaDesde: true,
  vigenciaHasta: true,
  createdAt: true,
  updatedAt: true,
  alumnoId: true,
  entrenadorId: true,
} satisfies Prisma.PlanNutricionalSelect

type PlanActivo = Prisma.PlanNutricionalGetPayload<{ select: typeof planActivoSelect }> | null
type ProgresoRow = Prisma.ProgresoGetPayload<Record<string, never>>

export type AlumnoData = {
  alumno: AlumnoRow
  rutinaActiva: RutinaActiva
  planActivo: PlanActivo
  progresos: ProgresoRow[]
}

export async function getAlumnoData(alumnoId: string): Promise<AlumnoData | null> {
  const alumno = await prisma.user.findUnique({
    where: { id: alumnoId },
    select: alumnoSelect,
  })

  if (!alumno) return null

  const rutinaActiva = await prisma.rutina.findFirst({
    where: { alumnoId, activa: true },
    orderBy: { createdAt: 'desc' },
    include: rutinaInclude,
  })

  const planActivo = await prisma.planNutricional.findFirst({
    where: { alumnoId, activo: true },
    orderBy: { createdAt: 'desc' },
    select: planActivoSelect,
  })

  const progresos = await prisma.progreso.findMany({
    where: { alumnoId },
    orderBy: { fecha: 'desc' },
    take: 6,
  })

  return { alumno, rutinaActiva, planActivo, progresos }
}
