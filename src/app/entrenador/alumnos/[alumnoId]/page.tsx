import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getAlumnoData } from '@/lib/queries/alumno'
import AlumnoProfileView from '@/components/portal/alumnos/AlumnoProfileView'

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
    />
  )
}
