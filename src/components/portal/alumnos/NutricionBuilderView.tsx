'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import type { PlanInput } from '@/types/nutricion'

type AlimentoForm = {
  id: string
  nombre: string
  cantidad: string
  unidad: string
  kcal: string
  proteina: string
  carbos: string
  grasa: string
}

type ComidaForm = {
  id: string
  nombre: string
  hora: string
  alimentos: AlimentoForm[]
}

type DiaForm = {
  activo: boolean
  comidas: ComidaForm[]
}

export type PlanInitialData = {
  id: string
  nombre: string
  descripcion: string
  vigenciaDesde: string // ISO YYYY-MM-DD
  vigenciaHasta: string
  objetivo: string
  kcalObjetivo?: number | null
  proteinaG?: number | null
  carbosG?: number | null
  grasaG?: number | null
  dias: {
    dia: string
    comidas: {
      nombre: string
      hora: string
      orden: number
      alimentos: {
        nombre: string
        cantidad: string
        calorias: number | null
        proteinas: number | null
        carbohidratos: number | null
        grasas: number | null
        orden: number
      }[]
    }[]
  }[]
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
  dias: PlanInput['dias']
}

const DIAS = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'] as const
const DIAS_FULL = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
]
const UNIDADES = ['g', 'ml', 'unidad', 'cda']
const DIAS_ENUM = [
  'LUNES',
  'MARTES',
  'MIERCOLES',
  'JUEVES',
  'VIERNES',
  'SABADO',
  'DOMINGO',
] as const

function crearAlimento(): AlimentoForm {
  return {
    id: crypto.randomUUID(),
    nombre: '',
    cantidad: '',
    unidad: 'g',
    kcal: '',
    proteina: '',
    carbos: '',
    grasa: '',
  }
}

function crearComida(): ComidaForm {
  return {
    id: crypto.randomUUID(),
    nombre: '',
    hora: '',
    alimentos: [crearAlimento()],
  }
}

function crearDiaInicial(): DiaForm {
  return {
    activo: false,
    comidas: [],
  }
}

function buildDiasFromInitial(initialData: PlanInitialData): DiaForm[] {
  return DIAS_ENUM.map((diaEnum) => {
    const diaData = initialData.dias.find((d) => d.dia === diaEnum)
    if (!diaData) return crearDiaInicial()
    return {
      activo: true,
      comidas: diaData.comidas
        .slice()
        .sort((a, b) => a.orden - b.orden)
        .map((comida) => ({
          id: crypto.randomUUID(),
          nombre: comida.nombre,
          hora: comida.hora ?? '',
          alimentos: comida.alimentos
            .slice()
            .sort((a, b) => a.orden - b.orden)
            .map((al) => ({
              id: crypto.randomUUID(),
              nombre: al.nombre,
              cantidad: al.cantidad ?? '',
              unidad: 'g',
              kcal: al.calorias != null ? String(al.calorias) : '',
              proteina: al.proteinas != null ? String(al.proteinas) : '',
              carbos: al.carbohidratos != null ? String(al.carbohidratos) : '',
              grasa: al.grasas != null ? String(al.grasas) : '',
            })),
        })),
    }
  })
}

const inputStyle = {
  background: 'var(--gym-surface-alt)',
  color: '#ffffff',
  border: '1px solid rgba(255,255,255,0.08)',
}

const innerInputStyle = {
  background: 'var(--gym-surface)',
  color: '#ffffff',
  border: '1px solid rgba(255,255,255,0.06)',
}

type Props = {
  alumnoId: string
  alumnoNombre: string
  basePath: string
  crearPlanAction: (input: PlanInput) => Promise<void>
  initialData?: PlanInitialData
  actualizarPlanAction?: (input: ActualizarPlanInput) => Promise<void>
}

