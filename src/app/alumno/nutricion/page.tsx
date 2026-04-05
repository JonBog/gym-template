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

export default async function NutricionPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

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
        include: {
          comidas: {
            include: { alimentos: { orderBy: { orden: 'asc' } } },
            orderBy: { orden: 'asc' },
          },
        },
      },
    },
  })

  if (!plan) {
    return (
      <div className="space-y-6">
        <div>
          <h2
            className="text-2xl font-bold"
            style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
          >
            Mi Nutrición
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--gym-muted)' }}>
            Tu plan nutricional semanal
          </p>
        </div>
        <div className="rounded-2xl p-12 text-center" style={{ background: 'var(--gym-surface)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
            <path d="M2.27 21.7s9.87-3.5 12.73-6.36a4.5 4.5 0 0 0-6.36-6.37C5.77 11.84 2.27 21.7 2.27 21.7zM8.64 14l-2.05-2.04M15.34 15l-2.46-2.46" />
            <path d="M22 9s-1.33-2-3.5-2C16.86 7 15 9 15 9s1.33 2 3.5 2S22 9 22 9z" />
            <path d="M15 2s-2 1.33-2 3.5S15 9 15 9s2-1.33 2-3.5S15 2 15 2z" />
          </svg>
          <p className="text-lg font-bold mb-2" style={{ color: '#fff', fontFamily: 'var(--font-heading)' }}>
            Tu entrenador aún no te asignó un plan nutricional
          </p>
          <p className="text-sm" style={{ color: 'var(--gym-muted)' }}>
            Cuando tu entrenador/a te asigne un plan de alimentación, vas a verlo acá.
          </p>
        </div>
      </div>
    )
  }

  const diasMap = new Map(plan.dias.map((d) => [d.dia, d]))

  // Calcular kcal por día sumando alimentos
  const diasConKcal = DIAS_COMPLETOS.map((d) => {
    const planDia = diasMap.get(d.enum as any)
    if (!planDia) return { ...d, comidas: 0, kcal: 0, existe: false }

    let kcalTotal = 0
    let comidasCount = planDia.comidas.length
    for (const comida of planDia.comidas) {
      for (const alimento of comida.alimentos) {
        kcalTotal += alimento.kcal ?? 0
      }
    }
    return { ...d, comidas: comidasCount, kcal: Math.round(kcalTotal), existe: true }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
        >
          Mi Nutrición
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--gym-muted)' }}>
          Tu plan nutricional semanal — {plan.nombre}
        </p>
      </div>

      {/* Card resumen macros */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: 'linear-gradient(135deg, rgba(255,170,25,0.12) 0%, rgba(255,170,25,0.04) 100%)',
          border: '1px solid rgba(255,170,25,0.2)',
        }}
      >
        <p
          className="text-xs font-bold uppercase tracking-widest mb-3"
          style={{ color: 'var(--primary)' }}
        >
          Objetivo Diario
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p
              className="text-2xl font-bold"
              style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
            >
              {plan.kcalObjetivo ?? '—'}
            </p>
            <p className="text-xs" style={{ color: 'var(--gym-muted)' }}>
              kcal
            </p>
          </div>
          <div>
            <p
              className="text-2xl font-bold"
              style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
            >
              {plan.proteinaG != null ? `${plan.proteinaG}g` : '—'}
            </p>
            <p className="text-xs" style={{ color: 'var(--gym-muted)' }}>
              Proteína
            </p>
          </div>
          <div>
            <p
              className="text-2xl font-bold"
              style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
            >
              {plan.carbosG != null ? `${plan.carbosG}g` : '—'}
            </p>
            <p className="text-xs" style={{ color: 'var(--gym-muted)' }}>
              Carbos
            </p>
          </div>
          <div>
            <p
              className="text-2xl font-bold"
              style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
            >
              {plan.grasaG != null ? `${plan.grasaG}g` : '—'}
            </p>
            <p className="text-xs" style={{ color: 'var(--gym-muted)' }}>
              Grasa
            </p>
          </div>
        </div>
      </div>

      {/* Grid de días */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {diasConKcal.map((d) => (
          <Link
            key={d.slug}
            href={`/alumno/nutricion/${d.slug}`}
            className="block rounded-2xl px-5 py-5 transition-all hover:scale-[1.02]"
            style={{
              background: 'var(--gym-surface)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <p
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: 'var(--gym-muted)' }}
            >
              {d.dia}
            </p>
            {d.existe ? (
              <>
                <p
                  className="text-lg font-bold"
                  style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
                >
                  {d.kcal} kcal
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--gym-muted)' }}>
                  {d.comidas} comidas
                </p>
              </>
            ) : (
              <p
                className="text-lg font-bold"
                style={{
                  fontFamily: 'var(--font-heading)',
                  color: 'rgba(255,255,255,0.4)',
                }}
              >
                Sin plan
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
