export type AlimentoInput = {
  nombre: string
  cantidad: number
  unidad: string
  kcal: number | null
  proteinaG: number | null
  carbosG: number | null
  grasaG: number | null
  orden: number
}

export type ComidaInput = {
  nombre: string
  hora: string
  orden: number
  alimentos: AlimentoInput[]
}

export type PlanDiaInput = {
  dia: string
  nombre: string
  comidas: ComidaInput[]
}

export type PlanInput = {
  alumnoId: string
  nombre: string
  objetivo: string
  kcalObjetivo: number | null
  proteinaG: number | null
  carbosG: number | null
  grasaG: number | null
  vigenciaDesde: string
  vigenciaHasta: string
  dias: PlanDiaInput[]
  redirectTo?: string
}
