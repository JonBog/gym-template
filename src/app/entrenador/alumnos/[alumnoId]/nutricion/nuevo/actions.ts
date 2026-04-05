'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { DiaSemana } from '@prisma/client'
import { redirect } from 'next/navigation'
import type { PlanInput } from '@/types/nutricion'

const DIA_MAP: Record<string, DiaSemana> = {
  LUNES: 'LUNES',
  MARTES: 'MARTES',
  MIERCOLES: 'MIERCOLES',
  JUEVES: 'JUEVES',
  VIERNES: 'VIERNES',
  SABADO: 'SABADO',
  DOMINGO: 'DOMINGO',
}

export async function crearPlanNutricional(input: PlanInput) {
  const session = await auth()

  if (!session?.user) {
    throw new Error('No autenticado')
  }

  if (session.user.rol !== 'ENTRENADOR' && session.user.rol !== 'ADMIN_GYM') {
    throw new Error('No tenés permisos para crear planes nutricionales')
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
    // Desactivar planes anteriores del alumno
    await tx.planNutricional.updateMany({
      where: { alumnoId: input.alumnoId, activo: true },
      data: { activo: false },
    })

    // Crear el nuevo plan con días, comidas y alimentos
    await tx.planNutricional.create({
      data: {
        alumnoId: input.alumnoId,
        entrenadorId: session.user.id,
        nombre: input.nombre.trim(),
        objetivo: input.objetivo.trim() || null,
        activo: true,
        kcalObjetivo: input.kcalObjetivo,
        proteinaG: input.proteinaG,
        carbosG: input.carbosG,
        grasaG: input.grasaG,
        vigenciaDesde: input.vigenciaDesde
          ? new Date(input.vigenciaDesde)
          : new Date(),
        vigenciaHasta: input.vigenciaHasta
          ? new Date(input.vigenciaHasta)
          : null,
        dias: {
          create: input.dias.map((dia) => ({
            dia: DIA_MAP[dia.dia],
            nombre: dia.nombre.trim() || null,
            comidas: {
              create: dia.comidas.map((comida) => ({
                nombre: comida.nombre.trim(),
                hora: comida.hora.trim() || null,
                orden: comida.orden,
                alimentos: {
                  create: comida.alimentos.map((al) => ({
                    nombre: al.nombre.trim(),
                    cantidad: al.cantidad,
                    unidad: al.unidad,
                    kcal: al.kcal,
                    proteinaG: al.proteinaG,
                    carbosG: al.carbosG,
                    grasaG: al.grasaG,
                    orden: al.orden,
                  })),
                },
              })),
            },
          })),
        },
      },
    })
  })

  redirect(input.redirectTo ?? `/entrenador/alumnos/${input.alumnoId}`)
}
