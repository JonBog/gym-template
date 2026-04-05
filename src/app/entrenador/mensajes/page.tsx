export default function MensajesPage() {
  return (
    <div className="space-y-6">
      <h2
        className="text-2xl font-bold"
        style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
      >
        Mensajes
      </h2>

      <div
        className="rounded-2xl p-12 text-center"
        style={{
          background: 'var(--gym-surface)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full mb-6"
          style={{ background: 'var(--gym-surface-alt)' }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: 'var(--primary)' }}
          >
            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
          </svg>
        </div>

        <h3
          className="text-xl font-bold mb-2"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary)' }}
        >
          Próximamente
        </h3>

        <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--gym-muted)' }}>
          Los mensajes directos con tus alumnos estarán disponibles pronto.
          Podrás comunicarte, enviar indicaciones y resolver dudas en tiempo real.
        </p>
      </div>
    </div>
  )
}
