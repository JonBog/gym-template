import Image from 'next/image'
import type { GymConfig, GymCoach } from '@/types/gym'
import ScrollReveal from './ScrollReveal'

export default function CoachSection({ config }: { config: GymConfig }) {
  const { coaches } = config
  if (coaches.length === 0) return null

  return (
    <section id="sobre-mi" className="py-24" style={{ background: 'var(--gym-surface)' }}>
      <div className="max-w-6xl mx-auto px-6">

        <ScrollReveal>
          <div className="text-center mb-16">
            <span
              className="block text-[0.75rem] font-black uppercase tracking-[0.25em] mb-3"
              style={{ color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}
            >
              {coaches.length === 1 ? 'Tu entrenador/a' : 'Nuestro equipo'}
            </span>
            <h2
              className="font-black uppercase text-white"
              style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', lineHeight: 1 }}
            >
              {coaches.length === 1 ? coaches[0].nombre : 'Los coaches'}
            </h2>
            {coaches.length > 1 && (
              <p className="mt-4 max-w-lg mx-auto" style={{ color: 'var(--gym-muted)' }}>
                Un equipo de profesionales dedicados a que alcances tu mejor versión.
              </p>
            )}
          </div>
        </ScrollReveal>

        {/* Grid de coaches */}
        <div
          className={`grid gap-6 ${
            coaches.length === 1 ? 'max-w-md mx-auto' :
            coaches.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
            coaches.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
            'grid-cols-1 md:grid-cols-2'
          }`}
        >
          {coaches.map((coach, i) => (
            <ScrollReveal key={coach.nombre} delay={i * 120} direction="up">
              <CoachCard coach={coach} featured={i === 0} />
            </ScrollReveal>
          ))}
        </div>

        {/* CTA */}
        <ScrollReveal>
          <div className="text-center mt-14">
            <a
              href="#contacto"
              className="inline-flex items-center gap-2 px-8 py-4 text-sm font-black uppercase tracking-wider text-white rounded-md transition-all hover:-translate-y-0.5"
              style={{
                backgroundColor: 'var(--primary)',
                fontFamily: 'var(--font-heading)',
                boxShadow: '0 8px 24px var(--primary-glow)',
              }}
            >
              Quiero entrenar con el equipo DDR
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

function CoachCard({ coach, featured }: { coach: GymCoach; featured: boolean }) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 group h-full flex flex-col"
      style={{
        background: 'var(--gym-surface-alt)',
        borderColor: featured ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
      }}
    >
      {/* Foto */}
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        {coach.fotoUrl ? (
          <Image
            src={coach.fotoUrl}
            alt={coach.nombre}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <svg
              className="w-16 h-16"
              style={{ color: 'rgba(255,255,255,0.08)' }}
              xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="1"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, var(--gym-surface-alt) 0%, transparent 60%)' }}
        />

        {/* Título badge */}
        <div className="absolute bottom-3 left-4">
          <span
            className="text-[0.65rem] font-black uppercase tracking-widest px-3 py-1.5 rounded-md"
            style={{
              backgroundColor: featured ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
              color: '#fff',
              fontFamily: 'var(--font-heading)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {coach.titulo}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        {/* Nombre */}
        <h3
          className="font-black uppercase text-white text-xl mb-3"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {coach.nombre}
        </h3>

        {/* Especialidades */}
        <div className="flex flex-wrap gap-2 mb-5">
          {coach.especialidades.map((esp) => (
            <span
              key={esp}
              className="px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider rounded-full border"
              style={{ color: 'var(--primary)', borderColor: 'rgba(255,255,255,0.1)' }}
            >
              {esp}
            </span>
          ))}
        </div>

        {/* Bio */}
        <div className="flex-1">
          {coach.bio.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed mb-2" style={{ color: 'var(--gym-muted)' }}>
              {p}
            </p>
          ))}
        </div>
      </div>

      {/* Accent line */}
      {featured && (
        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{ background: 'var(--primary)' }}
        />
      )}
    </div>
  )
}
