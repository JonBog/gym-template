import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import EntrenadoresGrid from './EntrenadoresGrid'

export default async function EntrenadoresPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (session.user.rol !== 'ADMIN_GYM') redirect('/entrenador')

  const entrenadores = await prisma.user.findMany({
    where: { gymId: session.user.gymId, rol: 'ENTRENADOR' },
    select: {
      id: true,
      nombre: true,
      apellido: true,
      email: true,
      avatarUrl: true,
      activo: true,
      createdAt: true,
      entrenadorDe: {
        where: { activa: true },
        select: { alumnoId: true },
      },
    },
    orderBy: { nombre: 'asc' },
  })

  const entrenadoresData = entrenadores.map((ent) => ({
    id: ent.id,
    nombre: ent.nombre,
    apellido: ent.apellido,
    email: ent.email,
    avatarUrl: ent.avatarUrl,
    activo: ent.activo,
    totalAlumnos: ent.entrenadorDe.length,
    createdAt: ent.createdAt.toISOString(),
  }))

  return <EntrenadoresGrid entrenadores={entrenadoresData} />
}
