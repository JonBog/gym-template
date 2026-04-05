import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function ProgresoPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const progresos = await prisma.progreso.findMany({
    where: { alumnoId: session.user.id },
    orderBy: { fecha: 'desc' },
    take: 10,
  })

  if (progresos.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2
            className="text-2xl font-bold"
            style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
          >
            Mi Progreso
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--gym-muted)' }}>
            Seguimiento de tus mediciones y evolución
          </p>
        </div>
        <div className="rounded-2xl p-12 text-center" style={{ background: 'var(--gym-surface)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
            <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
          </svg>
          <p className="text-lg font-bold mb-2" style={{ color: '#fff', fontFamily: 'var(--font-heading)' }}>
            Aún no tenés mediciones registradas
          </p>
          <p className="text-sm" style={{ color: 'var(--gym-muted)' }}>
            Cuando tu entrenador/a registre tus mediciones, vas a ver tu evolución acá.
          </p>
        </div>
      </div>
    )
  }

  const actual = progresos[0]
  const anterior = progresos.length > 1 ? progresos[1] : null

  type MetricKey = 'peso' | 'grasa' | 'masaMuscular' | 'cintura' | 'cadera' | 'pecho' | 'brazo'

  const metricLabels: Record<MetricKey, string> = {
    peso: 'Peso',
    grasa: 'Grasa corporal',
    masaMuscular: 'Masa muscular',
    cintura: 'Cintura',
    cadera: 'Cadera',
    pecho: 'Pecho',
    brazo: 'Brazo',
  }

  const metricFields: { key: MetricKey; field: keyof typeof actual; unidad: string; esPositivo: boolean }[] = [
    { key: 'peso', field: 'pesoKg', unidad: 'kg', esPositivo: false },
    { key: 'grasa', field: 'grasaCorporal', unidad: '%', esPositivo: false },
    { key: 'masaMuscular', field: 'masaMuscularKg', unidad: 'kg', esPositivo: true },
    { key: 'cintura', field: 'cinturaCm', unidad: 'cm', esPositivo: false },
    { key: 'cadera', field: 'caderaCm', unidad: 'cm', esPositivo: false },
    { key: 'pecho', field: 'pechoCm', unidad: 'cm', esPositivo: true },
    { key: 'brazo', field: 'brazoCm', unidad: 'cm', esPositivo: true },
  ]

  const mediciones = metricFields
    .filter((m) => actual[m.field] != null)
    .map((m) => {
      const valorActual = actual[m.field] as number
      const valorAnterior = anterior ? (anterior[m.field] as number | null) : null
      const cambio = valorAnterior != null ? +(valorActual - valorAnterior).toFixed(1) : null
      const sube = cambio != null ? cambio > 0 : null

      return {
        key: m.key,
        label: metricLabels[m.key],
        valor: valorActual,
        unidad: m.unidad,
        cambio,
        sube,
        esPositivo: m.esPositivo,
      }
    })

  // Últimos 8 registros de peso para el gráfico (orden cronológico)
  const pesoRegistros = progresos
    .filter((p) => p.pesoKg != null)
    .slice(0, 8)
    .reverse()

  const pesoValues = pesoRegistros.map((p) => p.pesoKg!)
  const pesoMin = pesoValues.length > 0 ? Math.min(...pesoValues) - 1 : 0
  const pesoMax = pesoValues.length > 0 ? Math.max(...pesoValues) + 1 : 1
  const pesoRange = pesoMax - pesoMin || 1

  // Historial: últimos 5
  const historial = progresos.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
        >
          Mi Progreso
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--gym-muted)' }}>
          Seguimiento de tus mediciones y evolución
        </p>
      </div>

      {/* Últimas mediciones */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: 'var(--gym-surface)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <h3
          className="text-lg font-bold mb-4"
          style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
        >
          Últimas Mediciones
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {mediciones.map((m) => {
            const esBueno = m.cambio != null && m.sube != null
              ? (m.esPositivo ? m.sube : !m.sube)
              : null
            const indicadorColor = esBueno === null ? 'var(--gym-muted)' : esBueno ? '#22c55e' : '#ef4444'
            const indicador = m.sube === null ? '' : m.sube ? '\u25B2' : '\u25BC'

            return (
              <div
                key={m.key}
                className="rounded-xl px-4 py-3"
                style={{ background: 'var(--gym-surface-alt)' }}
              >
                <p className="text-xs mb-1" style={{ color: 'var(--gym-muted)' }}>
                  {m.label}
                </p>
                <div className="flex items-end gap-2">
                  <p
                    className="text-xl font-bold"
                    style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
                  >
                    {m.valor}
                  </p>
                  <span className="text-xs mb-0.5" style={{ color: 'var(--gym-muted)' }}>
                    {m.unidad}
                  </span>
                </div>
                {m.cambio != null && (
                  <span className="text-xs font-bold" style={{ color: indicadorColor }}>
                    {indicador} {Math.abs(m.cambio)} {m.unidad}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Evolución — gráfico de barras CSS */}
      {pesoRegistros.length > 1 && (
        <div
          className="rounded-2xl p-5"
          style={{
            background: 'var(--gym-surface)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <h3
            className="text-lg font-bold mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
          >
            Evolución de Peso
          </h3>
          <div className="flex items-end gap-3" style={{ height: 180 }}>
            {pesoRegistros.map((p, i) => {
              const heightPercent = ((p.pesoKg! - pesoMin) / pesoRange) * 100
              const label = p.fecha.toLocaleDateString('es-PY', { day: '2-digit', month: 'short' })
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span
                    className="text-[0.6rem] font-bold"
                    style={{ color: 'var(--primary)' }}
                  >
                    {p.pesoKg}
                  </span>
                  <div
                    className="w-full rounded-t-lg transition-all"
                    style={{
                      height: `${heightPercent}%`,
                      background: 'var(--primary)',
                      minHeight: 8,
                    }}
                  />
                  <span
                    className="text-[0.6rem] font-medium"
                    style={{ color: 'var(--gym-muted)' }}
                  >
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
          <div
            className="mt-3 flex items-center justify-between text-xs"
            style={{ color: 'var(--gym-muted)' }}
          >
            <span>Últimos {pesoRegistros.length} registros</span>
            {pesoRegistros.length >= 2 && (
              <span style={{ color: pesoRegistros[pesoRegistros.length - 1].pesoKg! <= pesoRegistros[0].pesoKg! ? '#22c55e' : '#ef4444' }}>
                {pesoRegistros[pesoRegistros.length - 1].pesoKg! <= pesoRegistros[0].pesoKg! ? '\u25BC' : '\u25B2'}{' '}
                {Math.abs(+(pesoRegistros[0].pesoKg! - pesoRegistros[pesoRegistros.length - 1].pesoKg!).toFixed(1))} kg
              </span>
            )}
          </div>
        </div>
      )}

      {/* Historial */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: 'var(--gym-surface)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <h3
          className="text-lg font-bold mb-4"
          style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
        >
          Historial
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ color: '#ffffff' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th className="text-left py-2 pr-4 text-xs font-medium" style={{ color: 'var(--gym-muted)' }}>
                  Fecha
                </th>
                <th className="text-right py-2 px-4 text-xs font-medium" style={{ color: 'var(--gym-muted)' }}>
                  Peso (kg)
                </th>
                <th className="text-right py-2 px-4 text-xs font-medium" style={{ color: 'var(--gym-muted)' }}>
                  Grasa (%)
                </th>
                <th className="text-right py-2 pl-4 text-xs font-medium" style={{ color: 'var(--gym-muted)' }}>
                  Masa muscular (kg)
                </th>
              </tr>
            </thead>
            <tbody>
              {historial.map((h, i) => (
                <tr
                  key={h.id}
                  style={{
                    borderBottom: i < historial.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  }}
                >
                  <td className="py-3 pr-4 text-sm font-medium">
                    {h.fecha.toLocaleDateString('es-PY', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-3 px-4 text-right" style={{ color: 'var(--primary)' }}>
                    {h.pesoKg ?? '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {h.grasaCorporal != null ? `${h.grasaCorporal}%` : '—'}
                  </td>
                  <td className="py-3 pl-4 text-right">
                    {h.masaMuscularKg ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
