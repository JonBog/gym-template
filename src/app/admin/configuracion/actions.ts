'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

type ActualizarGymInput = {
  id: string
  nombre: string
  ciudad: string
  pais: string
  whatsapp: string
  instagram: string
  facebook: string
}

export async function obtenerGym() {
  const session = await auth()
  if (!session || session.user.rol !== 'ADMIN_GYM') {
    throw new Error('No autorizado')
  }

  const gym = await prisma.gym.findUnique({
    where: { id: session.user.gymId },
    select: {
      id: true,
      nombre: true,
      ciudad: true,
      pais: true,
      whatsapp: true,
      instagram: true,
      facebook: true,
    },
  })

  if (!gym) {
    throw new Error('Gym no encontrado')
  }

  return gym
}

export async function actualizarGym(data: ActualizarGymInput) {
  const session = await auth()
  if (!session || session.user.rol !== 'ADMIN_GYM') {
    throw new Error('No autorizado')
  }

  if (!data.nombre.trim()) {
    throw new Error('El nombre del gym es obligatorio')
  }

  await prisma.gym.update({
    where: { id: session.user.gymId },
    data: {
      nombre:    data.nombre.trim(),
      ciudad:    data.ciudad.trim() || null,
      pais:      data.pais.trim() || null,
      whatsapp:  data.whatsapp.trim() || null,
      instagram: data.instagram.trim() || null,
      facebook:  data.facebook.trim() || null,
    },
  })

  revalidatePath('/admin/configuracion')
}
