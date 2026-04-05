export default function EntrenadorDashboard() {
  const statCards = [
    { label: 'Alumnos activos', value: '12', sub: '+2 este mes' },
    { label: 'Sesiones esta semana', value: '3', sub: 'Proxima: Hoy 10:00' },
    { label: 'Mensajes nuevos', value: '2', sub: 'Sin leer' },
  ]

  const alumnos = [
    {
      nombre: 'Maria Gonzalez',
      objetivo: 'Tonificacion',
      rutina: 'Full Body A',
      ultimaSesion: 'Hace 1 dia',
      activo: true,
    },
    {
      nombre: 'Carlos Benitez',
      objetivo: 'Hipertrofia',
      rutina: 'Push Pull Legs',
      ultimaSesion: 'Hace 2 dias',
      activo: true,
    },
    {
      nombre: 'Ana Villalba',
      objetivo: 'Perdida de grasa',
      rutina: 'HIIT + Fuerza',
      ultimaSesion: 'Hoy',
      activo: true,
    },
    {
      nombre: 'Diego Rios',
      objetivo: 'Fuerza',
      rutina: 'Fuerza 5x5',
      ultimaSesion: 'Hace 5 dias',
      activo: false,
    },
    {
      nombre: 'Lucia Fernandez',
      objetivo: 'Resistencia',
      rutina: 'Funcional Mix',
      ultimaSesion: 'Hace 1 dia',
      activo: true,
    },
    {
      nombre: 'Jorge Caceres',
      objetivo: 'Hipertrofia',
      rutina: 'Upper Lower',
      ultimaSesion: 'Hace 3 dias',
      activo: true,
    },
  ]

  const actividad = [
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 11 12 14 22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      ),
      texto: 'Ana Villalba completo su sesion de HIIT',
      tiempo: 'Hace 2 horas',
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
        </svg>
      ),
      texto: 'Carlos Benitez envio un mensaje',
      tiempo: 'Hace 3 horas',
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="19" y1="8" x2="19" y2="14" />
          <line x1="22" y1="11" x2="16" y2="11" />
        </svg>
      ),
      texto: 'Lucia Fernandez se unio al gym',
      tiempo: 'Ayer',
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
        </svg>
      ),
      texto: 'Maria Gonzalez registro progreso: -1.2 kg',
      tiempo: 'Ayer',
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      ),
      texto: 'Jorge Caceres completo 4 semanas consecutivas',
      tiempo: 'Hace 2 dias',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl px-5 py-4"
            style={{
              background: 'var(--gym-surface)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <p
              className="text-xs font-medium uppercase tracking-wider mb-1"
              style={{ color: 'var(--gym-muted)' }}
            >
              {stat.label}
            </p>
            <p
              className="text-2xl font-bold"
              style={{ color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}
            >
              {stat.value}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--gym-muted)' }}>
              {stat.sub}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabla de alumnos */}
        <div className="lg:col-span-2">
          <div
            className="rounded-2xl p-5 overflow-hidden"
            style={{
              background: 'var(--gym-surface)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-lg font-bold"
                style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
              >
                Mis Alumnos
              </h2>
              <span className="text-xs" style={{ color: 'var(--gym-muted)' }}>
                {alumnos.length} alumnos
              </span>
            </div>

            <div className="overflow-x-auto -mx-5">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    {['Nombre', 'Objetivo', 'Rutina', 'Ultima sesion', 'Estado', ''].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-5 py-3 text-left text-[0.65rem] font-bold uppercase tracking-wider"
                          style={{ color: 'var(--gym-muted)' }}
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {alumnos.map((al, i) => (
                    <tr
                      key={i}
                      style={{
                        borderBottom:
                          i < alumnos.length - 1
                            ? '1px solid rgba(255,255,255,0.05)'
                            : 'none',
                      }}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-full text-[0.6rem] font-bold flex-shrink-0"
                            style={{
                              background: 'var(--gym-surface-alt)',
                              color: 'var(--primary)',
                              fontFamily: 'var(--font-heading)',
                            }}
                          >
                            {al.nombre
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </div>
                          <span
                            className="text-sm font-medium"
                            style={{ color: '#ffffff' }}
                          >
                            {al.nombre}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.6rem] font-bold uppercase"
                          style={{
                            background: 'rgba(255, 170, 25, 0.12)',
                            color: 'var(--primary)',
                          }}
                        >
                          {al.objetivo}
                        </span>
                      </td>
                      <td
                        className="px-5 py-3 text-sm"
                        style={{ color: 'rgba(255,255,255,0.7)' }}
                      >
                        {al.rutina}
                      </td>
                      <td
                        className="px-5 py-3 text-xs"
                        style={{ color: 'var(--gym-muted)' }}
                      >
                        {al.ultimaSesion}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.6rem] font-bold uppercase"
                          style={{
                            background: al.activo
                              ? 'rgba(34, 197, 94, 0.12)'
                              : 'rgba(255,255,255,0.06)',
                            color: al.activo ? '#22c55e' : 'var(--gym-muted)',
                          }}
                        >
                          {al.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <button
                          className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
                          style={{
                            background: 'var(--gym-surface-alt)',
                            color: '#ffffff',
                          }}
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar derecha */}
        <div className="space-y-6">
          {/* Actividad reciente */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: 'var(--gym-surface)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <h3
              className="text-sm font-bold mb-4"
              style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
            >
              Actividad Reciente
            </h3>
            <div className="space-y-3">
              {actividad.map((act, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className="flex-shrink-0 mt-0.5"
                    style={{ color: 'var(--primary)' }}
                  >
                    {act.icon}
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: 'rgba(255,255,255,0.8)' }}
                    >
                      {act.texto}
                    </p>
                    <p
                      className="text-[0.6rem] mt-0.5"
                      style={{ color: 'var(--gym-muted)' }}
                    >
                      {act.tiempo}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Acciones rapidas */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: 'var(--gym-surface)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <h3
              className="text-sm font-bold mb-4"
              style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
            >
              Acciones Rapidas
            </h3>
            <div className="space-y-2">
              <button
                className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-colors"
                style={{
                  background: 'var(--primary)',
                  color: '#0a0a0a',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                <svg
                  width="18"
                  height="18"
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
                Nueva Rutina
              </button>
              <button
                className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-colors"
                style={{
                  background: 'transparent',
                  color: 'var(--primary)',
                  border: '1px solid var(--primary)',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                <svg
                  width="18"
                  height="18"
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
                Plan Nutricional
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
