import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import NutricionBuilderView, {
  PlanInitialData,
} from '@/components/portal/alumnos/NutricionBuilderView'
import { crearPlanNutricional } from '../../nuevo/actions'
import { actualizarPlanNutricional } from './actions'

function toDateString(date: Date | null | undefined): string {
  if (!date) return ''
  return date.toISOString().slice(0, 10)
}

export default async function EditarPlanNutricionalPage({
  params,
}: {
  params: Promise<{ alumnoId: string; planId: string }>
}) {
  const { alumnoId, planId } = await params

  const [alumno, plan] = await Promise.all([
    prisma.user.findUnique({
      where: { id: alumnoId },
      select: { nombre: true, apellido: true },
    }),
    prisma.planNutricional.findUnique({
      where: { id: planId },
      include: {
        dias: {
          include: {
            comidas: {
              include: {
                alimentos: {
                  orderBy: { orden: 'asc' },
                },
              },
              orderBy: { orden: 'asc' },
            },
          },
        },
      },
    }),
  ])

  if (!alumno || !plan || plan.alumnoId !== alumnoId) {
    notFound()
  }

  const alumnoNombre = `${alumno.nombre} ${alumno.apellido}`

  const initialData: PlanInitialData = {
    id: plan.id,
    nombre: plan.nombre,
    descripcion: '',
    vigenciaDesde: toDateString(plan.vigenciaDesde),
    vigenciaHasta: toDateString(plan.vigenciaHasta ?? null),
    objetivo: plan.objetivo ?? '',
    kcalObjetivo: plan.kcalObjetivo,
    proteinaG: plan.proteinaG,
    carbosG: plan.carbosG,
    grasaG: plan.grasaG,
    dias: plan.dias.map((dia) => ({
      dia: dia.dia,
      comidas: dia.comidas.map((comida) => ({
        nombre: comida.nombre,
        hora: comida.hora ?? '',
        orden: comida.orden,
        alimentos: comida.alimentos.map((al) => ({
          nombre: al.nombre,
          cantidad: String(al.cantidad),
          calorias: al.kcal ?? null,
          proteinas: al.proteinaG ?? null,
          carbohidratos: al.carbosG ?? null,
          grasas: al.grasaG ?? null,
          orden: al.orden,
        })),
      })),
    })),
  }

  return (
    <NutricionBuilderView
      alumnoId={alumnoId}
      alumnoNombre={alumnoNombre}
      basePath="/entrenador/alumnos"
      crearPlanAction={crearPlanNutricional}
      initialData={initialData}
      actualizarPlanAction={actualizarPlanNutricional}
    />
  )
}
