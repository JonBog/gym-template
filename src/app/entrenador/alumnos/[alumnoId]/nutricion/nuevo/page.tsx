import { prisma } from '@/lib/prisma'
import NutricionBuilderView from '@/components/portal/alumnos/NutricionBuilderView'
import { crearPlanNutricional } from './actions'

export default async function NuevoPlanNutricionalPage({
  params,
}: {
  params: Promise<{ alumnoId: string }>
}) {
  const { alumnoId } = await params

  const alumno = await prisma.user.findUnique({
    where: { id: alumnoId },
    select: { nombre: true, apellido: true },
  })

  const alumnoNombre = alumno ? `${alumno.nombre} ${alumno.apellido}` : 'Alumno'

  return (
    <NutricionBuilderView
      alumnoId={alumnoId}
      alumnoNombre={alumnoNombre}
      basePath="/entrenador/alumnos"
      crearPlanAction={crearPlanNutricional}
    />
  )
}
