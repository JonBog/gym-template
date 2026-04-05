import ScrollReveal from './ScrollReveal'

const dias = [
  { day: 'LUN', title: 'Lower Body',    desc: 'Piernas, glúteos y core',          tag: 'Fuerza',    active: false },
  { day: 'MIÉ', title: 'Upper Body',    desc: 'Pecho, espalda, hombros y brazos', tag: 'Fuerza',    active: true  },
  { day: 'VIE', title: 'Full Body',     desc: 'Trabajo completo funcional',        tag: 'Funcional', active: false },
  { day: 'SAB', title: 'Cardio + Core', desc: 'Resistencia y definición',          tag: 'Cardio',    active: false },
]

const ejercicios = [
  { num: '01', nombre: 'Jalón al pecho agarre abierto',  detalle: '4 series × 12 reps — 4 ladrillos' },
  { num: '02', nombre: 'Remo en máquina agarre neutro',  detalle: '4 series × 12 reps — 3-4 ladrillos' },
  { num: '03', nombre: 'Hombro posterior en máquina',    detalle: '4 series × 10 reps — 2-3 ladrillos' },
  { num: '04', nombre: 'Tríceps en polea con barra',     detalle: '4 series × 12 reps — 3-4 ladrillos' },
  { num: '05', nombre: 'Máquina Fondo de Tríceps',       detalle: '4 series × 12 reps — 12,5–15 kg por lado' },
]

export default function RutinasSection() {
  return (
    <section id="rutinas" className="py-24" style={{ background: 'var(--gym-surface)' }}>
      <div className="max-w-6xl mx-auto px-6">

        <ScrollReveal>
          <div className="text-center mb-16">
            <span
              className="block text-[0.75rem] font-black uppercase tracking-[0.25em] mb-3"
              style={{ color: 'var(--primary)', fontFamily: 'var(--font-heading, inherit)' }}
            >
              Ejemplo de trabajo
            </span>
            <h2
              className="font-black uppercase text-white"
              style={{ fontFamily: 'var(--font-heading, inherit)', fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', lineHeight: 1 }}
            >
              Rutina Semanal
            </h2>
            <p className="mt-3 text-sm" style={{ color: 'var(--gym-muted)' }}>
              Un vistazo a cómo estructuramos el entrenamiento
            </p>
          </div>
        </ScrollReveal>

        {/* Day cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          {dias.map((d, i) => (
            <ScrollReveal key={d.day} delay={i * 80} direction="up">
              <div
                className="rounded-xl p-5 flex flex-col gap-2 border transition-all duration-300 hover:-translate-y-1 h-full"
                style={{
                  background: 'var(--gym-surface-alt)',
                  borderColor: d.active ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                }}
              >
                <span
                  className="text-[0.7rem] font-black uppercase tracking-widest"
                  style={{ color: 'var(--primary)', fontFamily: 'var(--font-heading, inherit)' }}
                >
                  {d.day}
                </span>
                <div>
                  <p className="font-black text-white text-base uppercase" style={{ fontFamily: 'var(--font-heading, inherit)' }}>
                    {d.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{d.desc}</p>
                </div>
                <span
                  className="self-start text-[0.65rem] font-black uppercase tracking-wider px-2.5 py-1 rounded-sm mt-1"
                  style={{
                    background: d.active ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
                    color: d.active ? '#fff' : 'var(--gym-muted)',
                    fontFamily: 'var(--font-heading, inherit)',
                  }}
                >
                  {d.tag}
                </span>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Exercise sample */}
        <ScrollReveal>
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ background: 'var(--gym-surface-alt)', borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <div className="px-8 py-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span
                className="block text-[0.7rem] font-black uppercase tracking-widest mb-1"
                style={{ color: 'var(--primary)', fontFamily: 'var(--font-heading, inherit)' }}
              >
                Miércoles — Upper Body
              </span>
              <h3
                className="text-xl font-black uppercase text-white"
                style={{ fontFamily: 'var(--font-heading, inherit)' }}
              >
                Ejemplo de rutina real
              </h3>
            </div>

            <ol>
              {ejercicios.map((ej, i) => (
                <li
                  key={ej.num}
                  className="flex items-center gap-5 px-8 py-4"
                  style={{
                    borderBottom: i < ejercicios.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  }}
                >
                  <span
                    className="flex-shrink-0 text-xl font-black tabular-nums opacity-50"
                    style={{ color: 'var(--primary)', fontFamily: 'var(--font-heading, inherit)', minWidth: 32 }}
                  >
                    {ej.num}
                  </span>
                  <div>
                    <p
                      className="font-bold text-white text-sm uppercase tracking-wide"
                      style={{ fontFamily: 'var(--font-heading, inherit)' }}
                    >
                      {ej.nombre}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--gym-muted)' }}>{ej.detalle}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="px-8 py-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-sm text-right" style={{ color: 'var(--gym-muted)', fontFamily: 'var(--font-heading, inherit)' }}>
                Cualquier consulta, a las órdenes —{' '}
                <strong style={{ color: 'var(--primary)' }}>¡VAMOS CON TODO!</strong>
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
