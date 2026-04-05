import { redirect } from 'next/navigation'
import { use } from 'react'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import NutricionBuilderView from '@/components/portal/alumnos/NutricionBuilderView'
import { crearPlanNutricional } from './actions'

export default async function AdminNuevoPlanNutricionalPage({
  params,
}: {
  params: Promise<{ alumnoId: string }>
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.rol !== 'ADMIN_GYM') {
    redirect('/entrenador')
  }

  const { alumnoId } = use(params)

  const alumno = await prisma.user.findUnique({
    where: { id: alumnoId },
    select: { nombre: true, apellido: true },
  })

  const alumnoNombre = alumno ? `${alumno.nombre} ${alumno.apellido}` : 'Alumno'

  return (
    <NutricionBuilderView
      alumnoId={alumnoId}
      alumnoNombre={alumnoNombre}
      basePath="/admin/alumnos"
      crearPlanAction={crearPlanNutricional}
    />
  )
}
