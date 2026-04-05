'use client'

import { useState } from 'react'

const objetivos = [
  { value: 'perder-peso',       label: 'Perder peso' },
  { value: 'ganar-musculo',     label: 'Ganar músculo' },
  { value: 'mejorar-condicion', label: 'Mejorar condición física' },
  { value: 'nutricion',         label: 'Solo nutrición' },
  { value: 'plan-integral',     label: 'Plan integral (todo)' },
]

export default function ContactForm({ whatsapp }: { whatsapp: string }) {
  const [form, setForm] = useState({ nombre: '', whatsapp: '', objetivo: '', mensaje: '' })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = [
      `Hola! Soy *${form.nombre}*.`,
      `Mi objetivo es: *${objetivos.find(o => o.value === form.objetivo)?.label ?? form.objetivo}*.`,
      form.mensaje ? `\n${form.mensaje}` : '',
      `\nMi WhatsApp: ${form.whatsapp}`,
    ].filter(Boolean).join('\n')

    const url = `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  const inputStyle: React.CSSProperties = {
    background: 'var(--gym-surface)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 6,
    padding: '14px 16px',
    color: '#fff',
    fontSize: '0.95rem',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    fontFamily: 'inherit',
    WebkitAppearance: 'none',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--gym-muted)',
    marginBottom: 6,
    fontFamily: 'var(--font-heading, inherit)',
  }

  function onFocus(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    e.target.style.borderColor = 'var(--primary)'
    e.target.style.boxShadow = '0 0 0 3px var(--primary-glow)'
  }
  function onBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    e.target.style.borderColor = 'rgba(255,255,255,0.08)'
    e.target.style.boxShadow = 'none'
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label style={labelStyle}>Tu nombre</label>
        <input type="text" required placeholder="¿Cómo te llamás?"
          value={form.nombre}
          onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
          style={inputStyle} onFocus={onFocus} onBlur={onBlur}
        />
      </div>

      <div>
        <label style={labelStyle}>WhatsApp</label>
        <input type="tel" required placeholder="+595 XXX XXX XXX"
          value={form.whatsapp}
          onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
          style={inputStyle} onFocus={onFocus} onBlur={onBlur}
        />
      </div>

      <div>
        <label style={labelStyle}>¿Cuál es tu objetivo?</label>
        <select required value={form.objetivo}
          onChange={e => setForm(f => ({ ...f, objetivo: e.target.value }))}
          style={{ ...inputStyle, cursor: 'pointer' }}
          onFocus={onFocus} onBlur={onBlur}
        >
          <option value="" disabled style={{ background: 'var(--gym-surface-alt)' }}>Seleccioná una opción</option>
          {objetivos.map(o => (
            <option key={o.value} value={o.value} style={{ background: 'var(--gym-surface-alt)' }}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label style={labelStyle}>
          Contame más{' '}
          <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
            (opcional)
          </span>
        </label>
        <textarea rows={3} placeholder="¿Alguna lesión? ¿Experiencia previa? ¿Disponibilidad?"
          value={form.mensaje}
          onChange={e => setForm(f => ({ ...f, mensaje: e.target.value }))}
          style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
          onFocus={onFocus} onBlur={onBlur}
        />
      </div>

      <button
        type="submit"
        className="w-full flex items-center justify-center gap-2 py-4 text-sm font-black uppercase tracking-wider text-white rounded-lg transition-all hover:-translate-y-0.5"
        style={{
          backgroundColor: 'var(--primary)',
          fontFamily: 'var(--font-heading, inherit)',
          boxShadow: '0 8px 24px var(--primary-glow)',
        }}
      >
        Enviar por WhatsApp
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.4 2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17z"/>
        </svg>
      </button>
    </form>
  )
}
