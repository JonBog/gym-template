'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

async function canManageAlumno(alumnoId: string): Promise<void> {
  const session = await auth()
  if (!session?.user) throw new Error('No autenticado')

  if (session.user.rol === 'ENTRENADOR') {
    // Entrenadores siempre pueden gestionar (podría validarse asignación)
    return
  }

  if (session.user.rol === 'ADMIN_GYM') {
    const asignacion = await prisma.asignacionAlumno.findFirst({
      where: { entrenadorId: session.user.id, alumnoId, activa: true },
    })
    if (!asignacion) {
      throw new Error('No tenés permisos para gestionar a este alumno')
    }
    return
  }

  throw new Error('No tenés permisos')
}

export async function reactivarRutina(rutinaId: string, alumnoId: string): Promise<void> {
  await canManageAlumno(alumnoId)

  await prisma.$transaction(async (tx) => {
    // Deactivate all active rutinas for this alumno
    await tx.rutina.updateMany({
      where: { alumnoId, activa: true },
      data: { activa: false },
    })

    // Activate the selected rutina
    await tx.rutina.update({
      where: { id: rutinaId },
      data: { activa: true },
    })
  })

  revalidatePath(`/entrenador/alumnos/${alumnoId}`)
  revalidatePath(`/admin/alumnos/${alumnoId}`)
}

export async function reactivarPlan(planId: string, alumnoId: string): Promise<void> {
  await canManageAlumno(alumnoId)

  await prisma.$transaction(async (tx) => {
    // Deactivate all active plans for this alumno
    await tx.planNutricional.updateMany({
      where: { alumnoId, activo: true },
      data: { activo: false },
    })

    // Activate the selected plan
    await tx.planNutricional.update({
      where: { id: planId },
      data: { activo: true },
    })
  })

  revalidatePath(`/entrenador/alumnos/${alumnoId}`)
  revalidatePath(`/admin/alumnos/${alumnoId}`)
}
