'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Re-export reactivar actions so admin detail pages can import from ../../actions
export { reactivarRutina, reactivarPlan } from '@/app/entrenador/alumnos/[alumnoId]/actions'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) throw new Error('No autenticado')
  if (session.user.rol !== 'ADMIN_GYM') throw new Error('Sin permisos')
  return session
}

export async function asignarEntrenador(alumnoId: string, entrenadorId: string) {
  await requireAdmin()

  // Desactivar cualquier asignación activa existente para este alumno
  await prisma.asignacionAlumno.updateMany({
    where: { alumnoId, activa: true },
    data: { activa: false },
  })

  // Intentar reactivar si ya existe el par (entrenadorId, alumnoId)
  const existing = await prisma.asignacionAlumno.findUnique({
    where: { entrenadorId_alumnoId: { entrenadorId, alumnoId } },
  })

  if (existing) {
    await prisma.asignacionAlumno.update({
      where: { entrenadorId_alumnoId: { entrenadorId, alumnoId } },
      data: { activa: true, asignadoEn: new Date() },
    })
  } else {
    await prisma.asignacionAlumno.create({
      data: { entrenadorId, alumnoId },
    })
  }

  revalidatePath(`/admin/alumnos/${alumnoId}`)
  revalidatePath('/admin/alumnos')
}

export async function desasignarEntrenador(alumnoId: string) {
  await requireAdmin()

  await prisma.asignacionAlumno.updateMany({
    where: { alumnoId, activa: true },
    data: { activa: false },
  })

  revalidatePath(`/admin/alumnos/${alumnoId}`)
  revalidatePath('/admin/alumnos')
}

export async function getEntrenadoresActivos() {
  const session = await auth()
  if (!session?.user) throw new Error('No autenticado')

  const entrenadores = await prisma.user.findMany({
    where: {
      gymId: session.user.gymId,
      rol: { in: ['ENTRENADOR', 'ADMIN_GYM'] },
      activo: true,
    },
    select: { id: true, nombre: true, apellido: true },
    orderBy: { nombre: 'asc' },
  })

  return entrenadores
}
