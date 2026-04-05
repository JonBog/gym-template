'use client'

import { useState, useEffect } from 'react'
import LogoBadge from './LogoBadge'
import type { GymConfig } from '@/types/gym'

export default function NavBar({ config }: { config: Pick<GymConfig, 'nombre'> }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { href: '#sobre-mi',  label: 'Coach' },
    { href: '#servicios', label: 'Servicios' },
    { href: '#rutinas',   label: 'Rutinas' },
    { href: '#contacto',  label: 'Contacto' },
  ]

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(10,10,10,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-[72px] flex items-center justify-between">
        <a href="#inicio" className="flex items-center gap-3">
          <LogoBadge size="sm" variant="light" />
          <span
            className="font-black text-xs tracking-widest text-white hidden sm:block"
            style={{ fontFamily: 'var(--font-heading, inherit)' }}
          >
            DDR FITNESS CLUB
          </span>
        </a>

        <ul className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-xs font-bold uppercase tracking-widest transition-colors"
                style={{ color: 'var(--gym-muted)', fontFamily: 'var(--font-heading, inherit)' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--gym-muted)')}
              >
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="#contacto"
              className="text-xs font-black uppercase tracking-widest text-white px-5 py-2.5 rounded-md transition-opacity hover:opacity-80"
              style={{ backgroundColor: 'var(--primary)', fontFamily: 'var(--font-heading, inherit)' }}
            >
              Empezá hoy
            </a>
          </li>
        </ul>

        <button
          className="md:hidden flex flex-col gap-[5px] p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menú"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block w-6 h-[2px] rounded-sm transition-all duration-300"
              style={{
                backgroundColor: '#fff',
                transform: menuOpen
                  ? i === 0 ? 'rotate(45deg) translateY(7px)'
                  : i === 1 ? 'scaleX(0)'
                  : 'rotate(-45deg) translateY(-7px)'
                  : 'none',
                opacity: menuOpen && i === 1 ? 0 : 1,
              }}
            />
          ))}
        </button>
      </div>

      {menuOpen && (
        <div
          className="md:hidden px-6 py-4 flex flex-col gap-3 border-b"
          style={{
            background: 'rgba(10,10,10,0.97)',
            borderColor: 'rgba(255,255,255,0.08)',
          }}
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-bold uppercase tracking-widest py-3 border-b"
              style={{ color: 'var(--gym-muted)', borderColor: 'rgba(255,255,255,0.06)', fontFamily: 'var(--font-heading, inherit)' }}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contacto"
            className="text-sm font-black uppercase tracking-widest text-white text-center py-3 rounded-md mt-2"
            style={{ backgroundColor: 'var(--primary)', fontFamily: 'var(--font-heading, inherit)' }}
            onClick={() => setMenuOpen(false)}
          >
            Empezá hoy
          </a>
        </div>
      )}
    </nav>
  )
}
