import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import AdminAlumnosGrid from './AdminAlumnosGrid'

export default async function AdminAlumnosPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (session.user.rol !== 'ADMIN_GYM') redirect('/entrenador')

  const gymId = session.user.gymId

  const [alumnos, misAsignaciones] = await Promise.all([
    prisma.user.findMany({
      where: { gymId, rol: 'ALUMNO' },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        activo: true,
        createdAt: true,
        rutinas: {
          where: { activa: true },
          select: { nombre: true },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
        completados: {
          select: { fecha: true },
          take: 1,
          orderBy: { fecha: 'desc' },
        },
        alumnoAsignado: {
          where: { activa: true },
          select: {
            entrenador: {
              select: { nombre: true, apellido: true },
            },
          },
          take: 1,
        },
      },
      orderBy: { nombre: 'asc' },
    }),
    prisma.asignacionAlumno.findMany({
      where: { entrenadorId: session.user.id, activa: true },
      select: { alumnoId: true },
    }),
  ])

  const misAlumnoIds = new Set(misAsignaciones.map((a) => a.alumnoId))

  const alumnosData = alumnos.map((al) => ({
    id: al.id,
    nombre: al.nombre,
    apellido: al.apellido,
    email: al.email,
    activo: al.activo,
    rutina: al.rutinas[0]?.nombre ?? 'Sin rutina',
    ultimaSesion: al.completados[0]?.fecha
      ? formatRelativeDate(al.completados[0].fecha)
      : 'Sin actividad',
    entrenador: al.alumnoAsignado[0]
      ? `${al.alumnoAsignado[0].entrenador.nombre} ${al.alumnoAsignado[0].entrenador.apellido}`
      : null,
    esMio: misAlumnoIds.has(al.id),
  }))

  return <AdminAlumnosGrid alumnos={alumnosData} />
}

function formatRelativeDate(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return 'Hoy'
  if (days === 1) return 'Hace 1 dia'
  if (days < 7) return `Hace ${days} dias`
  if (days < 30) return `Hace ${Math.floor(days / 7)} semana${Math.floor(days / 7) > 1 ? 's' : ''}`
  return `Hace ${Math.floor(days / 30)} mes${Math.floor(days / 30) > 1 ? 'es' : ''}`
}
