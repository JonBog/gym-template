'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function toggleEjercicioCompletado(ejercicioId: string) {
  const session = await auth()
  if (!session?.user) throw new Error('No autenticado')

  const alumnoId = session.user.id

  // Fecha de hoy sin horas
  const now = new Date()
  const fechaHoy = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  // Buscar si ya existe un registro para hoy
  const existing = await prisma.ejercicioCompletado.findUnique({
    where: {
      ejercicioId_alumnoId_fecha: {
        ejercicioId,
        alumnoId,
        fecha: fechaHoy,
      },
    },
  })

  if (existing) {
    await prisma.ejercicioCompletado.delete({
      where: { id: existing.id },
    })
  } else {
    await prisma.ejercicioCompletado.create({
      data: {
        ejercicioId,
        alumnoId,
        fecha: fechaHoy,
      },
    })
  }

  revalidatePath('/alumno/rutinas')
  revalidatePath('/alumno')
}
