'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { DiaSemana } from '@prisma/client'
import { redirect } from 'next/navigation'

type EjercicioInput = {
  nombre: string
  series: number | null
  repsMin: number | null
  repsMax: number | null
  pesoKg: number | null
  pesoNota: string
  descansoSeg: number | null
  videoUrl: string
  orden: number
}

type DiaInput = {
  dia: string
  nombre: string
  tipo: string
  ejercicios: EjercicioInput[]
}

type RutinaInput = {
  alumnoId: string
  nombre: string
  descripcion: string
  vigenciaDesde: string
  vigenciaHasta: string
  dias: DiaInput[]
  redirectTo?: string
}

const DIA_MAP: Record<string, DiaSemana> = {
  LUNES: 'LUNES',
  MARTES: 'MARTES',
  MIERCOLES: 'MIERCOLES',
  JUEVES: 'JUEVES',
  VIERNES: 'VIERNES',
  SABADO: 'SABADO',
  DOMINGO: 'DOMINGO',
}

export async function crearRutina(input: RutinaInput) {
  const session = await auth()

  if (!session?.user) {
    throw new Error('No autenticado')
  }

  if (session.user.rol === 'ENTRENADOR') {
    // OK — entrenadores siempre pueden crear
  } else if (session.user.rol === 'ADMIN_GYM') {
    // Admin puede crear SOLO si está asignado como entrenador de este alumno
    const asignacion = await prisma.asignacionAlumno.findFirst({
      where: { entrenadorId: session.user.id, alumnoId: input.alumnoId, activa: true },
    })
    if (!asignacion) {
      throw new Error('No tenés permisos para crear rutinas para este alumno')
    }
  } else {
    throw new Error('No tenés permisos para crear rutinas')
  }

  if (!input.nombre.trim()) {
    throw new Error('El nombre de la rutina es obligatorio')
  }

  if (input.dias.length === 0) {
    throw new Error('Debés agregar al menos 1 día de entrenamiento')
  }

  for (const dia of input.dias) {
    if (dia.ejercicios.length === 0) {
      throw new Error(`El día ${dia.dia} no tiene ejercicios`)
    }
  }

  await prisma.$transaction(async (tx) => {
    // Desactivar rutinas anteriores del alumno
    await tx.rutina.updateMany({
      where: { alumnoId: input.alumnoId, activa: true },
      data: { activa: false },
    })

    // Crear la nueva rutina con días y ejercicios
    await tx.rutina.create({
      data: {
        alumnoId: input.alumnoId,
        entrenadorId: session.user.id,
        nombre: input.nombre.trim(),
        descripcion: input.descripcion.trim() || null,
        activa: true,
        vigenciaDesde: input.vigenciaDesde
          ? new Date(input.vigenciaDesde)
          : new Date(),
        vigenciaHasta: input.vigenciaHasta
          ? new Date(input.vigenciaHasta)
          : null,
        dias: {
          create: input.dias.map((dia, diaIdx) => ({
            dia: DIA_MAP[dia.dia],
            nombre: dia.nombre.trim() || null,
            tipo: dia.tipo || null,
            orden: diaIdx,
            ejercicios: {
              create: dia.ejercicios.map((ej) => ({
                nombre: ej.nombre.trim(),
                series: ej.series,
                repsMin: ej.repsMin,
                repsMax: ej.repsMax,
                pesoKg: ej.pesoKg,
                pesoNota: ej.pesoNota.trim() || null,
                descansoSeg: ej.descansoSeg,
                videoUrl: ej.videoUrl.trim() || null,
                orden: ej.orden,
              })),
            },
          })),
        },
      },
    })
  })

  redirect(input.redirectTo ?? `/entrenador/alumnos/${input.alumnoId}`)
}
