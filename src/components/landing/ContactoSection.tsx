import type { GymConfig } from '@/types/gym'
import ContactForm from './ContactForm'
import ScrollReveal from './ScrollReveal'
import DDRPattern from './DDRPattern'

export default function ContactoSection({ config }: { config: GymConfig }) {
  return (
    <section id="contacto" className="relative py-24" style={{ background: 'var(--gym-bg)' }}>
      <DDRPattern opacity={0.03} />
      <div className="relative max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-[1fr_1.2fr] gap-16 items-start">

          {/* Left */}
          <ScrollReveal direction="left">
            <div className="md:sticky md:top-24">
              <span
                className="block text-[0.75rem] font-black uppercase tracking-[0.25em] mb-3"
                style={{ color: 'var(--primary)', fontFamily: 'var(--font-heading, inherit)' }}
              >
                ¿Listo para empezar?
              </span>
              <h2
                className="font-black uppercase text-white mb-6"
                style={{ fontFamily: 'var(--font-heading, inherit)', fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', lineHeight: 1 }}
              >
                Hablemos
              </h2>
              <p className="leading-[1.75] mb-10 max-w-[38ch]" style={{ color: 'var(--gym-muted)' }}>
                Mandanos un mensaje y te armamos un plan a medida.
                Sin compromiso, sin vueltas.
              </p>

              <div className="flex flex-col gap-4">
                {config.instagram && (
                  <a
                    href={`https://www.instagram.com/${config.instagram}/`}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 transition-colors hover:text-white text-sm font-bold uppercase tracking-widest"
                    style={{ color: 'var(--gym-muted)', fontFamily: 'var(--font-heading, inherit)' }}
                  >
                    <svg className="w-5 h-5 flex-shrink-0" style={{ stroke: 'var(--primary)' }}
                      xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                    </svg>
                    @{config.instagram}
                  </a>
                )}
                {config.facebook && (
                  <a
                    href={`https://www.facebook.com/${config.facebook}/`}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 transition-colors hover:text-white text-sm font-bold uppercase tracking-widest"
                    style={{ color: 'var(--gym-muted)', fontFamily: 'var(--font-heading, inherit)' }}
                  >
                    <svg className="w-5 h-5 flex-shrink-0" style={{ stroke: 'var(--primary)' }}
                      xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                    </svg>
                    DDR Fitness Club
                  </a>
                )}
              </div>

              <div className="mt-12 pt-10" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <p
                  className="font-black uppercase tracking-widest"
                  style={{ color: 'var(--primary)', fontFamily: 'var(--font-heading, inherit)', fontSize: '1.5rem' }}
                >
                  ¡Vamos con todo!
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Form */}
          <ScrollReveal direction="right">
            <div
              className="rounded-2xl p-8 border"
              style={{ background: 'var(--gym-surface)', borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <ContactForm whatsapp={config.whatsapp} />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
