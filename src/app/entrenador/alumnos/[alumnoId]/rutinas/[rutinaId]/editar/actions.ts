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

type RutinaActualizarInput = {
  rutinaId: string
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

export async function actualizarRutina(input: RutinaActualizarInput) {
  const session = await auth()

  if (!session?.user) {
    throw new Error('No autenticado')
  }

  // Fetch the rutina to get the alumnoId and verify ownership
  const rutina = await prisma.rutina.findUnique({
    where: { id: input.rutinaId },
    select: { alumnoId: true, entrenadorId: true },
  })

  if (!rutina) {
    throw new Error('Rutina no encontrada')
  }

  if (session.user.rol === 'ENTRENADOR') {
    // OK — entrenadores siempre pueden editar (podría validarse que sea el entrenador asignado)
  } else if (session.user.rol === 'ADMIN_GYM') {
    const asignacion = await prisma.asignacionAlumno.findFirst({
      where: { entrenadorId: session.user.id, alumnoId: rutina.alumnoId, activa: true },
    })
    if (!asignacion) {
      throw new Error('No tenés permisos para editar rutinas de este alumno')
    }
  } else {
    throw new Error('No tenés permisos para editar rutinas')
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
    // Delete all existing days (cascades to ejercicios via onDelete: Cascade)
    await tx.rutinaDia.deleteMany({
      where: { rutinaId: input.rutinaId },
    })

    // Update the rutina header
    await tx.rutina.update({
      where: { id: input.rutinaId },
      data: {
        nombre: input.nombre.trim(),
        descripcion: input.descripcion.trim() || null,
        vigenciaDesde: input.vigenciaDesde ? new Date(input.vigenciaDesde) : new Date(),
        vigenciaHasta: input.vigenciaHasta ? new Date(input.vigenciaHasta) : null,
      },
    })

    // Recreate days and exercises
    for (let diaIdx = 0; diaIdx < input.dias.length; diaIdx++) {
      const dia = input.dias[diaIdx]
      await tx.rutinaDia.create({
        data: {
          rutinaId: input.rutinaId,
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
        },
      })
    }
  })

  redirect(input.redirectTo ?? `/entrenador/alumnos/${rutina.alumnoId}`)
}
