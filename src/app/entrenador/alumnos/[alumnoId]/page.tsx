import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getAlumnoData } from '@/lib/queries/alumno'
import AlumnoProfileView from '@/components/portal/alumnos/AlumnoProfileView'
import HistorialRutinas from '@/components/portal/alumnos/HistorialRutinas'
import HistorialPlanes from '@/components/portal/alumnos/HistorialPlanes'
import { reactivarRutina, reactivarPlan } from './actions'

export default async function AlumnoPerfilPage({
  params,
}: {
  params: Promise<{ alumnoId: string }>
}) {
  const session = await auth()
  if (!session) redirect('/login')

  const { alumnoId } = await params
  const data = await getAlumnoData(alumnoId)

  if (!data) notFound()

  return (
    <AlumnoProfileView
      data={data}
      basePath="/entrenador/alumnos"
      alumnoId={alumnoId}
      historialSlot={
        <>
          <HistorialRutinas
            rutinas={data.rutinasAnteriores}
            alumnoId={alumnoId}
            basePath="/entrenador/alumnos"
            reactivarAction={reactivarRutina}
          />
          <HistorialPlanes
            planes={data.planesAnteriores}
            alumnoId={alumnoId}
            basePath="/entrenador/alumnos"
            reactivarAction={reactivarPlan}
          />
        </>
      }
    />
  )
}