export default function NutricionBuilderView({
  alumnoId,
  alumnoNombre,
  basePath,
  crearPlanAction,
  initialData,
  actualizarPlanAction,
}: Props) {
  const isEditing = !!initialData && !!actualizarPlanAction

  const [nombre, setNombre] = useState(initialData?.nombre ?? '')
  const [objetivo, setObjetivo] = useState(initialData?.objetivo ?? '')
  const [kcal, setKcal] = useState(
    initialData?.kcalObjetivo != null ? String(initialData.kcalObjetivo) : '',
  )
  const [proteina, setProteina] = useState(
    initialData?.proteinaG != null ? String(initialData.proteinaG) : '',
  )
  const [carbos, setCarbos] = useState(
    initialData?.carbosG != null ? String(initialData.carbosG) : '',
  )
  const [grasa, setGrasa] = useState(
    initialData?.grasaG != null ? String(initialData.grasaG) : '',
  )
  const [vigenciaDesde, setVigenciaDesde] = useState(initialData?.vigenciaDesde ?? '')
  const [vigenciaHasta, setVigenciaHasta] = useState(initialData?.vigenciaHasta ?? '')
  const [dias, setDias] = useState<DiaForm[]>(
    initialData
      ? buildDiasFromInitial(initialData)
      : Array.from({ length: 7 }, () => crearDiaInicial()),
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleGuardar = () => {
    setError('')

    const diasActivos = dias
      .map((dia, idx) => ({ ...dia, idx }))
      .filter((d) => d.activo)

    if (diasActivos.length === 0) {
      setError('Debes activar al menos 1 dia del plan')
      return
    }

    for (const d of diasActivos) {
      if (d.comidas.length === 0) {
        setError(`${DIAS_FULL[d.idx]} no tiene comidas`)
        return
      }
      for (const comida of d.comidas) {
        if (!comida.nombre.trim()) {
          setError(`Hay comidas sin nombre en ${DIAS_FULL[d.idx]}`)
          return
        }
        if (comida.alimentos.length === 0) {
          setError(`La comida "${comida.nombre}" en ${DIAS_FULL[d.idx]} no tiene alimentos`)
          return
        }
        for (const al of comida.alimentos) {
          if (!al.nombre.trim()) {
            setError(`Hay alimentos sin nombre en "${comida.nombre}" (${DIAS_FULL[d.idx]})`)
            return
          }
        }
      }
    }

    const diasPayload = diasActivos.map((d) => ({
      dia: DIAS_ENUM[d.idx],
      nombre: DIAS_FULL[d.idx],
      comidas: d.comidas.map((comida, cIdx) => ({
        nombre: comida.nombre,
        hora: comida.hora,
        orden: cIdx,
        alimentos: comida.alimentos.map((al, alIdx) => ({
          nombre: al.nombre,
          cantidad: al.cantidad ? parseFloat(al.cantidad) : 0,
          unidad: al.unidad,
          kcal: al.kcal ? parseFloat(al.kcal) : null,
          proteinaG: al.proteina ? parseFloat(al.proteina) : null,
          carbosG: al.carbos ? parseFloat(al.carbos) : null,
          grasaG: al.grasa ? parseFloat(al.grasa) : null,
          orden: alIdx,
        })),
      })),
    }))

    setSaving(true)
    startTransition(async () => {
      try {
        if (isEditing) {
          await actualizarPlanAction({
            planId: initialData.id,
            nombre,
            objetivo,
            kcalObjetivo: kcal ? parseInt(kcal) : null,
            proteinaG: proteina ? parseFloat(proteina) : null,
            carbosG: carbos ? parseFloat(carbos) : null,
            grasaG: grasa ? parseFloat(grasa) : null,
            vigenciaDesde,
            vigenciaHasta,
            dias: diasPayload,
          })
        } else {
          await crearPlanAction({
            alumnoId,
            nombre,
            objetivo,
            kcalObjetivo: kcal ? parseInt(kcal) : null,
            proteinaG: proteina ? parseFloat(proteina) : null,
            carbosG: carbos ? parseFloat(carbos) : null,
            grasaG: grasa ? parseFloat(grasa) : null,
            vigenciaDesde,
            vigenciaHasta,
            dias: diasPayload,
          })
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al guardar el plan')
        setSaving(false)
      }
    })
  }

  const toggleDia = (idx: number) => {
    setDias((prev) => {
      const next = [...prev]
      const dia = { ...next[idx] }
      dia.activo = !dia.activo
      if (dia.activo && dia.comidas.length === 0) {
        dia.comidas = [crearComida()]
      }
      next[idx] = dia
      return next
    })
  }

  const addComida = (diaIdx: number) => {
    setDias((prev) => {
      const next = [...prev]
      const dia = { ...next[diaIdx] }
      dia.comidas = [...dia.comidas, crearComida()]
      next[diaIdx] = dia
      return next
    })
  }

  const removeComida = (diaIdx: number, comidaId: string) => {
    setDias((prev) => {
      const next = [...prev]
      const dia = { ...next[diaIdx] }
      dia.comidas = dia.comidas.filter((c) => c.id !== comidaId)
      next[diaIdx] = dia
      return next
    })
  }

  const updateComida = (
    diaIdx: number,
    comidaId: string,
    field: keyof ComidaForm,
    value: string,
  ) => {
    setDias((prev) => {
      const next = [...prev]
      const dia = { ...next[diaIdx] }
      dia.comidas = dia.comidas.map((c) =>
        c.id === comidaId ? { ...c, [field]: value } : c,
      )
      next[diaIdx] = dia
      return next
    })
  }

  const addAlimento = (diaIdx: number, comidaId: string) => {
    setDias((prev) => {
      const next = [...prev]
      const dia = { ...next[diaIdx] }
      dia.comidas = dia.comidas.map((c) =>
        c.id === comidaId
          ? { ...c, alimentos: [...c.alimentos, crearAlimento()] }
          : c,
      )
      next[diaIdx] = dia
      return next
    })
  }

  const removeAlimento = (
    diaIdx: number,
    comidaId: string,
    alimentoId: string,
  ) => {
    setDias((prev) => {
      const next = [...prev]
      const dia = { ...next[diaIdx] }
      dia.comidas = dia.comidas.map((c) =>
        c.id === comidaId
          ? { ...c, alimentos: c.alimentos.filter((a) => a.id !== alimentoId) }
          : c,
      )
      next[diaIdx] = dia
      return next
    })
  }

  const updateAlimento = (
    diaIdx: number,
    comidaId: string,
    alimentoId: string,
    field: keyof AlimentoForm,
    value: string,
  ) => {
    setDias((prev) => {
      const next = [...prev]
      const dia = { ...next[diaIdx] }
      dia.comidas = dia.comidas.map((c) =>
        c.id === comidaId
          ? {
              ...c,
              alimentos: c.alimentos.map((a) =>
                a.id === alimentoId ? { ...a, [field]: value } : a,
              ),
            }
          : c,
      )
      next[diaIdx] = dia
      return next
    })
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Volver */}
      <Link
        href={`${basePath}/${alumnoId}`}
        className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
        style={{ color: 'var(--primary)' }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
        Volver al perfil
      </Link>

      {/* Header */}
      <h2
        className="text-2xl font-bold"
        style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
      >
        {isEditing ? 'Editar Plan Nutricional' : 'Nuevo Plan Nutricional'} para{' '}
        <span style={{ color: 'var(--primary)' }}>{alumnoNombre}</span>
      </h2>

      {/* Campos básicos */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: 'var(--gym-surface)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <label
              className="block text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: 'var(--gym-muted)' }}
            >
              Nombre del plan
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Plan Volumen Semana 1"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={inputStyle}
            />
          </div>
          <div>
            <label
              className="block text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: 'var(--gym-muted)' }}
            >
              Objetivo
            </label>
            <select
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={inputStyle}
            >
              <option value="">Seleccionar</option>
              <option value="volumen">Volumen</option>
              <option value="definicion">Definición</option>
              <option value="mantenimiento">Mantenimiento</option>
              <option value="perdida_peso">Pérdida de peso</option>
            </select>
          </div>
          <div>
            <label
              className="block text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: 'var(--gym-muted)' }}
            >
              Kcal objetivo
            </label>
            <input
              type="number"
              value={kcal}
              onChange={(e) => setKcal(e.target.value)}
              placeholder="2400"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={inputStyle}
            />
          </div>
          <div>
            <label
              className="block text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: 'var(--gym-muted)' }}
            >
              Proteína (g)
            </label>
            <input
              type="number"
              value={proteina}
              onChange={(e) => setProteina(e.target.value)}
              placeholder="180"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={inputStyle}
            />
          </div>
          <div>
            <label
              className="block text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: 'var(--gym-muted)' }}
            >
              Carbohidratos (g)
            </label>
            <input
              type="number"
              value={carbos}
              onChange={(e) => setCarbos(e.target.value)}
              placeholder="280"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={inputStyle}
            />
          </div>
          <div>
            <label
              className="block text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: 'var(--gym-muted)' }}
            >
              Grasa (g)
            </label>
            <input
              type="number"
              value={grasa}
              onChange={(e) => setGrasa(e.target.value)}
              placeholder="70"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={inputStyle}
            />
          </div>
          <div>
            <label
              className="block text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: 'var(--gym-muted)' }}
            >
              Vigencia desde
            </label>
            <input
              type="date"
              value={vigenciaDesde}
              onChange={(e) => setVigenciaDesde(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={inputStyle}
            />
          </div>
          <div>
            <label
              className="block text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: 'var(--gym-muted)' }}
            >
              Vigencia hasta
            </label>
            <input
              type="date"
              value={vigenciaHasta}
              onChange={(e) => setVigenciaHasta(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Day pills */}
      <div>
        <p
          className="text-xs font-bold uppercase tracking-wider mb-3"
          style={{ color: 'var(--gym-muted)' }}
        >
          Días del plan
        </p>
        <div className="flex flex-wrap gap-2">
          {DIAS.map((d, i) => (
            <button
              key={d}
              onClick={() => toggleDia(i)}
              className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors"
              style={{
                background: dias[i].activo
                  ? 'rgba(255, 170, 25, 0.15)'
                  : 'var(--gym-surface)',
                color: dias[i].activo ? 'var(--primary)' : 'var(--gym-muted)',
                border: dias[i].activo
                  ? '1px solid var(--primary)'
                  : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Builder por día */}
      {dias.map((dia, diaIdx) => {
        if (!dia.activo) return null

        return (
          <div
            key={diaIdx}
            className="rounded-2xl p-5"
            style={{
              background: 'var(--gym-surface)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <h3
              className="text-base font-bold mb-4"
              style={{
                fontFamily: 'var(--font-heading)',
                color: 'var(--primary)',
              }}
            >
              {DIAS_FULL[diaIdx]}
            </h3>

            {/* Comidas */}
            <div className="space-y-4">
              {dia.comidas.map((comida) => (
                <div
                  key={comida.id}
                  className="rounded-xl px-4 py-4"
                  style={{ background: 'var(--gym-surface-alt)' }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        type="text"
                        value={comida.nombre}
                        onChange={(e) =>
                          updateComida(diaIdx, comida.id, 'nombre', e.target.value)
                        }
                        placeholder="Ej: Desayuno"
                        className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
                        style={innerInputStyle}
                      />
                      <input
                        type="time"
                        value={comida.hora}
                        onChange={(e) =>
                          updateComida(diaIdx, comida.id, 'hora', e.target.value)
                        }
                        className="w-28 rounded-lg px-3 py-2 text-sm outline-none"
                        style={innerInputStyle}
                      />
                    </div>
                    <button
                      onClick={() => removeComida(diaIdx, comida.id)}
                      className="ml-2 flex items-center justify-center w-6 h-6 rounded-md transition-colors flex-shrink-0"
                      style={{
                        background: 'rgba(239, 68, 68, 0.12)',
                        color: '#ef4444',
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>

                  {/* Alimentos */}
                  <div className="space-y-2">
                    {comida.alimentos.map((alimento) => (
                      <div
                        key={alimento.id}
                        className="rounded-lg px-3 py-3"
                        style={{
                          background: 'var(--gym-surface)',
                          border: '1px solid rgba(255,255,255,0.04)',
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className="text-[0.6rem] uppercase tracking-wider font-bold"
                            style={{ color: 'var(--gym-muted)' }}
                          >
                            Alimento
                          </span>
                          <button
                            onClick={() =>
                              removeAlimento(diaIdx, comida.id, alimento.id)
                            }
                            className="flex items-center justify-center w-5 h-5 rounded transition-colors"
                            style={{
                              color: 'var(--gym-muted)',
                            }}
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div className="col-span-2">
                            <input
                              type="text"
                              value={alimento.nombre}
                              onChange={(e) =>
                                updateAlimento(
                                  diaIdx,
                                  comida.id,
                                  alimento.id,
                                  'nombre',
                                  e.target.value,
                                )
                              }
                              placeholder="Nombre"
                              className="w-full rounded-lg px-3 py-1.5 text-xs outline-none"
                              style={innerInputStyle}
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={alimento.cantidad}
                              onChange={(e) =>
                                updateAlimento(
                                  diaIdx,
                                  comida.id,
                                  alimento.id,
                                  'cantidad',
                                  e.target.value,
                                )
                              }
                              placeholder="Cantidad"
                              className="w-full rounded-lg px-3 py-1.5 text-xs outline-none"
                              style={innerInputStyle}
                            />
                          </div>
                          <div>
                            <select
                              value={alimento.unidad}
                              onChange={(e) =>
                                updateAlimento(
                                  diaIdx,
                                  comida.id,
                                  alimento.id,
                                  'unidad',
                                  e.target.value,
                                )
                              }
                              className="w-full rounded-lg px-3 py-1.5 text-xs outline-none"
                              style={innerInputStyle}
                            >
                              {UNIDADES.map((u) => (
                                <option key={u} value={u}>
                                  {u}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <input
                              type="number"
                              value={alimento.kcal}
                              onChange={(e) =>
                                updateAlimento(
                                  diaIdx,
                                  comida.id,
                                  alimento.id,
                                  'kcal',
                                  e.target.value,
                                )
                              }
                              placeholder="Kcal"
                              className="w-full rounded-lg px-3 py-1.5 text-xs outline-none"
                              style={innerInputStyle}
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              value={alimento.proteina}
                              onChange={(e) =>
                                updateAlimento(
                                  diaIdx,
                                  comida.id,
                                  alimento.id,
                                  'proteina',
                                  e.target.value,
                                )
                              }
                              placeholder="Prot (g)"
                              className="w-full rounded-lg px-3 py-1.5 text-xs outline-none"
                              style={innerInputStyle}
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              value={alimento.carbos}
                              onChange={(e) =>
                                updateAlimento(
                                  diaIdx,
                                  comida.id,
                                  alimento.id,
                                  'carbos',
                                  e.target.value,
                                )
                              }
                              placeholder="Carbs (g)"
                              className="w-full rounded-lg px-3 py-1.5 text-xs outline-none"
                              style={innerInputStyle}
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              value={alimento.grasa}
                              onChange={(e) =>
                                updateAlimento(
                                  diaIdx,
                                  comida.id,
                                  alimento.id,
                                  'grasa',
                                  e.target.value,
                                )
                              }
                              placeholder="Grasa (g)"
                              className="w-full rounded-lg px-3 py-1.5 text-xs outline-none"
                              style={innerInputStyle}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add alimento */}
                  <button
                    onClick={() => addAlimento(diaIdx, comida.id)}
                    className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[0.65rem] font-bold uppercase tracking-wider transition-colors"
                    style={{
                      background: 'transparent',
                      color: 'var(--gym-muted)',
                      border: '1px dashed rgba(255,255,255,0.12)',
                    }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Agregar alimento
                  </button>
                </div>
              ))}
            </div>

            {/* Add comida */}
            <button
              onClick={() => addComida(diaIdx)}
              className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors"
              style={{
                background: 'transparent',
                color: 'var(--primary)',
                border: '1px solid var(--primary)',
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Agregar comida
            </button>
          </div>
        )
      })}

      {/* Error */}
      {error && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
          }}
        >
          {error}
        </div>
      )}

      {/* Guardar */}
      <button
        onClick={handleGuardar}
        disabled={saving || isPending}
        className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-colors"
        style={{
          background: 'var(--primary)',
          color: '#0a0a0a',
          fontFamily: 'var(--font-heading)',
          opacity: saving || isPending ? 0.6 : 1,
          cursor: saving || isPending ? 'not-allowed' : 'pointer',
        }}
      >
        {saving || isPending ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Guardar Plan'}
      </button>
    </div>
  )
}
