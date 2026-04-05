import LogoBadge from './LogoBadge'
import type { GymConfig } from '@/types/gym'

export default function Footer({ config }: { config: GymConfig }) {
  return (
    <footer
      className="py-10"
      style={{ background: 'var(--gym-surface)', borderTop: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <LogoBadge size="sm" variant="light" />
          <span
            className="font-black text-xs tracking-widest text-white"
            style={{ fontFamily: 'var(--font-heading, inherit)' }}
          >
            DDR FITNESS CLUB
          </span>
        </div>

        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          © {new Date().getFullYear()} {config.nombre} — {config.ciudad}, {config.pais}
        </p>

        <p
          className="font-black text-sm uppercase tracking-widest"
          style={{ color: 'var(--primary)', fontFamily: 'var(--font-heading, inherit)' }}
        >
          {config.tagline.toUpperCase()}
        </p>
      </div>
    </footer>
  )
}
