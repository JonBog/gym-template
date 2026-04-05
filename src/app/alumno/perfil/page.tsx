import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function PerfilPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const now = new Date()
  const alumnoId = session.user.id

  const [usuario, asignacion, rutina, plan] = await Promise.all([
    prisma.user.findUnique({
      where: { id: alumnoId },
    }),
    prisma.asignacionAlumno.findFirst({
      where: { alumnoId, activa: true },
      include: { entrenador: true },
    }),
    prisma.rutina.findFirst({
      where: {
        alumnoId,
        activa: true,
        vigenciaDesde: { lte: now },
        OR: [{ vigenciaHasta: null }, { vigenciaHasta: { gte: now } }],
      },
      select: { nombre: true },
    }),
    prisma.planNutricional.findFirst({
      where: {
        alumnoId,
        activo: true,
        vigenciaDesde: { lte: now },
        OR: [{ vigenciaHasta: null }, { vigenciaHasta: { gte: now } }],
      },
      select: { nombre: true },
    }),
  ])

  if (!usuario) redirect('/login')

  const iniciales = `${usuario.nombre.charAt(0)}${usuario.apellido.charAt(0)}`.toUpperCase()
  const entrenador = asignacion?.entrenador ?? null
  const entrenadorIniciales = entrenador
    ? `${entrenador.nombre.charAt(0)}${entrenador.apellido.charAt(0)}`.toUpperCase()
    : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
        >
          Mi Perfil
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--gym-muted)' }}>
          Tu información personal
        </p>
      </div>

      {/* Avatar grande */}
      <div className="flex justify-center">
        <div
          className="flex items-center justify-center rounded-full text-3xl font-bold"
          style={{
            width: 96,
            height: 96,
            background: 'var(--primary)',
            color: '#0a0a0a',
            fontFamily: 'var(--font-heading)',
          }}
        >
          {iniciales}
        </div>
      </div>

      {/* Datos personales */}
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
          Datos Personales
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Nombre', value: usuario.nombre },
            { label: 'Apellido', value: usuario.apellido },
            { label: 'Email', value: usuario.email },
            { label: 'Teléfono', value: usuario.telefono ?? 'No registrado' },
            {
              label: 'Fecha de nacimiento',
              value: usuario.fechaNacimiento
                ? usuario.fechaNacimiento.toLocaleDateString('es-PY', { day: 'numeric', month: 'long', year: 'numeric' })
                : 'No registrada',
            },
          ].map((field) => (
            <div
              key={field.label}
              className="rounded-xl px-4 py-3"
              style={{ background: 'var(--gym-surface-alt)' }}
            >
              <p className="text-xs mb-1" style={{ color: 'var(--gym-muted)' }}>
                {field.label}
              </p>
              <p className="text-sm font-medium" style={{ color: '#ffffff' }}>
                {field.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Mi Entrenador/a */}
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
          Mi Entrenador/a
        </h3>
        {entrenador ? (
          <div className="flex items-center gap-4">
            <div
              className="flex-shrink-0 flex items-center justify-center rounded-full text-sm font-bold"
              style={{
                width: 48,
                height: 48,
                background: 'var(--primary)',
                color: '#0a0a0a',
                fontFamily: 'var(--font-heading)',
              }}
            >
              {entrenadorIniciales}
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: '#ffffff' }}>
                {entrenador.nombre} {entrenador.apellido}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--gym-muted)' }}>
                {entrenador.email}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm" style={{ color: 'var(--gym-muted)' }}>
            No tenés un entrenador/a asignado todavía.
          </p>
        )}
      </div>

      {/* Mi Plan Actual */}
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
          Mi Plan Actual
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            className="rounded-xl px-4 py-3"
            style={{ background: 'var(--gym-surface-alt)' }}
          >
            <p className="text-xs mb-1" style={{ color: 'var(--gym-muted)' }}>
              Rutina
            </p>
            <p
              className="text-sm font-bold"
              style={{ color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}
            >
              {rutina?.nombre ?? 'Sin rutina asignada'}
            </p>
          </div>
          <div
            className="rounded-xl px-4 py-3"
            style={{ background: 'var(--gym-surface-alt)' }}
          >
            <p className="text-xs mb-1" style={{ color: 'var(--gym-muted)' }}>
              Nutrición
            </p>
            <p
              className="text-sm font-bold"
              style={{ color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}
            >
              {plan?.nombre ?? 'Sin plan nutricional'}
            </p>
          </div>
        </div>
      </div>

      {/* Botón editar perfil */}
      <button
        disabled
        className="w-full rounded-xl py-3 text-sm font-bold transition-all"
        style={{
          background: 'var(--gym-surface-alt)',
          color: 'var(--gym-muted)',
          border: '1px solid rgba(255,255,255,0.08)',
          cursor: 'not-allowed',
          opacity: 0.5,
        }}
      >
        Editar perfil (próximamente)
      </button>
    </div>
  )
}
