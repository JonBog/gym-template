'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function toggleEntrenadorActivo(entrenadorId: string): Promise<void> {
  const session = await auth()

  if (!session?.user || session.user.rol !== 'ADMIN_GYM') {
    throw new Error('No autorizado')
  }

  const entrenador = await prisma.user.findFirst({
    where: {
      id: entrenadorId,
      gymId: session.user.gymId,
      rol: 'ENTRENADOR',
    },
    select: { activo: true },
  })

  if (!entrenador) {
    throw new Error('Entrenador no encontrado')
  }

  await prisma.user.update({
    where: { id: entrenadorId },
    data: { activo: !entrenador.activo },
  })

  revalidatePath('/admin/entrenadores')
}
