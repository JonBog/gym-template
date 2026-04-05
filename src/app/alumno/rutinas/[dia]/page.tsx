import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import RutinaDiaClient from './RutinaDiaClient'

const DIA_PARAM_MAP: Record<string, string> = {
  lunes: 'LUNES', martes: 'MARTES', miercoles: 'MIERCOLES',
  jueves: 'JUEVES', viernes: 'VIERNES', sabado: 'SABADO', domingo: 'DOMINGO',
}

const nombresDia: Record<string, string> = {
  lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles',
  jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado', domingo: 'Domingo',
}

export default async function RutinaDiaPage({
  params,
}: {
  params: Promise<{ dia: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { dia } = await params
  const diaEnum = DIA_PARAM_MAP[dia]

  if (!diaEnum) {
    return (
      <div className="space-y-6">
        <Link
          href="/alumno/rutinas"
          className="inline-flex items-center gap-2 text-sm font-medium"
          style={{ color: 'var(--primary)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          Volver a mis rutinas
        </Link>
        <p style={{ color: 'var(--gym-muted)' }}>Día no válido.</p>
      </div>
    )
  }

  const now = new Date()
  const alumnoId = session.user.id

  const rutina = await prisma.rutina.findFirst({
    where: {
      alumnoId,
      activa: true,
      vigenciaDesde: { lte: now },
      OR: [{ vigenciaHasta: null }, { vigenciaHasta: { gte: now } }],
    },
    include: {
      dias: {
        where: { dia: diaEnum as any },
        include: {
          ejercicios: { orderBy: { orden: 'asc' } },
        },
      },
    },
  })

  const rutinaDia = rutina?.dias[0] ?? null

  // Si no hay rutina o no hay día → Descanso
  if (!rutina || !rutinaDia) {
    return (
      <div className="space-y-6">
        <Link
          href="/alumno/rutinas"
          className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: 'var(--primary)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          Volver a mis rutinas
        </Link>

        <div
          className="rounded-2xl p-8 text-center"
          style={{
            background: 'var(--gym-surface)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <span className="text-6xl block mb-4">&#128564;</span>
          <h2
            className="text-2xl font-bold mb-2"
            style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
          >
            {nombresDia[dia] ?? dia} — Descanso
          </h2>
          <p className="text-sm" style={{ color: 'var(--gym-muted)' }}>
            Hoy toca recuperar. Descansá, hidratate y prepará el cuerpo para la próxima sesión.
          </p>
        </div>
      </div>
    )
  }

  // Obtener completados de hoy
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

  const completadosHoy = await prisma.ejercicioCompletado.findMany({
    where: {
      alumnoId,
      fecha: { gte: startOfDay, lt: endOfDay },
      ejercicioId: { in: rutinaDia.ejercicios.map((e) => e.id) },
    },
  })

  const completadosIds = completadosHoy.map((c) => c.ejercicioId)

  // Serializar para el client component
  const ejerciciosData = rutinaDia.ejercicios.map((ej) => ({
    id: ej.id,
    nombre: ej.nombre,
    descripcion: ej.descripcion,
    series: ej.series,
    repsMin: ej.repsMin,
    repsMax: ej.repsMax,
    pesoKg: ej.pesoKg,
    pesoNota: ej.pesoNota,
    descansoSeg: ej.descansoSeg,
    duracionMin: ej.duracionMin,
    distanciaKm: ej.distanciaKm,
    notas: ej.notas,
    orden: ej.orden,
  }))

  return (
    <RutinaDiaClient
      dia={dia}
      nombreDia={nombresDia[dia] ?? dia}
      rutinaDiaNombre={rutinaDia.nombre ?? 'Entrenamiento'}
      rutinaDiaTipo={rutinaDia.tipo}
      ejercicios={ejerciciosData}
      completadosIniciales={completadosIds}
    />
  )
}
