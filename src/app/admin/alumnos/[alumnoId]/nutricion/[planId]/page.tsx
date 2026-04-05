import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import Link from 'next/link'
import ReactivarPlanButton from './ReactivarPlanButton'
import { reactivarPlan } from '../../actions'

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('es-PY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default async function AdminPlanNutricionalDetailPage({
  params,
}: {
  params: Promise<{ alumnoId: string; planId: string }>
}) {
  const session = await auth()
  if (!session?.user || session.user.rol !== 'ADMIN_GYM') redirect('/login')

  const { alumnoId, planId } = await params

  const [alumno, plan, asignacion] = await Promise.all([
    prisma.user.findUnique({
      where: { id: alumnoId },
      select: { nombre: true, apellido: true },
    }),
    prisma.planNutricional.findUnique({
      where: { id: planId },
      include: {
        dias: {
          include: {
            comidas: {
              include: {
                alimentos: { orderBy: { orden: 'asc' } },
              },
              orderBy: { orden: 'asc' },
            },
          },
        },
      },
    }),
    prisma.asignacionAlumno.findFirst({
      where: { alumnoId, activa: true },
      select: { entrenadorId: true },
    }),
  ])

  if (!alumno || !plan || plan.alumnoId !== alumnoId) {
    notFound()
  }

  const isAssignedTrainer = asignacion?.entrenadorId === session.user.id

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href={`/admin/alumnos/${alumnoId}`}
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
      <div
        className="rounded-2xl p-6"
        style={{
          background: 'var(--gym-surface)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2
                className="text-xl font-bold"
                style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
              >
                {plan.nombre}
              </h2>
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.6rem] font-bold uppercase"
                style={{
                  background: plan.activo
                    ? 'rgba(34, 197, 94, 0.12)'
                    : 'rgba(255,255,255,0.08)',
                  color: plan.activo ? '#22c55e' : 'var(--gym-muted)',
                }}
              >
                {plan.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <p className="text-sm" style={{ color: 'var(--gym-muted)' }}>
              {alumno.nombre} {alumno.apellido}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--gym-muted)' }}>
              Vigencia: {formatDate(plan.vigenciaDesde)}
              {plan.vigenciaHasta ? ` — ${formatDate(plan.vigenciaHasta)}` : ' (sin vencimiento)'}
            </p>
            {plan.objetivo && (
              <p className="text-sm mt-2" style={{ color: 'var(--gym-muted)' }}>
                Objetivo: {plan.objetivo}
              </p>
            )}

            {(plan.kcalObjetivo || plan.proteinaG || plan.carbosG || plan.grasaG) && (
              <div className="flex flex-wrap gap-3 mt-3">
                {plan.kcalObjetivo != null && (
                  <span
                    className="text-xs rounded-lg px-3 py-1"
                    style={{ background: 'var(--gym-surface-alt)', color: 'var(--primary)' }}
                  >
                    {plan.kcalObjetivo} kcal
                  </span>
                )}
                {plan.proteinaG != null && (
                  <span
                    className="text-xs rounded-lg px-3 py-1"
                    style={{ background: 'var(--gym-surface-alt)', color: 'var(--gym-muted)' }}
                  >
                    P: {plan.proteinaG}g
                  </span>
                )}
                {plan.carbosG != null && (
                  <span
                    className="text-xs rounded-lg px-3 py-1"
                    style={{ background: 'var(--gym-surface-alt)', color: 'var(--gym-muted)' }}
                  >
                    C: {plan.carbosG}g
                  </span>
                )}
                {plan.grasaG != null && (
                  <span
                    className="text-xs rounded-lg px-3 py-1"
                    style={{ background: 'var(--gym-surface-alt)', color: 'var(--gym-muted)' }}
                  >
                    G: {plan.grasaG}g
                  </span>
                )}
              </div>
            )}
          </div>

          {!plan.activo && isAssignedTrainer && (
            <ReactivarPlanButton
              planId={planId}
              alumnoId={alumnoId}
              reactivarAction={reactivarPlan}
            />
          )}
        </div>
      </div>

      {/* Days */}
      <div className="space-y-4">
        {plan.dias.length === 0 ? (
          <div
            className="rounded-2xl p-5"
            style={{
              background: 'var(--gym-surface)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <p className="text-sm" style={{ color: 'var(--gym-muted)' }}>
              Este plan no tiene días configurados.
            </p>
          </div>
        ) : (
          plan.dias.map((dia) => (
            <div
              key={dia.id}
              className="rounded-2xl p-5"
              style={{
                background: 'var(--gym-surface)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="inline-flex items-center rounded-lg px-3 py-1 text-xs font-bold uppercase"
                  style={{
                    background: 'var(--primary)',
                    color: '#0a0a0a',
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  {dia.dia}
                </span>
                {dia.nombre && (
                  <span className="text-sm font-semibold" style={{ color: '#ffffff' }}>
                    {dia.nombre}
                  </span>
                )}
              </div>

              {dia.comidas.length === 0 ? (
                <p className="text-xs" style={{ color: 'var(--gym-muted)' }}>
                  Sin comidas
                </p>
              ) : (
                <div className="space-y-3">
                  {dia.comidas.map((comida) => (
                    <div
                      key={comida.id}
                      className="rounded-xl p-4"
                      style={{ background: 'var(--gym-surface-alt)' }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <p className="text-sm font-semibold" style={{ color: '#ffffff' }}>
                          {comida.nombre}
                        </p>
                        {comida.hora && (
                          <span className="text-xs" style={{ color: 'var(--gym-muted)' }}>
                            {comida.hora}
                          </span>
                        )}
                      </div>

                      {comida.alimentos.length === 0 ? (
                        <p className="text-xs" style={{ color: 'var(--gym-muted)' }}>
                          Sin alimentos
                        </p>
                      ) : (
                        <div className="space-y-1.5">
                          {comida.alimentos.map((al) => (
                            <div key={al.id} className="flex items-start justify-between gap-2">
                              <span className="text-xs" style={{ color: '#ffffff' }}>
                                {al.nombre}
                              </span>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-xs" style={{ color: 'var(--gym-muted)' }}>
                                  {al.cantidad} {al.unidad}
                                </span>
                                {al.kcal != null && (
                                  <span
                                    className="text-[0.65rem] rounded px-1.5 py-0.5"
                                    style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--primary)' }}
                                  >
                                    {al.kcal} kcal
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
