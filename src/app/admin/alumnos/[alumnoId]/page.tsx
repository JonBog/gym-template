import { redirect, notFound } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getAlumnoData } from '@/lib/queries/alumno'
import AlumnoProfileView from '@/components/portal/alumnos/AlumnoProfileView'
import AsignacionEntrenador from '@/components/portal/alumnos/AsignacionEntrenador'
import HistorialRutinas from '@/components/portal/alumnos/HistorialRutinas'
import HistorialPlanes from '@/components/portal/alumnos/HistorialPlanes'
import { reactivarRutina, reactivarPlan } from '@/app/entrenador/alumnos/[alumnoId]/actions'

type Props = {
  params: Promise<{ alumnoId: string }>
}

export default async function AdminAlumnoProfilePage({ params }: Props) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.rol !== 'ADMIN_GYM') {
    redirect('/login')
  }

  const { alumnoId } = await params

  const [data, asignacion, entrenadores] = await Promise.all([
    getAlumnoData(alumnoId),
    prisma.asignacionAlumno.findFirst({
      where: { alumnoId, activa: true },
      include: {
        entrenador: { select: { id: true, nombre: true, apellido: true } },
      },
    }),
    prisma.user.findMany({
      where: { gymId: session.user.gymId, rol: { in: ['ENTRENADOR', 'ADMIN_GYM'] }, activo: true },
      select: { id: true, nombre: true, apellido: true },
      orderBy: { nombre: 'asc' },
    }),
  ])

  if (!data) {
    notFound()
  }

  const entrenadorActual = asignacion
    ? {
        id: asignacion.entrenador.id,
        nombre: asignacion.entrenador.nombre,
        apellido: asignacion.entrenador.apellido,
      }
    : null

  const isAssignedTrainer = asignacion?.entrenador.id === session.user.id

  return (
    <AlumnoProfileView
      data={data}
      basePath="/admin/alumnos"
      alumnoId={alumnoId}
      showCreateButtons={isAssignedTrainer}
      createBasePath={isAssignedTrainer ? '/entrenador/alumnos' : undefined}
      asignacionSlot={
        <AsignacionEntrenador
          alumnoId={alumnoId}
          entrenadorActual={entrenadorActual}
          entrenadores={entrenadores}
          currentUserId={session.user.id}
        />
      }
      historialSlot={
        <>
          <HistorialRutinas
            rutinas={data.rutinasAnteriores}
            alumnoId={alumnoId}
            basePath="/admin/alumnos"
            reactivarAction={isAssignedTrainer ? reactivarRutina : undefined}
          />
          <HistorialPlanes
            planes={data.planesAnteriores}
            alumnoId={alumnoId}
            basePath="/admin/alumnos"
            reactivarAction={isAssignedTrainer ? reactivarPlan : undefined}
          />
        </>
      }
    />
  )
}
