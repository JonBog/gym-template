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

const rutinaAnteriorSelect = {
  id: true,
  nombre: true,
  vigenciaDesde: true,
  vigenciaHasta: true,
  createdAt: true,
  _count: { select: { dias: true } },
} satisfies Prisma.RutinaSelect

const planAnteriorSelect = {
  id: true,
  nombre: true,
  vigenciaDesde: true,
  vigenciaHasta: true,
  createdAt: true,
} satisfies Prisma.PlanNutricionalSelect

type PlanActivo = Prisma.PlanNutricionalGetPayload<{ select: typeof planActivoSelect }> | null
type ProgresoRow = Prisma.ProgresoGetPayload<Record<string, never>>
export type RutinaAnterior = Prisma.RutinaGetPayload<{ select: typeof rutinaAnteriorSelect }>
export type PlanAnterior = Prisma.PlanNutricionalGetPayload<{ select: typeof planAnteriorSelect }>

export type AlumnoData = {
  alumno: AlumnoRow
  rutinaActiva: RutinaActiva
  planActivo: PlanActivo
  progresos: ProgresoRow[]
  rutinasAnteriores: RutinaAnterior[]
  planesAnteriores: PlanAnterior[]
}

export async function getAlumnoData(alumnoId: string): Promise<AlumnoData | null> {
  const alumno = await prisma.user.findUnique({
    where: { id: alumnoId },
    select: alumnoSelect,
  })

  if (!alumno) return null

  const [rutinaActiva, planActivo, progresos, rutinasAnteriores, planesAnteriores] =
    await Promise.all([
      prisma.rutina.findFirst({
        where: { alumnoId, activa: true },
        orderBy: { createdAt: 'desc' },
        include: rutinaInclude,
      }),
      prisma.planNutricional.findFirst({
        where: { alumnoId, activo: true },
        orderBy: { createdAt: 'desc' },
        select: planActivoSelect,
      }),
      prisma.progreso.findMany({
        where: { alumnoId },
        orderBy: { fecha: 'desc' },
        take: 6,
      }),
      prisma.rutina.findMany({
        where: { alumnoId, activa: false },
        orderBy: { createdAt: 'desc' },
        select: rutinaAnteriorSelect,
        take: 10,
      }),
      prisma.planNutricional.findMany({
        where: { alumnoId, activo: false },
        orderBy: { createdAt: 'desc' },
        select: planAnteriorSelect,
        take: 10,
      }),
    ])

  return { alumno, rutinaActiva, planActivo, progresos, rutinasAnteriores, planesAnteriores }
}
