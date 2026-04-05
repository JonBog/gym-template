import LogoBadge from './LogoBadge'
import DDRPattern from './DDRPattern'
import type { GymConfig } from '@/types/gym'

export default function HeroSection({ config }: { config: GymConfig }) {
  const { hero } = config

  return (
    <section
      id="inicio"
      className="relative min-h-svh flex flex-col overflow-hidden"
      style={{ background: 'var(--gym-bg)' }}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
        }}
      />

      {/* DDR pattern */}
      <DDRPattern opacity={0.025} />

      {/* Glow spot */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, var(--primary-glow) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Main content */}
      <div className="relative flex-1 flex items-center justify-center pt-[72px]">
        <div className="max-w-6xl mx-auto px-6 py-20 w-full">

          {/* Logo */}
          <div className="mb-8">
            <LogoBadge size="lg" variant="light" />
          </div>

          {/* Eyebrow */}
          <p
            className="text-xs font-bold uppercase tracking-[0.3em] mb-5"
            style={{ color: 'var(--primary)', fontFamily: 'var(--font-heading, inherit)' }}
          >
            {hero.eyebrow}
          </p>

          {/* Title */}
          <h1
            className="font-black uppercase leading-[0.93] mb-6"
            style={{
              fontFamily: 'var(--font-heading, inherit)',
              fontSize: 'clamp(3rem, 8vw, 6.5rem)',
              letterSpacing: '-0.01em',
              maxWidth: '15ch',
            }}
          >
            Tu mejor versión
            <br />
            <em className="not-italic" style={{ color: 'var(--primary)' }}>empieza acá.</em>
          </h1>

          {/* Description */}
          <p
            className="mb-10 max-w-[42ch] leading-[1.7]"
            style={{ color: 'var(--gym-muted)', fontSize: 'clamp(1rem, 2vw, 1.2rem)' }}
          >
            {hero.subtitulo}
            <br />
            <strong className="text-white">Sin excusas. Sin límites.</strong>
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 mb-12">
            <a
              href="#contacto"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-black uppercase tracking-wider text-white rounded-md transition-all hover:-translate-y-0.5"
              style={{
                backgroundColor: 'var(--primary)',
                fontFamily: 'var(--font-heading, inherit)',
                boxShadow: '0 8px 24px var(--primary-glow)',
              }}
            >
              Quiero empezar
            </a>
            <a
              href="#sobre-mi"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-black uppercase tracking-wider text-white rounded-md transition-all hover:border-white/40 hover:bg-white/5"
              style={{ border: '2px solid rgba(255,255,255,0.12)', fontFamily: 'var(--font-heading, inherit)' }}
            >
              Conocé a tu coach
            </a>
          </div>

          {/* Stats */}
          <div
            className="flex flex-wrap items-center gap-6 pt-8"
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
          >
            {hero.stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-6">
                <div>
                  <span
                    className="block font-black leading-none"
                    style={{ color: 'var(--primary)', fontFamily: 'var(--font-heading, inherit)', fontSize: '2rem' }}
                  >
                    {stat.valor}
                  </span>
                  <span
                    className="block text-[0.72rem] uppercase tracking-widest mt-1"
                    style={{ color: 'var(--gym-muted)' }}
                  >
                    {stat.label}
                  </span>
                </div>
                {i < hero.stats.length - 1 && (
                  <div className="w-px h-10" style={{ background: 'rgba(255,255,255,0.08)' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tagline strip — marquee sin fin */}
      <div
        style={{
          overflow: 'hidden',
          padding: '16px 0',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: 'max-content',
            animation: 'marquee-scroll 30s linear infinite',
            willChange: 'transform',
          }}
        >
          {[0, 1].map((copy) => (
            <div
              key={copy}
              aria-hidden={copy === 1}
              style={{ display: 'flex', flexShrink: 0, alignItems: 'center' }}
            >
              {Array.from({ length: 15 }).map((_, i) => (
                <span
                  key={i}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    whiteSpace: 'nowrap',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.2em',
                    color: 'var(--gym-muted)',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 900,
                    padding: '0 16px',
                  }}
                >
                  VAMOS CON TODO
                  <span style={{ color: 'var(--primary)', marginLeft: 20 }}>·</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
