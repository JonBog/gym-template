'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'

type CrearAlumnoInput = {
  nombre: string
  apellido: string
  email: string
  telefono: string
  fechaNacimiento: string
  objetivo: string
  password: string
}

export async function crearAlumno(data: CrearAlumnoInput) {
  const session = await auth()
  if (!session || !['ENTRENADOR', 'ADMIN_GYM'].includes(session.user.rol)) {
    throw new Error('No autorizado')
  }

  if (!data.nombre.trim() || !data.apellido.trim()) {
    throw new Error('Nombre y apellido son obligatorios')
  }
  if (!data.email.trim()) {
    throw new Error('El email es obligatorio')
  }
  if (!data.password || data.password.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres')
  }

  // Verificar que el email no exista
  const existe = await prisma.user.findUnique({ where: { email: data.email } })
  if (existe) {
    throw new Error('Ya existe un usuario con ese email')
  }

  const passwordHash = await bcrypt.hash(data.password, 12)

  // Crear alumno + asignación al entrenador en una transacción
  const alumno = await prisma.$transaction(async (tx) => {
    const nuevoAlumno = await tx.user.create({
      data: {
        gymId:           session.user.gymId,
        nombre:          data.nombre.trim(),
        apellido:        data.apellido.trim(),
        email:           data.email.trim().toLowerCase(),
        telefono:        data.telefono.trim() || null,
        fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : null,
        passwordHash,
        rol:             'ALUMNO',
      },
    })

    // Asignar al entrenador que lo creó
    await tx.asignacionAlumno.create({
      data: {
        entrenadorId: session.user.id,
        alumnoId:     nuevoAlumno.id,
      },
    })

    return nuevoAlumno
  })

  redirect(`/entrenador/alumnos/${alumno.id}`)
}
