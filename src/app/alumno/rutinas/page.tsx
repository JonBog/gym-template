import Link from 'next/link'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

const DIAS_COMPLETOS: { dia: string; slug: string; enum: string }[] = [
  { dia: 'LUN', slug: 'lunes', enum: 'LUNES' },
  { dia: 'MAR', slug: 'martes', enum: 'MARTES' },
  { dia: 'MIÉ', slug: 'miercoles', enum: 'MIERCOLES' },
  { dia: 'JUE', slug: 'jueves', enum: 'JUEVES' },
  { dia: 'VIE', slug: 'viernes', enum: 'VIERNES' },
  { dia: 'SÁB', slug: 'sabado', enum: 'SABADO' },
  { dia: 'DOM', slug: 'domingo', enum: 'DOMINGO' },
]

const tipoColors: Record<string, string> = {
  Fuerza: 'rgba(255, 170, 25, 0.15)',
  Funcional: 'rgba(59, 130, 246, 0.15)',
  Cardio: 'rgba(239, 68, 68, 0.15)',
}

const tipoTextColors: Record<string, string> = {
  Fuerza: 'var(--primary)',
  Funcional: '#3b82f6',
  Cardio: '#ef4444',
}

export default async function RutinasPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const now = new Date()
  const rutina = await prisma.rutina.findFirst({
    where: {
      alumnoId: session.user.id,
      activa: true,
      vigenciaDesde: { lte: now },
      OR: [{ vigenciaHasta: null }, { vigenciaHasta: { gte: now } }],
    },
    include: {
      dias: { orderBy: { orden: 'asc' } },
    },
  })

  if (!rutina) {
    return (
      <div className="space-y-6">
        <div>
          <h2
            className="text-2xl font-bold"
            style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
          >
            Mis Rutinas
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--gym-muted)' }}>
            Tu plan de entrenamiento semanal
          </p>
        </div>
        <div className="rounded-2xl p-12 text-center" style={{ background: 'var(--gym-surface)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
            <path d="M14.4 14.4 9.6 9.6" />
            <path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z" />
            <path d="m21.5 21.5-1.4-1.4" />
            <path d="M3.9 3.9 2.5 2.5" />
            <path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829z" />
          </svg>
          <p className="text-lg font-bold mb-2" style={{ color: '#fff', fontFamily: 'var(--font-heading)' }}>
            Tu entrenador aún no te asignó una rutina
          </p>
          <p className="text-sm" style={{ color: 'var(--gym-muted)' }}>
            Cuando tu entrenador/a te asigne un plan de entrenamiento, vas a verlo acá.
          </p>
        </div>
      </div>
    )
  }

  const diasMap = new Map(rutina.dias.map((d) => [d.dia, d]))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
        >
          Mis Rutinas
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--gym-muted)' }}>
          Tu plan de entrenamiento semanal — {rutina.nombre}
        </p>
      </div>

      {/* Grid de días */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {DIAS_COMPLETOS.map((d) => {
          const rutinaDia = diasMap.get(d.enum as any)
          const esDescanso = !rutinaDia

          return (
            <Link
              key={d.slug}
              href={`/alumno/rutinas/${d.slug}`}
              className="block rounded-2xl px-5 py-5 transition-all hover:scale-[1.02]"
              style={{
                background: 'var(--gym-surface)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {/* Día */}
              <p
                className="text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: 'var(--gym-muted)' }}
              >
                {d.dia}
              </p>

              {esDescanso ? (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">&#128564;</span>
                  <p
                    className="text-lg font-bold"
                    style={{
                      fontFamily: 'var(--font-heading)',
                      color: 'rgba(255,255,255,0.4)',
                    }}
                  >
                    Descanso
                  </p>
                </div>
              ) : (
                <>
                  <p
                    className="text-lg font-bold mb-2"
                    style={{
                      fontFamily: 'var(--font-heading)',
                      color: '#ffffff',
                    }}
                  >
                    {rutinaDia.nombre ?? 'Entrenamiento'}
                  </p>
                  {rutinaDia.tipo && (
                    <span
                      className="inline-flex items-center rounded-full px-3 py-1 text-[0.65rem] font-bold uppercase"
                      style={{
                        background: tipoColors[rutinaDia.tipo] ?? 'rgba(255,255,255,0.1)',
                        color: tipoTextColors[rutinaDia.tipo] ?? '#ffffff',
                      }}
                    >
                      {rutinaDia.tipo}
                    </span>
                  )}
                </>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
