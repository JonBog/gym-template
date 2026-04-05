'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'

type CrearEntrenadorInput = {
  nombre: string
  apellido: string
  email: string
  telefono: string
  especialidades: string
  password: string
}

export async function crearEntrenador(data: CrearEntrenadorInput) {
  const session = await auth()
  if (!session || session.user.rol !== 'ADMIN_GYM') {
    throw new Error('No autorizado')
  }

  if (!data.nombre.trim() || !data.apellido.trim()) {
    throw new Error('Nombre y apellido son obligatorios')
  }
  if (!data.email.trim()) {
    throw new Error('El email es obligatorio')
  }
  if (!data.password || data.password.length < 6) {
    throw new Error('La contrasena debe tener al menos 6 caracteres')
  }

  // Verificar que el email no exista
  const existe = await prisma.user.findUnique({ where: { email: data.email.trim().toLowerCase() } })
  if (existe) {
    throw new Error('Ya existe un usuario con ese email')
  }

  const passwordHash = await bcrypt.hash(data.password, 12)

  await prisma.user.create({
    data: {
      gymId:        session.user.gymId,
      nombre:       data.nombre.trim(),
      apellido:     data.apellido.trim(),
      email:        data.email.trim().toLowerCase(),
      telefono:     data.telefono.trim() || null,
      passwordHash,
      rol:          'ENTRENADOR',
    },
  })

  redirect('/admin/entrenadores')
}
