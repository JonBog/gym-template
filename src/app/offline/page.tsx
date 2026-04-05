'use client'

export default function OfflinePage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: '#0a0a0a', color: '#ffffff' }}
    >
      {/* Brand name */}
      <p
        className="text-sm font-semibold tracking-widest uppercase mb-10"
        style={{ color: '#ffaa19' }}
      >
        DDR Fitness Club
      </p>

      {/* Icon */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-8"
        style={{ backgroundColor: '#1a1a1a' }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffaa19"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="1" y1="1" x2="23" y2="23" />
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
          <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <line x1="12" y1="20" x2="12.01" y2="20" />
        </svg>
      </div>

      {/* Heading */}
      <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
        Sin conexión
      </h1>

      {/* Description */}
      <p className="text-base max-w-xs leading-relaxed mb-10" style={{ color: '#999999' }}>
        No pudimos cargar la página. Verificá tu conexión a internet e intentá de nuevo.
      </p>

      {/* Retry button */}
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="px-8 py-3 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80 active:opacity-60"
        style={{ backgroundColor: '#ffaa19', color: '#0a0a0a' }}
      >
        Reintentar
      </button>
    </div>
  )
}
