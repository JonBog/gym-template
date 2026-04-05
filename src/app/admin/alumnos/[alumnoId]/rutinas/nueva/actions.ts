'use server'

import { crearRutina as crearRutinaBase } from '@/app/entrenador/alumnos/[alumnoId]/rutinas/nueva/actions'
import type { RutinaInput } from '@/components/portal/alumnos/RutinaBuilderView'

export async function crearRutina(input: RutinaInput) {
  return crearRutinaBase({
    ...input,
    redirectTo: input.redirectTo ?? `/admin/alumnos/${input.alumnoId}`,
  })
}
