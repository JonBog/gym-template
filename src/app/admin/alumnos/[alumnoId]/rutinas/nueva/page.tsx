import { RutinaBuilderView } from '@/components/portal/alumnos/RutinaBuilderView'
import { prisma } from '@/lib/prisma'
import { crearRutina } from './actions'

export default async function NuevaRutinaAdminPage({
  params,
}: {
  params: Promise<{ alumnoId: string }>
}) {
  const { alumnoId } = await params

  const alumno = await prisma.user.findUnique({
    where: { id: alumnoId },
    select: { nombre: true, apellido: true },
  })

  return (
    <RutinaBuilderView
      alumnoId={alumnoId}
      alumnoNombre={alumno ? `${alumno.nombre} ${alumno.apellido}` : 'Alumno'}
      basePath="/admin/alumnos"
      crearRutinaAction={crearRutina}
    />
  )
}
