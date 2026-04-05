import { redirect, notFound } from 'next/navigation'
import { auth } from '@/auth'
import { getAlumnoData } from '@/lib/queries/alumno'
import AlumnoProfileView from '@/components/portal/alumnos/AlumnoProfileView'

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

  const data = await getAlumnoData(alumnoId)

  if (!data) {
    notFound()
  }

  return (
    <AlumnoProfileView data={data} basePath="/admin/alumnos" alumnoId={alumnoId} />
  )
}
