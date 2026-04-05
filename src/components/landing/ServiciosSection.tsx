import type { GymConfig } from '@/types/gym'
import ScrollReveal from './ScrollReveal'
import DDRPattern from './DDRPattern'

const icons = [
  <svg key="0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
    <path d="M6.5 6.5h11M6.5 17.5h11M3 12h18M12 3v18"/>
  </svg>,
  <svg key="1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>,
  <svg key="2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
    <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
    <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
  </svg>,
]

export default function ServiciosSection({ config }: { config: GymConfig }) {
  return (
    <section id="servicios" className="relative py-24" style={{ background: 'var(--gym-bg)' }}>
      <DDRPattern opacity={0.03} />
      <div className="relative max-w-6xl mx-auto px-6">

        <ScrollReveal>
          <div className="text-center mb-16">
            <span
              className="block text-[0.75rem] font-black uppercase tracking-[0.25em] mb-3"
              style={{ color: 'var(--primary)', fontFamily: 'var(--font-heading, inherit)' }}
            >
              Lo que hacemos
            </span>
            <h2
              className="font-black uppercase text-white"
              style={{ fontFamily: 'var(--font-heading, inherit)', fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', lineHeight: 1 }}
            >
              Servicios
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-5">
          {config.servicios.map((servicio, i) => (
            <ScrollReveal key={servicio.nombre} delay={i * 100} direction="up">
              <div
                className="relative rounded-2xl p-8 flex flex-col h-full border transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: servicio.destacado ? 'var(--gym-surface-alt)' : 'var(--gym-surface)',
                  borderColor: servicio.destacado ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                  transform: servicio.destacado ? 'translateY(-8px)' : undefined,
                }}
              >
                {servicio.badgeText && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-[0.7rem] font-black uppercase tracking-widest px-4 py-1.5 rounded-full whitespace-nowrap"
                    style={{ backgroundColor: 'var(--primary)', fontFamily: 'var(--font-heading, inherit)' }}
                  >
                    {servicio.badgeText}
                  </span>
                )}

                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                  style={{ background: 'rgba(255,170,25,0.1)', color: 'var(--primary)' }}
                >
                  {icons[i]}
                </div>

                <h3
                  className="text-xl font-black uppercase text-white mb-3"
                  style={{ fontFamily: 'var(--font-heading, inherit)' }}
                >
                  {servicio.nombre}
                </h3>

                <p className="text-sm leading-relaxed mb-6 flex-1" style={{ color: 'var(--gym-muted)' }}>
                  {servicio.descripcion}
                </p>

                <ul
                  className="flex flex-col gap-3 pt-5 mb-8"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {servicio.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm" style={{ color: 'var(--gym-muted)' }}>
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: 'var(--primary)' }}
                      />
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href="#contacto"
                  className="mt-auto inline-flex items-center justify-center py-3 px-6 text-sm font-black uppercase tracking-wider text-white rounded-lg transition-opacity hover:opacity-90"
                  style={{ backgroundColor: 'var(--primary)', fontFamily: 'var(--font-heading, inherit)' }}
                >
                  Quiero este plan
                </a>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
