'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { DiaSemana } from '@prisma/client'
import { redirect } from 'next/navigation'
import type { PlanDiaInput } from '@/types/nutricion'

const DIA_MAP: Record<string, DiaSemana> = {
  LUNES: 'LUNES',
  MARTES: 'MARTES',
  MIERCOLES: 'MIERCOLES',
  JUEVES: 'JUEVES',
  VIERNES: 'VIERNES',
  SABADO: 'SABADO',
  DOMINGO: 'DOMINGO',
}

export type ActualizarPlanInput = {
  planId: string
  nombre: string
  objetivo: string
  kcalObjetivo: number | null
  proteinaG: number | null
  carbosG: number | null
  grasaG: number | null
  vigenciaDesde: string
  vigenciaHasta: string
  dias: PlanDiaInput[]
}

export async function actualizarPlanNutricional(input: ActualizarPlanInput) {
  const session = await auth()

  if (!session?.user) {
    throw new Error('No autenticado')
  }

  // Fetch plan to get alumnoId and validate ownership
  const plan = await prisma.planNutricional.findUnique({
    where: { id: input.planId },
    select: { alumnoId: true, entrenadorId: true },
  })

  if (!plan) {
    throw new Error('Plan no encontrado')
  }

  if (session.user.rol === 'ENTRENADOR') {
    // OK — entrenadores siempre pueden editar
  } else if (session.user.rol === 'ADMIN_GYM') {
    // Admin puede editar SOLO si está asignado como entrenador de este alumno
    const asignacion = await prisma.asignacionAlumno.findFirst({
      where: { entrenadorId: session.user.id, alumnoId: plan.alumnoId, activa: true },
    })
    if (!asignacion) {
      throw new Error('No tenés permisos para editar planes nutricionales para este alumno')
    }
  } else {
    throw new Error('No tenés permisos para editar planes nutricionales')
  }

  if (!input.nombre.trim()) {
    throw new Error('El nombre del plan es obligatorio')
  }

  if (input.dias.length === 0) {
    throw new Error('Debés agregar al menos 1 día al plan')
  }

  for (const dia of input.dias) {
    if (dia.comidas.length === 0) {
      throw new Error(`El día ${dia.dia} no tiene comidas`)
    }
  }

  await prisma.$transaction(async (tx) => {
    // Delete all existing PlanNutricionDia rows (cascades to Comida → Alimento)
    await tx.planNutricionDia.deleteMany({
      where: { planId: input.planId },
    })

    // Update the plan header
    await tx.planNutricional.update({
      where: { id: input.planId },
      data: {
        nombre: input.nombre.trim(),
        objetivo: input.objetivo.trim() || null,
        kcalObjetivo: input.kcalObjetivo,
        proteinaG: input.proteinaG,
        carbosG: input.carbosG,
        grasaG: input.grasaG,
        vigenciaDesde: input.vigenciaDesde ? new Date(input.vigenciaDesde) : new Date(),
        vigenciaHasta: input.vigenciaHasta ? new Date(input.vigenciaHasta) : null,
      },
    })

    // Create new dias, comidas, alimentos
    for (const dia of input.dias) {
      const planDia = await tx.planNutricionDia.create({
        data: {
          planId: input.planId,
          dia: DIA_MAP[dia.dia],
          nombre: dia.nombre.trim() || null,
        },
      })

      for (const comida of dia.comidas) {
        const comidaRow = await tx.comida.create({
          data: {
            diaId: planDia.id,
            nombre: comida.nombre.trim(),
            hora: comida.hora.trim() || null,
            orden: comida.orden,
          },
        })

        for (const al of comida.alimentos) {
          await tx.alimento.create({
            data: {
              comidaId: comidaRow.id,
              nombre: al.nombre.trim(),
              cantidad: al.cantidad,
              unidad: al.unidad,
              kcal: al.kcal,
              proteinaG: al.proteinaG,
              carbosG: al.carbosG,
              grasaG: al.grasaG,
              orden: al.orden,
            },
          })
        }
      }
    }
  })

  redirect(`/entrenador/alumnos/${plan.alumnoId}`)
}
