import config from '../../../gym.config'
import LogoBadge from '@/components/landing/LogoBadge'
import DDRPattern from '@/components/landing/DDRPattern'
import LoginForm from './LoginForm'

export const metadata = {
  title: `Iniciar sesión — ${config.nombre}`,
}

export default function LoginPage() {
  return (
    <div
      className="min-h-svh flex items-center justify-center relative overflow-hidden p-6"
      style={{ background: 'var(--gym-bg)' }}
    >
      {/* Background pattern */}
      <DDRPattern opacity={0.02} />

      {/* Glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, var(--primary-glow) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <LogoBadge size="lg" variant="light" />
          <h1
            className="font-black uppercase text-white text-xl tracking-widest mt-5"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {config.nombre}
          </h1>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8 border"
          style={{ background: 'var(--gym-surface)', borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <div className="text-center mb-8">
            <h2
              className="text-2xl font-black uppercase text-white"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Bienvenido de vuelta
            </h2>
            <p className="text-sm mt-2" style={{ color: 'var(--gym-muted)' }}>
              Accedé a tus rutinas y plan nutricional
            </p>
          </div>

          <LoginForm />
        </div>

        {/* Footer link */}
        <p className="text-center mt-6 text-xs" style={{ color: 'var(--gym-muted)' }}>
          <a href="/" className="transition-colors hover:text-white">
            ← Volver al sitio
          </a>
        </p>
      </div>
    </div>
  )
}
