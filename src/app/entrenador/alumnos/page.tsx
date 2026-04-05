import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import AlumnosGrid from './AlumnosGrid'

export default async function AlumnosPage() {
  const session = await auth()
  if (!session) redirect('/login')

  // Buscar alumnos asignados a este entrenador
  const asignaciones = await prisma.asignacionAlumno.findMany({
    where: { entrenadorId: session.user.id, activa: true },
    select: { alumnoId: true },
  })
  const alumnoIds = asignaciones.map(a => a.alumnoId)

  // Si es ADMIN_GYM, ver todos los alumnos del gym
  const whereClause = session.user.rol === 'ADMIN_GYM'
    ? { gymId: session.user.gymId, rol: 'ALUMNO' as const }
    : { id: { in: alumnoIds }, rol: 'ALUMNO' as const }

  const alumnos = await prisma.user.findMany({
    where: whereClause,
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
    },
    orderBy: { nombre: 'asc' },
  })

  const alumnosData = alumnos.map(al => ({
    id: al.id,
    nombre: al.nombre,
    apellido: al.apellido,
    email: al.email,
    activo: al.activo,
    rutina: al.rutinas[0]?.nombre ?? 'Sin rutina',
    ultimaSesion: al.completados[0]?.fecha
      ? formatRelativeDate(al.completados[0].fecha)
      : 'Sin actividad',
  }))

  return <AlumnosGrid alumnos={alumnosData} />
}

function formatRelativeDate(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return 'Hoy'
  if (days === 1) return 'Hace 1 día'
  if (days < 7) return `Hace ${days} días`
  if (days < 30) return `Hace ${Math.floor(days / 7)} semana${Math.floor(days / 7) > 1 ? 's' : ''}`
  return `Hace ${Math.floor(days / 30)} mes${Math.floor(days / 30) > 1 ? 'es' : ''}`
}
