import Link from 'next/link'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

const DIA_PARAM_MAP: Record<string, string> = {
  lunes: 'LUNES', martes: 'MARTES', miercoles: 'MIERCOLES',
  jueves: 'JUEVES', viernes: 'VIERNES', sabado: 'SABADO', domingo: 'DOMINGO',
}

const nombresDia: Record<string, string> = {
  lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles',
  jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado', domingo: 'Domingo',
}

type AlimentoData = {
  id: string
  nombre: string
  cantidad: number
  unidad: string
  kcal: number | null
  proteinaG: number | null
  carbosG: number | null
  grasaG: number | null
}

function sumarAlimentos(alimentos: AlimentoData[]) {
  return alimentos.reduce(
    (acc, a) => ({
      kcal: acc.kcal + (a.kcal ?? 0),
      proteina: +(acc.proteina + (a.proteinaG ?? 0)).toFixed(1),
      carbos: +(acc.carbos + (a.carbosG ?? 0)).toFixed(1),
      grasa: +(acc.grasa + (a.grasaG ?? 0)).toFixed(1),
    }),
    { kcal: 0, proteina: 0, carbos: 0, grasa: 0 },
  )
}

export default async function NutricionDiaPage({
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
          href="/alumno/nutricion"
          className="inline-flex items-center gap-2 text-sm font-medium"
          style={{ color: 'var(--primary)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          Volver a mi nutrición
        </Link>
        <p style={{ color: 'var(--gym-muted)' }}>Día no válido.</p>
      </div>
    )
  }

  const now = new Date()
  const plan = await prisma.planNutricional.findFirst({
    where: {
      alumnoId: session.user.id,
      activo: true,
      vigenciaDesde: { lte: now },
      OR: [{ vigenciaHasta: null }, { vigenciaHasta: { gte: now } }],
    },
    include: {
      dias: {
        where: { dia: diaEnum as any },
        include: {
          comidas: {
            include: { alimentos: { orderBy: { orden: 'asc' } } },
            orderBy: { orden: 'asc' },
          },
        },
      },
    },
  })

  const planDia = plan?.dias[0] ?? null

  if (!plan || !planDia || planDia.comidas.length === 0) {
    return (
      <div className="space-y-6">
        <Link
          href="/alumno/nutricion"
          className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: 'var(--primary)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          Volver a mi nutrición
        </Link>
        <div className="rounded-2xl p-12 text-center" style={{ background: 'var(--gym-surface)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
            <path d="M2.27 21.7s9.87-3.5 12.73-6.36a4.5 4.5 0 0 0-6.36-6.37C5.77 11.84 2.27 21.7 2.27 21.7zM8.64 14l-2.05-2.04M15.34 15l-2.46-2.46" />
            <path d="M22 9s-1.33-2-3.5-2C16.86 7 15 9 15 9s1.33 2 3.5 2S22 9 22 9z" />
            <path d="M15 2s-2 1.33-2 3.5S15 9 15 9s2-1.33 2-3.5S15 2 15 2z" />
          </svg>
          <p className="text-lg font-bold mb-2" style={{ color: '#fff', fontFamily: 'var(--font-heading)' }}>
            No hay plan para {nombresDia[dia] ?? dia}
          </p>
          <p className="text-sm" style={{ color: 'var(--gym-muted)' }}>
            Tu entrenador/a no cargó un plan nutricional para este día.
          </p>
        </div>
      </div>
    )
  }

  // Calcular totales del día
  const todosAlimentos = planDia.comidas.flatMap((c) => c.alimentos)
  const totales = sumarAlimentos(todosAlimentos)

  return (
    <div className="space-y-6">
      {/* Volver */}
      <Link
        href="/alumno/nutricion"
        className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
        style={{ color: 'var(--primary)' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
        Volver a mi nutrición
      </Link>

      {/* Header */}
      <h2
        className="text-2xl font-bold"
        style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
      >
        {nombresDia[dia] ?? dia}
      </h2>

      {/* Pills de macros totales */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Kcal', value: Math.round(totales.kcal), color: 'var(--primary)' },
          { label: 'Proteína', value: `${totales.proteina}g`, color: '#3b82f6' },
          { label: 'Carbos', value: `${totales.carbos}g`, color: '#22c55e' },
          { label: 'Grasa', value: `${totales.grasa}g`, color: '#ef4444' },
        ].map((pill) => (
          <div
            key={pill.label}
            className="rounded-full px-4 py-2 flex items-center gap-2"
            style={{
              background: 'var(--gym-surface)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: pill.color }}
            />
            <span className="text-xs font-bold" style={{ color: '#ffffff' }}>
              {pill.value}
            </span>
            <span className="text-xs" style={{ color: 'var(--gym-muted)' }}>
              {pill.label}
            </span>
          </div>
        ))}
      </div>

      {/* Comidas */}
      <div className="space-y-4">
        {planDia.comidas.map((comida) => {
          const sub = sumarAlimentos(comida.alimentos)

          return (
            <div
              key={comida.id}
              className="rounded-2xl p-5"
              style={{
                background: 'var(--gym-surface)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {/* Comida header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p
                    className="text-base font-bold"
                    style={{
                      fontFamily: 'var(--font-heading)',
                      color: 'var(--primary)',
                    }}
                  >
                    {comida.nombre}
                  </p>
                  {comida.hora && (
                    <p className="text-xs" style={{ color: 'var(--gym-muted)' }}>
                      {comida.hora}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold" style={{ color: '#ffffff' }}>
                    {Math.round(sub.kcal)} kcal
                  </p>
                </div>
              </div>

              {/* Alimentos */}
              <div className="space-y-2">
                {comida.alimentos.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between rounded-xl px-4 py-3"
                    style={{ background: 'var(--gym-surface-alt)' }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: 'var(--primary)' }}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: '#ffffff' }}>
                          {a.nombre}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--gym-muted)' }}>
                          {a.cantidad}{a.unidad}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 text-xs">
                      <span style={{ color: 'var(--gym-muted)' }}>{a.kcal ?? 0} kcal</span>
                      <span style={{ color: '#3b82f6' }}>P {a.proteinaG ?? 0}</span>
                      <span style={{ color: '#22c55e' }}>C {a.carbosG ?? 0}</span>
                      <span style={{ color: '#ef4444' }}>G {a.grasaG ?? 0}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Subtotal */}
              <div
                className="mt-3 pt-3 flex items-center justify-between text-xs"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
              >
                <span style={{ color: 'var(--gym-muted)' }}>Subtotal</span>
                <div className="flex items-center gap-3">
                  <span style={{ color: '#ffffff' }}>{Math.round(sub.kcal)} kcal</span>
                  <span style={{ color: '#3b82f6' }}>P {sub.proteina}g</span>
                  <span style={{ color: '#22c55e' }}>C {sub.carbos}g</span>
                  <span style={{ color: '#ef4444' }}>G {sub.grasa}g</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
