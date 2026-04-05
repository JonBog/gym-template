'use server'

import { crearPlanNutricional as crearPlanBase } from '@/app/entrenador/alumnos/[alumnoId]/nutricion/nuevo/actions'
import type { PlanInput } from '@/types/nutricion'

export async function crearPlanNutricional(input: PlanInput) {
  return crearPlanBase({
    ...input,
    redirectTo: input.redirectTo ?? `/admin/alumnos/${input.alumnoId}`,
  })
}
