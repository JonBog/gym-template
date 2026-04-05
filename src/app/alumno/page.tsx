import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

const DIAS_MAP: Record<number, string> = {
  0: 'DOMINGO', 1: 'LUNES', 2: 'MARTES', 3: 'MIERCOLES',
  4: 'JUEVES', 5: 'VIERNES', 6: 'SABADO',
}

const DIAS_LABEL: Record<string, string> = {
  LUNES: 'Lunes', MARTES: 'Martes', MIERCOLES: 'Miércoles',
  JUEVES: 'Jueves', VIERNES: 'Viernes', SABADO: 'Sábado', DOMINGO: 'Domingo',
}

const DIAS_ORDEN = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO']

export default async function AlumnoDashboard() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const alumnoId = session.user.id
  const now = new Date()
  const hoyEnum = DIAS_MAP[now.getDay()]

  // Fecha de inicio y fin del día para filtrar completados
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

  // Queries en paralelo
  const [rutina, plan, completadosHoy, ultimoProgreso] = await Promise.all([
    prisma.rutina.findFirst({
      where: {
        alumnoId,
        activa: true,
        vigenciaDesde: { lte: now },
        OR: [{ vigenciaHasta: null }, { vigenciaHasta: { gte: now } }],
      },
      include: {
        dias: {
          include: { ejercicios: { orderBy: { orden: 'asc' } } },
          orderBy: { orden: 'asc' },
        },
      },
    }),
    prisma.planNutricional.findFirst({
      where: {
        alumnoId,
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
    }),
    prisma.ejercicioCompletado.findMany({
      where: {
        alumnoId,
        fecha: { gte: startOfDay, lt: endOfDay },
      },
    }),
    prisma.progreso.findFirst({
      where: { alumnoId },
      orderBy: { fecha: 'desc' },
    }),
  ])

  const tieneRutina = !!rutina
  const tienePlan = !!plan
  const sinNada = !tieneRutina && !tienePlan

  // Calcular stats
  const diasConRutina = rutina?.dias ?? []
  const diaHoyRutina = diasConRutina.find((d) => d.dia === hoyEnum)
  const ejerciciosHoy = diaHoyRutina?.ejercicios ?? []
  const completadosSet = new Set(completadosHoy.map((c) => c.ejercicioId))

  // Día actual de la semana y cuántos días tiene la rutina
  const hoyIndex = DIAS_ORDEN.indexOf(hoyEnum)
  const diasRutinaOrdenados = diasConRutina
    .map((d) => DIAS_ORDEN.indexOf(d.dia))
    .sort((a, b) => a - b)
  const diaActualNum = diasRutinaOrdenados.filter((i) => i <= hoyIndex).length
  const totalDias = diasConRutina.length

  // Próxima sesión
  let proximaSesion = 'Sin sesiones'
  if (tieneRutina && diasConRutina.length > 0) {
    if (diaHoyRutina) {
      proximaSesion = 'Hoy'
    } else {
      const proximoDia = diasRutinaOrdenados.find((i) => i > hoyIndex) ?? diasRutinaOrdenados[0]
      const diaEnum = DIAS_ORDEN[proximoDia]
      proximaSesion = DIAS_LABEL[diaEnum] ?? diaEnum
    }
  }

  // Plan del día
  const diaHoyPlan = plan?.dias.find((d) => d.dia === hoyEnum)
  const comidasHoy = diaHoyPlan?.comidas ?? []

  // Stats cards
  const statCards = [
    {
      label: 'Semana actual',
      value: tieneRutina ? `Día ${diaActualNum} de ${totalDias}` : '—',
      sub: tieneRutina ? rutina.nombre : 'Sin rutina asignada',
    },
    {
      label: 'Calorías objetivo',
      value: tienePlan && plan.kcalObjetivo ? plan.kcalObjetivo.toLocaleString('es-PY') : '—',
      sub: tienePlan ? 'kcal / día' : 'Sin plan nutricional',
    },
    {
      label: 'Próxima sesión',
      value: proximaSesion,
      sub: diaHoyRutina ? (diaHoyRutina.nombre ?? diaHoyRutina.tipo ?? '') : '',
    },
  ]

  // Progress semanal (ejercicios completados por día esta semana)
  const startOfWeek = new Date(now)
  const dayOfWeek = now.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  startOfWeek.setDate(now.getDate() + mondayOffset)
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 7)

  const completadosSemana = await prisma.ejercicioCompletado.findMany({
    where: {
      alumnoId,
      fecha: { gte: startOfWeek, lt: endOfWeek },
    },
  })

  const diasLetras = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
  const progressData = diasLetras.map((letter, i) => {
    const targetDate = new Date(startOfWeek)
    targetDate.setDate(startOfWeek.getDate() + i)
    const nextDate = new Date(targetDate)
    nextDate.setDate(targetDate.getDate() + 1)

    const count = completadosSemana.filter((c) => {
      const f = new Date(c.fecha)
      return f >= targetDate && f < nextDate
    }).length

    // Buscar cuántos ejercicios tiene ese día en la rutina
    const diaEnum = DIAS_ORDEN[i]
    const rutinaDia = diasConRutina.find((d) => d.dia === diaEnum)
    const totalEj = rutinaDia?.ejercicios.length ?? 0
    const value = totalEj > 0 ? Math.round((count / totalEj) * 100) : 0

    return { day: letter, value }
  })

  const sesionesConRutina = diasConRutina.length
  const sesionesHechas = progressData.filter((d) => d.value > 0).length
  const porcentajeSemanal = sesionesConRutina > 0 ? Math.round((sesionesHechas / sesionesConRutina) * 100) : 0

  const today = new Date().toLocaleDateString('es-PY', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="space-y-6">
      {/* Sin nada asignado */}
      {sinNada && (
        <div
          className="rounded-2xl p-8 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(255,170,25,0.12) 0%, rgba(255,170,25,0.04) 100%)',
            border: '1px solid rgba(255,170,25,0.2)',
          }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
            <path d="M14.4 14.4 9.6 9.6" />
            <path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z" />
            <path d="m21.5 21.5-1.4-1.4" />
            <path d="M3.9 3.9 2.5 2.5" />
            <path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829z" />
          </svg>
          <p className="text-lg font-bold mb-2" style={{ color: '#fff', fontFamily: 'var(--font-heading)' }}>
            Todavía no tenés rutinas ni plan nutricional
          </p>
          <p className="text-sm" style={{ color: 'var(--gym-muted)' }}>
            Contactá a tu entrenador/a para que te asigne un plan de entrenamiento y nutrición.
          </p>
        </div>
      )}

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
        {/* Rutina de hoy */}
        <div className="lg:col-span-2 space-y-6">
          <div
            className="rounded-2xl p-5"
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
                Rutina de Hoy
              </h2>
              {diaHoyRutina && diaHoyRutina.tipo && (
                <span
                  className="inline-flex items-center rounded-full px-3 py-1 text-[0.65rem] font-bold uppercase"
                  style={{
                    background: 'rgba(255, 170, 25, 0.15)',
                    color: 'var(--primary)',
                  }}
                >
                  {diaHoyRutina.tipo}
                </span>
              )}
            </div>

            {!tieneRutina ? (
              <div className="py-6 text-center">
                <p className="text-sm" style={{ color: 'var(--gym-muted)' }}>
                  No tenés una rutina asignada todavía.
                </p>
              </div>
            ) : ejerciciosHoy.length === 0 ? (
              <div className="py-6 text-center">
                <span className="text-4xl block mb-2">&#128564;</span>
                <p className="text-sm" style={{ color: 'var(--gym-muted)' }}>
                  Hoy es día de descanso. Recuperate y volvé con todo.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {ejerciciosHoy.map((ej) => {
                  const done = completadosSet.has(ej.id)
                  const detalle = ej.duracionMin
                    ? `${ej.series ?? 1} x ${ej.duracionMin}min`
                    : ej.distanciaKm
                      ? `${ej.distanciaKm}km`
                      : `${ej.series ?? 0}x${ej.repsMin ?? 0}${ej.repsMax && ej.repsMax !== ej.repsMin ? `-${ej.repsMax}` : ''}`

                  return (
                    <div
                      key={ej.id}
                      className="flex items-center gap-3 rounded-xl px-4 py-3"
                      style={{
                        background: 'var(--gym-surface-alt)',
                        opacity: done ? 0.5 : 1,
                      }}
                    >
                      <div
                        className="flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center"
                        style={{
                          background: done ? 'var(--primary)' : 'transparent',
                          border: done ? 'none' : '2px solid rgba(255,255,255,0.15)',
                        }}
                      >
                        {done && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium"
                          style={{
                            color: done ? 'var(--gym-muted)' : '#ffffff',
                            textDecoration: done ? 'line-through' : 'none',
                          }}
                        >
                          {ej.nombre}
                        </p>
                      </div>
                      <span
                        className="text-xs font-semibold flex-shrink-0"
                        style={{ color: 'var(--gym-muted)' }}
                      >
                        {detalle}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Plan del dia */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: 'var(--gym-surface)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <h2
              className="text-lg font-bold mb-4"
              style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
            >
              Plan del Día
            </h2>

            {!tienePlan ? (
              <div className="py-6 text-center">
                <p className="text-sm" style={{ color: 'var(--gym-muted)' }}>
                  No tenés un plan nutricional asignado todavía.
                </p>
              </div>
            ) : comidasHoy.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-sm" style={{ color: 'var(--gym-muted)' }}>
                  No hay plan nutricional cargado para hoy.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {comidasHoy.map((comida) => (
                  <div
                    key={comida.id}
                    className="rounded-xl px-4 py-3"
                    style={{ background: 'var(--gym-surface-alt)' }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p
                        className="text-sm font-bold"
                        style={{
                          color: 'var(--primary)',
                          fontFamily: 'var(--font-heading)',
                        }}
                      >
                        {comida.nombre}
                      </p>
                      {comida.hora && (
                        <span
                          className="text-[0.65rem]"
                          style={{ color: 'var(--gym-muted)' }}
                        >
                          {comida.hora}
                        </span>
                      )}
                    </div>
                    <ul className="space-y-1">
                      {comida.alimentos.map((alimento) => (
                        <li
                          key={alimento.id}
                          className="text-xs flex items-center gap-2"
                          style={{ color: 'rgba(255,255,255,0.7)' }}
                        >
                          <span
                            className="w-1 h-1 rounded-full flex-shrink-0"
                            style={{ background: 'var(--primary)' }}
                          />
                          {alimento.nombre} — {alimento.cantidad}{alimento.unidad}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar derecha */}
        <div className="space-y-6">
          {/* Mini grafico de progreso */}
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
              Progreso Semanal
            </h3>
            <div className="flex items-end gap-2 h-24">
              {progressData.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full relative" style={{ height: '80px' }}>
                    <div
                      className="absolute bottom-0 w-full rounded-t-md transition-all"
                      style={{
                        height: `${d.value}%`,
                        background:
                          d.value > 0
                            ? 'var(--primary)'
                            : 'rgba(255,255,255,0.05)',
                        opacity: d.value > 0 ? 1 : 0.3,
                      }}
                    />
                  </div>
                  <span
                    className="text-[0.6rem] font-medium"
                    style={{ color: 'var(--gym-muted)' }}
                  >
                    {d.day}
                  </span>
                </div>
              ))}
            </div>
            <div
              className="mt-3 flex items-center justify-between text-xs"
              style={{ color: 'var(--gym-muted)' }}
            >
              <span>{sesionesHechas} de {sesionesConRutina} sesiones</span>
              <span style={{ color: 'var(--primary)' }}>{porcentajeSemanal}%</span>
            </div>
          </div>

          {/* Último progreso */}
          {ultimoProgreso && (
            <div
              className="rounded-2xl p-5"
              style={{
                background: 'var(--gym-surface)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <h3
                className="text-sm font-bold mb-3"
                style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
              >
                Última Medición
              </h3>
              <div className="space-y-2">
                {ultimoProgreso.pesoKg != null && (
                  <div className="flex justify-between text-xs">
                    <span style={{ color: 'var(--gym-muted)' }}>Peso</span>
                    <span style={{ color: 'var(--primary)' }}>{ultimoProgreso.pesoKg} kg</span>
                  </div>
                )}
                {ultimoProgreso.grasaCorporal != null && (
                  <div className="flex justify-between text-xs">
                    <span style={{ color: 'var(--gym-muted)' }}>Grasa</span>
                    <span style={{ color: '#ffffff' }}>{ultimoProgreso.grasaCorporal}%</span>
                  </div>
                )}
                {ultimoProgreso.masaMuscularKg != null && (
                  <div className="flex justify-between text-xs">
                    <span style={{ color: 'var(--gym-muted)' }}>Masa muscular</span>
                    <span style={{ color: '#ffffff' }}>{ultimoProgreso.masaMuscularKg} kg</span>
                  </div>
                )}
              </div>
              <p className="text-[0.6rem] mt-2" style={{ color: 'var(--gym-muted)' }}>
                {ultimoProgreso.fecha.toLocaleDateString('es-PY', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          )}

          {/* Mensaje motivacional */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: 'linear-gradient(135deg, rgba(255,170,25,0.12) 0%, rgba(255,170,25,0.04) 100%)',
              border: '1px solid rgba(255,170,25,0.2)',
            }}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">&#128170;</span>
              <div>
                <p
                  className="text-sm font-medium mb-1"
                  style={{ color: '#ffffff' }}
                >
                  &laquo;Vamos con todo! Cada repetición cuenta. Estás más
                  cerca de tu objetivo.&raquo;
                </p>
                <p
                  className="text-xs font-bold"
                  style={{ color: 'var(--primary)' }}
                >
                  &mdash; Tu entrenador/a
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
