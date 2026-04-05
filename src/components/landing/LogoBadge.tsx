type LogoBadgeProps = {
  size?: 'sm' | 'md' | 'lg'
  // En dark bg: blanco con texto negro. En claro: naranja con texto blanco.
  variant?: 'light' | 'primary'
}

const sizes = {
  sm: { wrapper: 'w-11 h-12', ddr: 'text-[0.75rem]', sub: 'text-[0.27rem]' },
  md: { wrapper: 'w-14 h-[60px]', ddr: 'text-[0.95rem]', sub: 'text-[0.32rem]' },
  lg: { wrapper: 'w-24 h-[104px]', ddr: 'text-[1.6rem]',  sub: 'text-[0.5rem]'  },
}

export default function LogoBadge({ size = 'md', variant = 'light' }: LogoBadgeProps) {
  const s = sizes[size]
  const bg   = variant === 'light' ? '#ffffff' : 'var(--primary)'
  const text = variant === 'light' ? '#0a0a0a' : '#ffffff'

  return (
    <div
      className={`${s.wrapper} flex flex-col items-center justify-center leading-none select-none flex-shrink-0`}
      style={{
        backgroundColor: bg,
        color: text,
        clipPath: 'polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)',
        fontFamily: 'var(--font-heading, inherit)',
      }}
    >
      <span className={`${s.ddr} font-black tracking-[0.05em]`}>DDR</span>
      <span className={`${s.sub} font-bold tracking-[0.05em] text-center`} style={{ lineHeight: 1.1 }}>
        FITNESS CLUB
      </span>
    </div>
  )
}
